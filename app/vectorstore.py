# app/vectorstore.py
import json
from pathlib import Path

from langchain_qdrant import QdrantVectorStore
from langchain_core.documents import Document
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from app.config import settings
from app.llm import get_embeddings

COLLECTION = "nhs_health_data"
VECTOR_SIZE = 1536


def _sanitize_metadata(meta: dict) -> dict:
    sanitized = {}
    for k, v in meta.items():
        if v is None:
            sanitized[k] = ""
        elif isinstance(v, (str, int, float, bool)):
            sanitized[k] = v
        else:
            sanitized[k] = str(v)
    return sanitized


def _load_chunks_from_jsonl() -> list[Document]:
    chunks_path = Path(settings.CHUNKS_PATH)

    if not chunks_path.exists():
        raise FileNotFoundError(
            f"Chunks file not found: {chunks_path}\n"
            "Run ingestion/chunking.py first."
        )

    docs: list[Document] = []
    bad_lines = 0

    with open(chunks_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                row = json.loads(line)
                text = row.get("text", "").strip()
                if not text:
                    continue
                meta = row.get("metadata", {})
                if "chunk_id" in row:
                    meta["chunk_id"] = row["chunk_id"]
                docs.append(Document(
                    page_content=text,
                    metadata=_sanitize_metadata(meta),
                ))
            except json.JSONDecodeError:
                bad_lines += 1

    if bad_lines:
        print(f"[vectorstore] ⚠️  Skipped {bad_lines} malformed lines")

    if not docs:
        raise ValueError(f"No chunks loaded from {chunks_path}")

    print(f"[vectorstore] ✅ Loaded {len(docs)} chunks from {chunks_path.name}")
    return docs


def _get_qdrant_client() -> QdrantClient:
    """Single place to build the authenticated Qdrant client."""
    if not settings.QDRANT_API_KEY:
        raise ValueError("QDRANT_API_KEY is not set in environment variables")
    if not settings.QDRANT_URL:
        raise ValueError("QDRANT_URL is not set in environment variables")

    print(f"[vectorstore] Connecting to Qdrant Cloud: {settings.QDRANT_URL}")
    return QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
    )


def _is_collection_populated(client: QdrantClient) -> bool:
    try:
        result = client.get_collection(COLLECTION)
        count = result.points_count
        print(f"[vectorstore] Found existing collection — {count} chunks")
        return count > 0
    except Exception as e:
        print(f"[vectorstore] ⚠️  Could not check collection: {type(e).__name__}: {e}")
        raise RuntimeError(
            f"Cannot connect to Qdrant Cloud. "
            f"Check QDRANT_URL and QDRANT_API_KEY env vars.\n"
            f"Original error: {e}"
        )


def _embed_and_persist(
    chunks: list[Document],
    client: QdrantClient,
) -> QdrantVectorStore:
    embeddings = get_embeddings()
    BATCH_SIZE = 100
    total = len(chunks)

    client.recreate_collection(
        collection_name=COLLECTION,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
    )
    print(f"[vectorstore] Collection created: {COLLECTION}")

    # First batch
    first_batch = chunks[:BATCH_SIZE]
    vs = QdrantVectorStore.from_documents(
        documents=first_batch,
        embedding=embeddings,
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY,
        collection_name=COLLECTION,
    )
    print(f"[vectorstore]   → batch 1/{-(-total // BATCH_SIZE)} done ({len(first_batch)} chunks)")

    # Remaining batches
    for i, start in enumerate(range(BATCH_SIZE, total, BATCH_SIZE), start=2):
        batch = chunks[start: start + BATCH_SIZE]
        vs.add_documents(batch)
        total_batches = -(-total // BATCH_SIZE)
        print(f"[vectorstore]   → batch {i}/{total_batches} done ({len(batch)} chunks)")

    print(f"[vectorstore] ✅ Persisted {total} chunks to Qdrant Cloud: {settings.QDRANT_URL}")
    return vs


def get_vectorstore(rebuild: bool = False) -> QdrantVectorStore:
    client = _get_qdrant_client()
    embeddings = get_embeddings()

    # Production path — collection already populated in Qdrant Cloud
    if not rebuild and _is_collection_populated(client):
        print(f"[vectorstore] ✅ Loading existing Qdrant Cloud collection: {COLLECTION}")
        return QdrantVectorStore(
            client=client,
            collection_name=COLLECTION,
            embedding=embeddings,
        )

    # Local/dev path — rebuild explicitly requested
    if rebuild:
        print("[vectorstore] rebuild=True — wiping collection...")
        try:
            client.delete_collection(COLLECTION)
            print("[vectorstore] Old collection deleted")
        except Exception:
            pass
        chunks = _load_chunks_from_jsonl()
        return _embed_and_persist(chunks, client)

    # Should never reach here in production
    raise RuntimeError(
        "[vectorstore] ❌ Collection is empty and rebuild=False.\n"
        "Run locally with rebuild=True to ingest data into Qdrant Cloud first."
    )


if __name__ == "__main__":
    import traceback
    try:
        vs = get_vectorstore(rebuild=True)
        client = _get_qdrant_client()
        count = client.get_collection(COLLECTION).points_count
        print(f"\n✅ Done — {count} chunks in Qdrant Cloud")
    except Exception as e:
        print(f"\n❌ Failed: {type(e).__name__}: {e}")
        traceback.print_exc()