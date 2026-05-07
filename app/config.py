import os
from dataclasses import dataclass, field
from typing import Tuple
from pathlib import Path
from dotenv import load_dotenv

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
    # REQUIRED ENV VARS (NO DEFAULTS)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")

    MONGO_URI: str = os.getenv("MONGO_URI")
    QDRANT_URL: str = os.getenv("QDRANT_URL")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY")

    # Paths (optional local only)
    JSONL_PATH: Path = Path(os.getenv("JSONL_PATH", "data/pages.jsonl"))
    CHUNKS_PATH: Path = Path(os.getenv("CHUNKS_PATH", "chunks/chunks.jsonl"))

    CHUNKING: ChunkingConfig = ChunkingConfig(
        chunk_size=int(os.getenv("CHUNK_SIZE", 1100)),
        chunk_overlap=int(os.getenv("CHUNK_OVERLAP", 180)),
        keep_as_is_under=int(os.getenv("CHUNK_KEEP_AS_IS_UNDER", 900)),
        snap_window=int(os.getenv("CHUNK_SNAP_WINDOW", 160)),
    )


# Safety check (VERY IMPORTANT)
settings = Settings()
if not settings.QDRANT_URL:
    raise ValueError("QDRANT_URL is not set in environment variables")

if not settings.MONGO_URI:
    raise ValueError("MONGO_URI is not set in environment variables")



if not settings.OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is not set in environment variables")