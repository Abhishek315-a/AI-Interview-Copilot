from pydantic import BaseModel
from typing import Optional, List

class UploadResponse(BaseModel):
    session_id: str
    message: str

class GenerateQuestionsRequest(BaseModel):
    session_id: str
    num_questions: int = 5

class SubmitAnswerRequest(BaseModel):
    session_id: str
    question_index: int
    question: str
    answer: str

class EvaluateRequest(BaseModel):
    session_id: str

class QuestionAnswer(BaseModel):
    question: str
    answer: str
    score: Optional[int] = None
    feedback: Optional[str] = None
