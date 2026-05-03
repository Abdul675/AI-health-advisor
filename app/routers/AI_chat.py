# app/routers/ai_chat.py
import asyncio
import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.llm import get_llm
from app.retriever import get_retriever
from app.chain import build_rag_chain

router = APIRouter(prefix="/chat", tags=["AI Chat"])
logger = logging.getLogger(__name__)

# --- Module-level singletons (initialised once on startup) ---
# get_retriever() calls get_vectorstore() internally
# so no need to import vectorstore here at all
_llm = get_llm()
_retriever = get_retriever()          # uses settings.QDRANT_URL + settings.CHUNKS_PATH
_rag_chain = build_rag_chain(_retriever, _llm)


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    POST /chat
    Body   : { "message": "What are the symptoms of type 2 diabetes?" }
    Returns: { "response": "..." }
    """
    try:
        logger.info("Chat request: %s", req.message[:120])

        answer = await asyncio.wait_for(
            _rag_chain.ainvoke({"question": req.message}),
            timeout=45,
        )

        logger.info("Chat response generated successfully")
        return ChatResponse(response=answer)

    except asyncio.TimeoutError as exc:
        logger.warning("Chat request timed out")
        raise HTTPException(
            status_code=504,
            detail="Request timed out waiting for retrieval or model response.",
        ) from exc

    except Exception as e:
        logger.exception("Chat failed: %s", e)
        return JSONResponse(
            status_code=500,
            content={"detail": f"RAG chain error: {str(e)}"},
        )


@router.get("/health", tags=["Debug"])
def chat_health():
    """Quick liveness check — confirms router + chain are initialised."""
    try:
        from qdrant_client import QdrantClient
        from app.config import settings
        client = QdrantClient(url=settings.QDRANT_URL)
        count = client.get_collection("nhs_health_data").points_count
        return {"status": "ok", "qdrant_chunks": count}
    except Exception as e:
        return {"status": "degraded", "error": str(e)}