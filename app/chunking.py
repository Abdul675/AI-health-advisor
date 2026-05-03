# ingestion/chunking.py
# Hybrid chunking (structure-aware + boundary snapping) using LangChain.
#
# Input:  NHS section-level Documents from loader.py
# Output: JSONL chunks saved to settings.CHROMA_DIR/../chunks/
#
# Run:
#   python ingestion/chunking.py

from __future__ import annotations

import json
import os
import re
from datetime import datetime
from typing import Dict, List, Tuple

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import settings
from app.loader import load_nhs_pages_jsonl_as_section_documents

_WS_RE = re.compile(r"\s+")
_SENT_BOUNDARY_RE = re.compile(r"([.!?])\s")


# ----------------------------
# Text helpers
# ----------------------------

def _norm_ws(text: str) -> str:
    return _WS_RE.sub(" ", text).strip()


def _snap_end_to_sentence_boundary(text: str, *, window: int = 160) -> str:
    if len(text) < 50:
        return text
    tail = text[-window:]
    matches = list(_SENT_BOUNDARY_RE.finditer(tail))
    if not matches:
        return text
    last = matches[-1]
    cut_idx_in_tail = last.end()
    new_len = len(text) - len(tail) + cut_idx_in_tail
    snapped = text[:new_len].rstrip()
    return snapped if len(snapped) >= 40 else text


def _ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def _write_jsonl(path: str, rows: List[Dict]) -> None:
    with open(path, "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def _write_json(path: str, obj: Dict) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)


# ----------------------------
# Core chunking logic
# ----------------------------

def chunk_documents_hybrid_langchain(
    docs: List[Document],
    cfg=None,  # accepts settings.CHUNKING (a ChunkingConfig instance)
) -> List[Document]:
    """
    1) Keeps small section-docs as-is
    2) Uses LangChain RecursiveCharacterTextSplitter for larger ones
    3) Applies sentence-boundary snapping at the end of each chunk
    4) Preserves metadata + adds chunk_id / char ranges
    """
    if cfg is None:
        cfg = settings.CHUNKING

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=cfg.chunk_size,
        chunk_overlap=cfg.chunk_overlap,
        separators=list(cfg.separators),
        length_function=len,
        add_start_index=True,
    )

    chunked: List[Document] = []
    chunk_counter = 0

    for d in docs:
        text = d.page_content or ""
        text = _norm_ws(text)
        if not text:
            continue

        # Keep small docs intact
        if len(text) < cfg.keep_as_is_under:
            meta = dict(d.metadata or {})
            meta["chunk_id"] = f"chunk_{chunk_counter:07d}"
            meta["chunk_method"] = "keep_section"
            meta["chunk_char_start"] = 0
            meta["chunk_char_end"] = len(text)
            chunked.append(Document(page_content=text, metadata=meta))
            chunk_counter += 1
            continue

        # Split large docs with LangChain
        pieces = splitter.split_documents(
            [Document(page_content=text, metadata=dict(d.metadata or {}))]
        )

        for p in pieces:
            p_text = _norm_ws(p.page_content)
            if not p_text:
                continue

            snapped = _snap_end_to_sentence_boundary(p_text, window=cfg.snap_window)

            meta = dict(p.metadata or {})
            start_idx = meta.get("start_index", None)
            if isinstance(start_idx, int):
                meta["chunk_char_start"] = start_idx
                meta["chunk_char_end"] = start_idx + len(snapped)

            meta["chunk_id"] = f"chunk_{chunk_counter:07d}"
            meta["chunk_method"] = "recursive_split+snap"

            chunked.append(Document(page_content=snapped, metadata=meta))
            chunk_counter += 1

    return chunked


# ----------------------------
# Save chunks to disk
# ----------------------------

def save_chunks(
    *,
    output_dir: str = None,
    cfg=None,
) -> Tuple[str, str]:
    """
    Loads docs from settings.JSONL_PATH, chunks them, saves JSONL + stats.
    Returns (chunks_jsonl_path, stats_json_path)
    """
    if cfg is None:
        cfg = settings.CHUNKING

    if output_dir is None:
        # Save chunks next to chroma_db for easy co-location
        output_dir = os.path.join(os.path.dirname(settings.CHROMA_DIR), "chunks")

    docs = load_nhs_pages_jsonl_as_section_documents(settings.JSONL_PATH, min_chars=60)
    print(f"📄 Loaded {len(docs)} section documents")

    chunks = chunk_documents_hybrid_langchain(docs, cfg)
    print(f"✂️  Generated {len(chunks)} chunks")

    _ensure_dir(output_dir)
    chunks_path = os.path.join(output_dir, "chunks.jsonl")
    stats_path = os.path.join(output_dir, "chunk_stats.json")

    # Build rows + collect stats
    rows: List[Dict] = []
    lengths: List[int] = []
    by_disease: Dict[str, int] = {}

    for c in chunks:
        meta = dict(c.metadata or {})
        disease = meta.get("disease") or "UNKNOWN"
        by_disease[disease] = by_disease.get(disease, 0) + 1

        content = c.page_content
        lengths.append(len(content))

        rows.append({
            "chunk_id": meta.get("chunk_id"),
            "text": content,
            "metadata": meta,
        })

    _write_jsonl(chunks_path, rows)

    # Write stats
    stats = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "jsonl_source": str(settings.JSONL_PATH),
        "output_dir": os.path.normpath(output_dir),
        "cfg": {
            "chunk_size": cfg.chunk_size,
            "chunk_overlap": cfg.chunk_overlap,
            "keep_as_is_under": cfg.keep_as_is_under,
            "snap_window": cfg.snap_window,
            "separators": list(cfg.separators),
        },
        "counts": {
            "section_docs_in": len(docs),
            "chunks_out": len(chunks),
        },
        "lengths_chars": {
            "min": min(lengths) if lengths else 0,
            "max": max(lengths) if lengths else 0,
            "avg": round(sum(lengths) / len(lengths), 1) if lengths else 0,
        },
        "chunks_by_disease_top20": sorted(
            by_disease.items(), key=lambda x: x[1], reverse=True
        )[:20],
    }

    _write_json(stats_path, stats)

    print(f"✅ Chunks written to : {chunks_path}")
    print(f"✅ Stats written to  : {stats_path}")

    return chunks_path, stats_path


# ----------------------------
# Entrypoint
# ----------------------------

if __name__ == "__main__":
    save_chunks()