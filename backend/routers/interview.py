import os
import logging
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from models.schemas import GenerateQuestionsRequest, SubmitAnswerRequest
from services.question_chain import generate_questions
from services.tts_service import text_to_speech, cleanup_audio
from services.stt_service import transcribe_audio
from services.session_manager import get_session, update_session

router = APIRouter()
logger = logging.getLogger(__name__)

VOICE_DIR = "./voice_answers"
os.makedirs(VOICE_DIR, exist_ok=True)


@router.post("/generate-questions")
def generate_interview_questions(request: GenerateQuestionsRequest):
    session = get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Please upload resume first.")

    questions = generate_questions(
        session_id=request.session_id,
        job_description=session["job_description"],
        num_questions=request.num_questions
    )

    session["questions"] = questions
    session["current_index"] = 0
    update_session(request.session_id, session)

    return {
        "session_id": request.session_id,
        "questions": questions,
        "total": len(questions)
    }


@router.get("/question-audio/{session_id}/{question_index}")
def get_question_audio(
    session_id: str,
    question_index: int,
    background_tasks: BackgroundTasks
):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    questions = session.get("questions", [])
    if question_index >= len(questions):
        raise HTTPException(status_code=400, detail="Question index out of range.")

    audio_path = text_to_speech(questions[question_index])
    # Auto-delete .mp3 after serving — no disk buildup
    background_tasks.add_task(cleanup_audio, audio_path)

    return FileResponse(path=audio_path, media_type="audio/mpeg", filename="question.mp3")


@router.post("/transcribe")
async def transcribe_voice_answer(
    session_id: str = Form(...),
    audio: UploadFile = File(...)
):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    audio_path = os.path.join(VOICE_DIR, f"{session_id}_answer.webm")
    with open(audio_path, "wb") as f:
        f.write(await audio.read())

    transcript = transcribe_audio(audio_path)
    os.remove(audio_path)

    return {"transcript": transcript}


@router.post("/submit-answer")
def submit_answer(request: SubmitAnswerRequest):
    session = get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    session["qa_pairs"].append({
        "question": request.question,
        "answer": request.answer,
        "question_index": request.question_index
    })

    questions = session.get("questions", [])
    next_index = request.question_index + 1
    is_last = next_index >= len(questions)
    update_session(request.session_id, session)

    return {
        "message": "Answer recorded.",
        "next_question_index": next_index if not is_last else None,
        "is_interview_complete": is_last
    }
