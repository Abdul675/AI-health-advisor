import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
from app.routers import FindDoctors
from app.routers import AI_chat
from app.routers import report_explainer
from app.routers import Health_plan
from app.routers import symptomschecker

load_dotenv()

app = FastAPI(title="Healthcare App", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise Exception("MONGO_URI not set in environment variables")

client: AsyncIOMotorClient = None

@app.on_event("startup")
async def startup():
    global client
    client = AsyncIOMotorClient(MONGO_URI)
    app.state.db_client = client
    print("MongoDB connected")

@app.on_event("shutdown")
async def shutdown():
    client.close()
    print("MongoDB disconnected")

# ── API Routers first (must be before static mount) ──
app.include_router(FindDoctors.router)
app.include_router(AI_chat.router)
app.include_router(report_explainer.router)
app.include_router(Health_plan.router)
app.include_router(symptomschecker.router)

# ── Serve index.html at root ──
@app.get("/", response_class=FileResponse)
async def serve_frontend():
    return FileResponse("/app/index.html")

# ── Serve all JS, CSS, and other static files ──
app.mount("/", StaticFiles(directory="/app", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8080,
        reload=False,
    )