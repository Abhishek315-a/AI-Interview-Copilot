import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import upload, interview, feedback
from config import ALLOWED_ORIGINS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Interview Copilot",
    description="AI-powered mock interview platform with RAG and Groq LLM",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(upload.router,    prefix="/api/upload",    tags=["Upload"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])
app.include_router(feedback.router,  prefix="/api/feedback",  tags=["Feedback"])

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}
