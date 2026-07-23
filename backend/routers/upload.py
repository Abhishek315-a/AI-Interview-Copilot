import os
import uuid
import shutil
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.resume_parser import load_resume_documents, get_resume_text
from services.rag_service import index_resume
from services.session_manager import set_session

router = APIRouter()
logger = logging.getLogger(__name__)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def upload_resume(
    file: UploadFile = File(...),
    job_description: str = Form(default="")
):
    if not (file.filename.endswith(".pdf") or file.filename.endswith(".docx")):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")

    session_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{session_id}_{file.filename}")

    # Save temporarily
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Parse and index into Qdrant
    documents = load_resume_documents(file_path)
    resume_text = get_resume_text(file_path)
    index_resume(session_id, documents)

    # Delete local file — no longer needed after RAG indexing
    os.remove(file_path)
    logger.info(f"Indexed and removed resume file for session {session_id}")

    # Store session in Redis
    set_session(session_id, {
        "resume_text": resume_text,
        "job_description": job_description,
        "qa_pairs": []
    })

    return {
        "session_id": session_id,
        "message": "Resume uploaded and indexed successfully.",
        "pages_indexed": len(documents)
    }
