import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
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

app.include_router(FindDoctors.router)
app.include_router(AI_chat.router)
app.include_router(report_explainer.router)
app.include_router(Health_plan.router)
app.include_router(symptomschecker.router)

@app.get("/", tags=["Health"])
async def root():
    return {"status": "Healthcare API running"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=False,
    )
