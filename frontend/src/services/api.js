import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  timeout: 120000, // 2 min — LLM calls can be slow
});

// Step 1: Upload resume + JD
export const uploadResume = async (file, jobDescription = "") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("job_description", jobDescription);
  const res = await API.post("/api/upload/", formData);
  return res.data; // { session_id, message, pages_indexed }
};

// Step 2: Generate questions
export const generateQuestions = async (sessionId, numQuestions = 5) => {
  const res = await API.post("/api/interview/generate-questions", {
    session_id: sessionId,
    num_questions: numQuestions,
  });
  return res.data; // { questions: [...], total }
};

// Step 3a: Get question as audio (TTS)
export const getQuestionAudioUrl = (sessionId, questionIndex) => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  return `${baseUrl}/api/interview/question-audio/${sessionId}/${questionIndex}`;
};

// Step 3b: Transcribe voice answer (STT)
export const transcribeAudio = async (sessionId, audioBlob) => {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("audio", audioBlob, "answer.webm");
  const res = await API.post("/api/interview/transcribe", formData);
  return res.data; // { transcript }
};

// Step 4: Submit answer
export const submitAnswer = async (sessionId, questionIndex, question, answer) => {
  const res = await API.post("/api/interview/submit-answer", {
    session_id: sessionId,
    question_index: questionIndex,
    question,
    answer,
  });
  return res.data; // { message, next_question_index, is_interview_complete }
};

// Step 5: Evaluate all answers
export const evaluateAnswers = async (sessionId) => {
  const res = await API.post("/api/feedback/evaluate", {
    session_id: sessionId,
  });
  return res.data; // { per_question_feedback, final_report }
};

// Get cached result
export const getResult = async (sessionId) => {
  const res = await API.get(`/api/feedback/result/${sessionId}`);
  return res.data;
};
