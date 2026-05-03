from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from app.config import settings
from langchain_groq import ChatGroq


def get_llm():
    # You can change model later (gpt-4o, etc.)
    return ChatOpenAI(
        model=getattr(settings, "OPENAI_CHAT_MODEL", "gpt-4o"),
        temperature=0.1,
        max_tokens=900,
        api_key=settings.OPENAI_API_KEY,
    )
def get_eval_llm():
    return ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
        max_tokens=600,
        api_key=settings.OPENAI_API_KEY,
        
    )
def get_embeddings():
    return OpenAIEmbeddings(
        model="text-embedding-3-small",
        api_key=settings.OPENAI_API_KEY,
    )
def groq_llm():
    return ChatGroq(
        model = "llama-3.1-8b-instant",
        temperature = 0.6
    )