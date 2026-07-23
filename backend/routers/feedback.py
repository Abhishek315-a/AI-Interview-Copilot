import logging
from fastapi import APIRouter, HTTPException
from models.schemas import EvaluateRequest
from services.eval_chain import evaluate_answer, generate_final_report
from services.session_manager import get_session, update_session

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/evaluate")
def evaluate_all_answers(request: EvaluateRequest):
    session = get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    qa_pairs = session.get("qa_pairs", [])
    if not qa_pairs:
        raise HTTPException(status_code=400, detail="No answers found. Complete the interview first.")

    job_description = session.get("job_description", "")
    evaluated = []

    for pair in qa_pairs:
        evaluation = evaluate_answer(
            session_id=request.session_id,
            question=pair["question"],
            answer=pair["answer"],
            job_description=job_description
        )
        evaluated.append({
            "question": pair["question"],
            "answer": pair["answer"],
            **evaluation
        })

    final_report = generate_final_report(evaluated)
    session["evaluated_answers"] = evaluated
    session["final_report"] = final_report
    update_session(request.session_id, session)

    return {
        "session_id": request.session_id,
        "per_question_feedback": evaluated,
        "final_report": final_report
    }


@router.get("/result/{session_id}")
def get_cached_result(session_id: str):
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    if "final_report" not in session:
        raise HTTPException(status_code=404, detail="No report found. Run /evaluate first.")

    return {
        "session_id": session_id,
        "per_question_feedback": session.get("evaluated_answers", []),
        "final_report": session["final_report"]
    }
