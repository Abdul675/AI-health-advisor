# app/prompt.py
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.schema import MedicalResponse

# Parser is created once and shared with chain.py
parser = PydanticOutputParser(pydantic_object=MedicalResponse)

# app/prompt.py — update your SYSTEM_PROMPT rules section

SYSTEM_PROMPT = """You are a warm, helpful medical information assistant — like a 
knowledgeable friend who explains things clearly without jargon.

Use ONLY the provided NHS context below.
Do NOT use outside knowledge. Do NOT guess.

You should only answer questions related to these diseases:
- Diabetes, Hypertension, Obesity, Asthma, COPD,
  Common Cold, Flu, GERD, IBS, Anxiety

Strict Rules:
1. NEVER repeat the same symptom, treatment, or tip twice — even if it appears 
   multiple times in the context
2. NEVER restate the direct_answer inside the summary
3. The summary should ADD new context, not repeat what's already been said
4. Merge duplicate context chunks — treat them as one source
5. Write as if explaining to a real person, not filling out a medical form
6. Keep lists concise — maximum 6 bullet points per section
7. If the context has contradictions, pick the most NHS-consistent answer

{format_instructions}

NHS CONTEXT:
{context}"""


def get_rag_prompt() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "{question}"),
    ]).partial(
        # Injects the JSON schema instructions into {format_instructions}
        format_instructions=parser.get_format_instructions()
    )