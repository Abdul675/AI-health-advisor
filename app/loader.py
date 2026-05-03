# ingestion/loader.py
# Simplified loader: reads directly from JSONL_PATH defined in settings.py
# (no more data/runs folder resolution)
#
# Usage:
#   from loader import load_nhs_pages_jsonl_as_section_documents
#   from config import settings
#
#   docs = load_nhs_pages_jsonl_as_section_documents(settings.JSONL_PATH)

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Dict, List, Union

from langchain_core.documents import Document

_WS_RE = re.compile(r"\s+")


# ----------------------------
# Loading / cleaning
# ----------------------------

def _clean_text(text: str) -> str:
    if not text:
        return ""
    return _WS_RE.sub(" ", text).strip()


def load_nhs_pages_jsonl_as_section_documents(
    jsonl_path: Union[str, Path],
    *,
    min_chars: int = 80,
    include_full_text_fallback: bool = True,
) -> List[Document]:
    """
    Loads NHS pages from a flat JSONL file and returns one LangChain Document
    per section (best for retrieval granularity).

    Falls back to full_text if a page has no sections or all sections are too short.

    Args:
        jsonl_path:               Direct path to the .jsonl dataset file.
                                  Typically settings.JSONL_PATH from config.py.
        min_chars:                Ignore sections shorter than this.
        include_full_text_fallback: If True, use full_text when sections are missing.

    Returns:
        List of LangChain Documents with rich metadata.
    """
    jsonl_path = Path(jsonl_path).resolve()

    if not jsonl_path.exists():
        raise FileNotFoundError(
            f"JSONL dataset not found: {jsonl_path}\n"
            "Set JSONL_PATH in your .env file, e.g.:\n"
            "  JSONL_PATH=F:\\Desktop\\ai-health-adviser\\data\\pages.jsonl"
        )

    if not jsonl_path.suffix.lower() == ".jsonl":
        raise ValueError(
            f"Expected a .jsonl file, got: {jsonl_path}\n"
            "Check your JSONL_PATH setting."
        )

    docs: List[Document] = []
    bad_lines = 0

    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line_no, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue

            try:
                obj: Dict[str, Any] = json.loads(line)
            except json.JSONDecodeError:
                bad_lines += 1
                continue

            base_meta = {
                "source":       "NHS",
                "run_id":       obj.get("run_id"),
                "disease":      obj.get("disease"),
                "page_type":    obj.get("page_type"),
                "url":          obj.get("url"),
                "title":        obj.get("title"),
                "retrieved_at": obj.get("retrieved_at"),
                "line_no":      line_no,
                "pages_jsonl":  str(jsonl_path),
            }

            sections = obj.get("sections")
            made_any = False

            # --- Section-level documents (preferred) ---
            if isinstance(sections, dict) and sections:
                for heading, content in sections.items():
                    if not isinstance(content, str):
                        continue
                    content = _clean_text(content)
                    if len(content) < min_chars:
                        continue

                    meta = dict(base_meta)
                    meta["section_heading"] = heading
                    docs.append(Document(page_content=content, metadata=meta))
                    made_any = True

            # --- Fallback: use full_text if no valid sections found ---
            if not made_any and include_full_text_fallback:
                full_text = obj.get("full_text")
                if isinstance(full_text, str):
                    full_text = _clean_text(full_text)
                    if len(full_text) >= min_chars:
                        meta = dict(base_meta)
                        meta["section_heading"] = "FULL_TEXT"
                        docs.append(Document(page_content=full_text, metadata=meta))

    if bad_lines:
        print(f"⚠️  Skipped {bad_lines} malformed line(s) in {jsonl_path.name}")

    if not docs:
        raise ValueError(
            f"No documents loaded from: {jsonl_path}\n"
            f"bad_lines={bad_lines}. Check your JSONL structure or lower min_chars."
        )

    print(f"✅ Loaded {len(docs)} section documents from {jsonl_path.name}")
    return docs


# ----------------------------
# Quick test
# ----------------------------
if __name__ == "__main__":
    from config import settings

    docs = load_nhs_pages_jsonl_as_section_documents(settings.JSONL_PATH, min_chars=60)
    print("Total Documents:", len(docs))
    print("Path used:", docs[0].metadata["pages_jsonl"])
    print("Example metadata:", docs[0].metadata)
    print("Example content:", docs[0].page_content[:220], "...")