# app/retriever.py — only this import changes
from app.vectorstore import get_vectorstore  # same function, same interface

def get_retriever(k: int = 5):
    vs = get_vectorstore()
    return vs.as_retriever(
        search_type="mmr",
        search_kwargs={"k": k, "fetch_k": k * 4, "lambda_mult": 0.7},
    )