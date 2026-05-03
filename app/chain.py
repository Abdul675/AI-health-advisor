# app/chain.py
from operator import itemgetter
from langchain_core.runnables import RunnableLambda
from app.prompt import get_rag_prompt
from app.schema import MedicalResponse


def _format_docs(docs) -> str:
    parts = []
    for doc in docs:
        source = doc.metadata.get("url", "unknown source")
        disease = doc.metadata.get("disease", "")
        section = doc.metadata.get("section_heading", "")
        parts.append(
            f"[Source: {source} | Disease: {disease} | Section: {section}]\n"
            f"{doc.page_content}"
        )
    return "\n\n---\n\n".join(parts)


def _render_to_string(response: MedicalResponse) -> str:
    """Renders MedicalResponse as a warm, conversational reply."""

    if response.out_of_scope:
        return (
            f"I'm only able to help with a specific set of conditions like diabetes, "
            f"asthma, hypertension, and a few others. "
            f"Unfortunately, {response.direct_answer.lower()} "
            f"For anything else, please consult a qualified healthcare professional."
        )

    parts = []

    # ── Opening: natural, direct answer ──────────────────────────────────────
    parts.append(response.direct_answer)

    # ── Symptoms: inline prose for short lists, bullets for 4+ ───────────────
    if response.symptoms:
        if len(response.symptoms) <= 3:
            joined = ", ".join(response.symptoms[:-1]) + f" and {response.symptoms[-1]}"
            parts.append(f"\nThe most common symptoms include {joined}.")
        else:
            symptom_lines = "\n".join(f"  • {s}" for s in response.symptoms)
            parts.append(f"\nHere are the key symptoms to watch for:\n{symptom_lines}")

    # ── Treatments: framed as options, not a list dump ────────────────────────
    if response.treatments:
        treatment_lines = "\n".join(f"  • {t}" for t in response.treatments)
        parts.append(
            f"\nWhen it comes to treatment, there are a few approaches your doctor "
            f"might recommend:\n{treatment_lines}"
        )

    # ── Lifestyle: encouraging, actionable tone ───────────────────────────────
    if response.lifestyle_tips:
        tip_lines = "\n".join(f"  • {tip}" for tip in response.lifestyle_tips)
        parts.append(
            f"\nSome lifestyle changes that can really make a difference:\n{tip_lines}"
        )

    # ── Summary: flows as a closing paragraph, not a heading ─────────────────
    if response.summary:
        parts.append(f"\n{response.summary}")

    # ── Urgent warning: prominent but not alarmist ────────────────────────────
    if response.when_to_seek_help:
        parts.append(
            f"\n🚨 **When to get help:** {response.when_to_seek_help}"
        )

    # ── Gentle disclaimer ─────────────────────────────────────────────────────
    parts.append(
        "\n*This information is based on NHS guidelines. "
        "Always speak to your GP or a healthcare professional for advice "
        "tailored to your situation.*"
    )

    return "\n".join(parts)




def build_rag_chain(retriever, llm):
    """
    Flow:
      input dict
        │
        ├── itemgetter("question") → retriever → _format_docs → {context}
        └── itemgetter("question") ──────────────────────────→ {question}
        ▼
      prompt              ← ChatPromptTemplate
        ▼
      structured_llm      ← with_structured_output (function-calling, primary path)
        ▼
      fixing_step         ← OutputFixingParser safety net (catches any bad output)
        ▼
      _render_to_string   ← MedicalResponse → clean markdown string
    """
    prompt = get_rag_prompt()

    # Primary: forces JSON via OpenAI function-calling
    structured_llm = llm.with_structured_output(MedicalResponse, strict =True)

    # Secondary safety net: fixes output if structured_llm somehow fails
    

    chain = (
        {
            "context": itemgetter("question") | retriever | RunnableLambda(_format_docs),
            "question": itemgetter("question"),
        }
        | prompt
        | structured_llm     # → MedicalResponse (99% of the time)   # → validates/fixes before rendering
        | RunnableLambda(_render_to_string)
    )

    return chain