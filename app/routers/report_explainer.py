from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse  # noqa: F401
from typing import Optional, Literal
import pytesseract
from pydantic import BaseModel, Field
from PIL import Image
import pypdf
import io
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from app.llm import get_llm


router = APIRouter(prefix="/report", tags=["Report Explainer"])

llm = get_llm()
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# ─────────────────────────────────────────────
#  Helper — extract text from image using OCR
# ─────────────────────────────────────────────
class Reading(BaseModel):
    name: str = Field(description="Full test name on the report")
    value: str = Field(description="Patient value wih the units eg '5.2 g/dl'")
    range: str = Field(description="Normal reference range in units")
    status: Literal['Normal','High','Low','Critical']
    explanation: str = Field(description="What this test measures in simple words")
    advice: str = Field(description="What the patient should do or watch out for")
    
class LabReport(BaseModel):
    summary: str = Field(description="2-3 sentence plain English overall health summary")
    urgent: bool = Field(description="True if any value is critically abnormal")
    urgent_message: str = Field(
        description="Immediate action if urgent, empty string otherwise",
        default=""
    )
    readings: list[Reading] = Field(
        description="All lab values found in the report",
        default_factory=list
    )
    
    


def ocr_image(image_bytes: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(image_bytes))
        # Improve OCR accuracy — convert to grayscale
        image = image.convert("L")
        text = pytesseract.image_to_string(image, lang="eng")
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Image OCR failed: {str(e)}")

# ─────────────────────────────────────────────
#  Helper — extract text from PDF
# ─────────────────────────────────────────────
def extract_pdf_text(pdf_bytes: bytes) -> str:
    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        pages_text = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                pages_text.append(t)
        text = "\n".join(pages_text).strip()
        if not text:
            raise HTTPException(
                status_code=422,
                detail="PDF appears to be scanned/image-based. Please upload as JPG or PNG instead."
            )
        return text
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"PDF extraction failed: {str(e)}")

# ─────────────────────────────────────────────
#  Helper — build the LLM prompt
# ─────────────────────────────────────────────
chat_template = ChatPromptTemplate.from_messages([
    (
    "system",
    """
You are a friendly medical report explainer for patients in Pakistan.
Analyze the following lab report and return ONLY a valid JSON object — 
no markdown, no explanation outside the JSON, no code fences.
{format_instructions}

Rules:
- Extract EVERY lab value you can find in the report
- Use simple English a non-medical person can understand
- status must be exactly one of: normal, low, high, critical
- If a value is critically abnormal, set urgent to true
- If you cannot find any lab values, return readings as empty array and explain in summary
   """
),
    (
"human",
""" please analyze this report :\n\n{report_text}"""
),
    ])
parser = PydanticOutputParser(pydantic_object=LabReport)




# ─────────────────────────────────────────────
#  Helper — safely parse LLM JSON response
# ─────────────────────────────────────────────
chain = chat_template | llm | parser

# ─────────────────────────────────────────────
#  POST /report/explain
#  Accepts: multipart form — file (optional) + text (optional)
# ─────────────────────────────────────────────
@router.post("/explain")
async def explain_report(
    file: Optional[UploadFile] = File(None),
    text: Optional[str]        = Form(None),
):
    extracted_text = ""

    # ── 1. File uploaded ──────────────────────
    if file and file.filename:
        file_bytes = await file.read()
        content_type = file.content_type or ""

        if content_type.startswith("image/"):
            extracted_text = ocr_image(file_bytes)

        elif content_type == "application/pdf":
            extracted_text = extract_pdf_text(file_bytes)

        else:
            raise HTTPException(
                status_code=415,
                detail="Unsupported file type. Please upload a PDF, JPG, or PNG."
            )

    # ── 2. Pasted text ────────────────────────
    if text and text.strip():
        # Combine both if user uploaded AND pasted
        extracted_text = (extracted_text + "\n" + text).strip()

    # ── 3. Nothing provided ───────────────────
    if not extracted_text:
        raise HTTPException(
            status_code=400,
            detail="Please upload a file or paste report text."
        )

    # ── 4. Send to LLM ────────────────────────
    try:
        result = await chain.ainvoke({
        "report_text": extracted_text,
        "format_instructions": parser.get_format_instructions()
})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {str(e)}")

    # ── 5. Return structured result ───────────
    return {
        "extracted_text": extracted_text,   # frontend can show this for transparency
        "analysis": result.model_dump()
    }


# ─────────────────────────────────────────────
#  GET /report/health  — sanity check
# ─────────────────────────────────────────────
@router.get("/health", tags=["Debug"])
def report_health():
    try:
        pytesseract.get_tesseract_version()
        tesseract_ok = True
    except Exception:
        tesseract_ok = False

    return {
        "status": "Report Explainer router is running",
        "tesseract_installed": tesseract_ok,
        "endpoints": {
            "explain": "POST /report/explain  (file + text)"
        }
    }