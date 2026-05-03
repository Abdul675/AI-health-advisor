# app/schemas.py
from pydantic import BaseModel, Field
from typing import Optional


class MedicalResponse(BaseModel):
    direct_answer: str = Field(
        description="One sentence direct answer to the question"
    )
    symptoms: Optional[list[str]] = Field(
        default=None,
        description="List of symptoms if the question is about symptoms"
    )
    treatments: Optional[list[str]] = Field(
        default=None,
        description="List of treatments or medications if relevant"
    )
    lifestyle_tips: Optional[list[str]] = Field(
        default=None,
        description="Daily life or lifestyle recommendations if relevant"
    )
    when_to_seek_help: Optional[str] = Field(
        default=None,
        description="When to seek urgent medical attention if relevant"
    )
    summary: str = Field(
        description="2-3 sentence summary of the full answer"
    )
    out_of_scope: bool = Field(
        default=False,
        description="True if question is outside supported diseases or non-medical"
    )