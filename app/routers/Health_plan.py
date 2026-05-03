from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser  # ← add this
from app.llm import get_llm

router = APIRouter(prefix="/plan", tags=["Personalized Health Plan"])
llm = get_llm()

class PlanRequest(BaseModel):
    goal:      str
    goal_text: str
    diet:      str
    allergies: Optional[str] = "None"
    level:     str
    time:      int

PLAN_TEMPLATE = """You are an expert nutrition coach, health coach, and personal trainer.

A user needs a fully customized 7-day health plan. Use your professional expertise to design it.

User:
- Goal: {goal_text}
- Diet: {diet}
- Allergies: {allergies}
- Fitness Level: {level}
- Time per day: {time} mins

Rules:
- Use Pakistani foods where suitable
- Every recommendation must directly serve this user's goal and level
- Do NOT use generic templates — think like a real coach
- Return ONLY raw JSON — no markdown, no explanation, no code fences

Return this JSON structure:
{{
  "summary": "...",
  "nutrition": {{
    "daily_calories": "...",
    "macros": {{"protein": "35%", "carbs": "40%", "fats": "25%"}},
    "meals": [
      {{"time": "Breakfast", "name": "...", "description": "...", "calories": "..."}}
    ],
    "tips": ["tip1", "tip2"],
    "avoid": "..."
  }},
  "exercise": {{
    "weekly_schedule": [
      {{"day": "Monday", "focus": "...", "type": "strength|cardio|rest", "duration": "{time} mins"}}
    ],
    "sample_workout": [
      {{"phase": "Warm-up",   "duration": "5 mins",              "exercises": ["..."]}},
      {{"phase": "Main",      "duration": "{main_duration} mins", "exercises": ["..."]}},
      {{"phase": "Cool Down", "duration": "5 mins",              "exercises": ["..."]}}
    ],
    "tips": ["tip1", "tip2"]
  }},
  "hydration": "...",
  "sleep": "...",
  "warning": "..."
}}"""

plan_prompt = ChatPromptTemplate.from_template(PLAN_TEMPLATE)
parser = JsonOutputParser()                          # ← replaces parse_llm_json

plan_chain = plan_prompt | llm | parser              # ← parser added to chain

@router.post("/generate")
async def generate_plan(req: PlanRequest):
    try:
        plan = await plan_chain.ainvoke({            # ← directly a dict now
            "goal_text":     req.goal_text,
            "diet":          req.diet,
            "allergies":     req.allergies or "None",
            "level":         req.level,
            "time":          req.time,
            "main_duration": max(req.time - 10, 10),
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Plan generation failed: {str(e)}")

    return {"prefs": req.dict(), "plan": plan}

@router.get("/health", tags=["Debug"])
def plan_health():
    return {"status": "Personalized Plan router is running ✅"}