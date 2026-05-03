"""
Symptom Checker Router — FastAPI + LangChain (LCEL)
====================================================
FIX: OutputFixingParser removed entirely.
     It has broken import paths across LangChain versions and is
     not worth the dependency. Replaced with a clean manual retry
     that does the same thing: if JSON parsing fails, ask the LLM
     to fix it once before raising an error.

No functionality is lost — PydanticOutputParser still validates and
parses the output. The retry wrapper handles bad JSON responses.
"""

from __future__ import annotations

import json
import logging
from typing import Literal

from fastapi import APIRouter, HTTPException
from langchain_core.output_parsers import PydanticOutputParser  # only this needed
from langchain_core.prompts import (
    ChatPromptTemplate,
    FewShotChatMessagePromptTemplate,
)
from pydantic import BaseModel, Field, ValidationError

from app.llm import get_eval_llm

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/symptoms", tags=["Symptom Checker"])

llm = get_eval_llm()


# ---------------------------------------------------------------------------
# 1. Pydantic output schema
# ---------------------------------------------------------------------------

class Condition(BaseModel):
    name: str = Field(description="Medical condition name")
    likelihood: Literal["High", "Medium", "Low"] = Field(
        description="Qualitative likelihood"
    )
    likelihood_score: int = Field(
        ge=0, le=100, description="Numeric probability 0-100"
    )
    explanation: str = Field(description="Why this condition matches the symptoms")
    recommendation: str = Field(description="Actionable next steps for this condition")


class SymptomAnalysis(BaseModel):
    summary: str = Field(description="Plain-language summary of the likely diagnosis")
    urgency: Literal["low", "moderate", "high", "critical"] = Field(
        description="Overall urgency level"
    )
    urgency_message: str = Field(description="Short note on urgency and what to watch")
    conditions: list[Condition] = Field(
        min_length=1, max_length=5,
        description="Ranked differential diagnoses"
    )
    immediate_steps: list[str] = Field(description="What the patient should do right now")
    see_doctor_if: list[str] = Field(description="Red-flag symptoms that warrant a visit")
    disclaimer: str = Field(
        default=(
            "This is AI-generated information only and does not replace "
            "professional medical advice."
        )
    )


# ---------------------------------------------------------------------------
# 2. Parser — PydanticOutputParser only, no OutputFixingParser
# ---------------------------------------------------------------------------

_parser = PydanticOutputParser(pydantic_object=SymptomAnalysis)


# ---------------------------------------------------------------------------
# 3. Manual fixing prompt
#    Used only when the LLM returns malformed JSON on the first attempt.
#    Replaces what OutputFixingParser was doing internally.
# ---------------------------------------------------------------------------

_fix_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are a JSON fixer. The following JSON is malformed or does not "
        "match the required schema. Fix it and return ONLY valid raw JSON, "
        "no markdown, no explanation.\n\nRequired schema:\n{format_instructions}"
    ),
    ("human", "Malformed JSON:\n{bad_json}\n\nError:\n{error}"),
])


async def _parse_with_retry(raw: str) -> SymptomAnalysis:
    """
    Try to parse the LLM output. If it fails, ask the LLM to fix
    the JSON once, then try again. Raises HTTPException if both fail.

    This is exactly what OutputFixingParser does — but without the
    broken import.
    """
    try:
        return _parser.parse(raw)

    except (ValidationError, json.JSONDecodeError, Exception) as first_error:
        logger.warning("First parse failed: %s — attempting fix", first_error)

        try:
            fix_chain = _fix_prompt | llm
            fixed_msg = await fix_chain.ainvoke({
                "format_instructions": _parser.get_format_instructions(),
                "bad_json": raw,
                "error": str(first_error),
            })
            return _parser.parse(fixed_msg.content)

        except Exception as second_error:
            logger.error("Fix attempt also failed: %s", second_error)
            raise HTTPException(
                status_code=500,
                detail=f"Could not parse LLM response after retry: {second_error}"
            )


# ---------------------------------------------------------------------------
# 4. Few-shot examples
# ---------------------------------------------------------------------------

_EXAMPLES = [
    {
        "symptoms": (
            "I have a throbbing headache on the right side, "
            "nausea and sensitivity to light"
        ),
        "duration": "today",
        "output": """{
  "summary": "Your symptoms strongly suggest a migraine episode.",
  "urgency": "moderate",
  "urgency_message": "Not immediately dangerous but needs attention if pain worsens or vision changes occur.",
  "conditions": [
    {
      "name": "Migraine",
      "likelihood": "High",
      "likelihood_score": 88,
      "explanation": "One-sided throbbing headache with nausea and photophobia are hallmark migraine symptoms.",
      "recommendation": "Rest in a dark quiet room, stay hydrated, take prescribed migraine medication if available."
    },
    {
      "name": "Tension Headache",
      "likelihood": "Low",
      "likelihood_score": 30,
      "explanation": "Tension headaches are usually bilateral and dull rather than throbbing and one-sided.",
      "recommendation": "OTC pain relievers like paracetamol may help if migraine is ruled out."
    }
  ],
  "immediate_steps": ["Rest in a dark room", "Drink water", "Avoid screens", "Take pain relief if available"],
  "see_doctor_if": ["Vision changes or blurring", "Worst headache of your life", "Fever accompanies headache", "Symptoms persist beyond 72 hours"],
  "disclaimer": "This is AI-generated information only and does not replace professional medical advice."
}""",
    },
    {
        "symptoms": "Fever of 38.5, body aches, dry cough, sore throat and feeling very tired",
        "duration": "few_days",
        "output": """{
  "summary": "Your symptoms suggest influenza.",
  "urgency": "moderate",
  "urgency_message": "Monitor temperature closely. Seek immediate care if breathing becomes difficult.",
  "conditions": [
    {
      "name": "Influenza (Flu)",
      "likelihood": "High",
      "likelihood_score": 85,
      "explanation": "Classic flu presentation: sudden onset fever, myalgia, dry cough and significant fatigue.",
      "recommendation": "Rest, fluids, paracetamol for fever. Antiviral medication most effective within 48 hours."
    },
    {
      "name": "COVID-19",
      "likelihood": "Medium",
      "likelihood_score": 55,
      "explanation": "Symptom overlap with flu. Dry cough and fatigue common in both.",
      "recommendation": "Consider getting tested. Isolate until results are available."
    }
  ],
  "immediate_steps": ["Measure temperature every 4-6 hours", "Stay hydrated", "Rest completely", "Take paracetamol for fever above 38.5C"],
  "see_doctor_if": ["Fever above 40C", "Difficulty breathing", "Chest pain", "Symptoms worsen after day 5"],
  "disclaimer": "This is AI-generated information only and does not replace professional medical advice."
}""",
    },
]

_example_prompt = ChatPromptTemplate.from_messages([
    ("human", "symptoms={symptoms}, duration={duration}"),
    ("ai", "{output}"),
])

_few_shot_prompt = FewShotChatMessagePromptTemplate(
    example_prompt=_example_prompt,
    examples=_EXAMPLES,
)

_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        (
            "You are an experienced clinical doctor AI assistant.\n"
            "Analyze patient symptoms and return a structured JSON diagnosis report.\n"
            "Return ONLY raw JSON — no markdown, no code fences, no text outside JSON.\n\n"
            "Your response MUST conform to this schema exactly:\n"
            "{format_instructions}"
        ),
    ),
    _few_shot_prompt,
    ("human", "symptoms={symptoms}, duration={duration}"),
])


# ---------------------------------------------------------------------------
# 5. LCEL chain — prompt | llm only (parsing handled separately for retry)
# ---------------------------------------------------------------------------

_chain = _prompt | llm


# ---------------------------------------------------------------------------
# 6. Request model
# ---------------------------------------------------------------------------

class SymptomRequest(BaseModel):
    symptoms: str = Field(min_length=3, description="Free-text symptom description")
    duration: str = Field(description="How long symptoms have been present")


# ---------------------------------------------------------------------------
# 7. Routes
# ---------------------------------------------------------------------------

@router.post("/analyze", response_model=dict)
async def analyze_symptoms(req: SymptomRequest) -> dict:
    """
    Analyze patient symptoms and return a structured diagnosis.
    Parsing is done outside the chain so _parse_with_retry can
    handle bad JSON without OutputFixingParser.
    """
    try:
        raw_msg = await _chain.ainvoke({
            "symptoms": req.symptoms,
            "duration": req.duration,
            "format_instructions": _parser.get_format_instructions(),
        })

        result: SymptomAnalysis = await _parse_with_retry(raw_msg.content)

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Symptom chain failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc

    return {
        "symptoms": req.symptoms,
        "duration": req.duration,
        "analysis": result.model_dump(),
    }


@router.get("/health", tags=["Debug"])
def symptom_health() -> dict:
    return {"status": "Symptom Checker router is running"}