import os
from dotenv import load_dotenv
from pathlib import Path
from dataclasses import dataclass, field
from typing import Tuple

load_dotenv()


@dataclass
class ChunkingConfig:
    chunk_size: int = 1100
    chunk_overlap: int = 180
    keep_as_is_under: int = 900
    snap_window: int = 160
    separators: Tuple[str, ...] = field(
        default_factory=lambda: ("\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " ")
    )


class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    GROQ_API_KEY : str  = os.getenv("GROQ_API_KEY")

    # Path to your JSONL dataset file
    # Set in .env as:  JSONL_PATH=F:\Desktop\ai-health-adviser\data\pages.jsonl
    JSONL_PATH: Path = Path(os.getenv("JSONL_PATH", "")).resolve()
    # add this to your Settings class
    # add this to your Settings class
    CHUNKS_PATH: Path = Path(os.getenv("CHUNKS_PATH", "chunks/chunks.jsonl")).resolve()

    # Folder where ChromaDB will save chunks + vectors to disk
    # Auto-created on first run. Delete to force a full rebuild.
    # Set in .env as:  CHROMA_DIR=F:\Desktop\ai-health-adviser\chroma_db
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")

    # Chunking config — override individual fields via .env if needed
    CHUNKING: ChunkingConfig = ChunkingConfig(
        chunk_size=int(os.getenv("CHUNK_SIZE", 1100)),
        chunk_overlap=int(os.getenv("CHUNK_OVERLAP", 180)),
        keep_as_is_under=int(os.getenv("CHUNK_KEEP_AS_IS_UNDER", 900)),
        snap_window=int(os.getenv("CHUNK_SNAP_WINDOW", 160)),
    )


settings = Settings()