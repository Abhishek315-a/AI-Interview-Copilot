from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_core.output_parsers import JsonOutputParser
from config import LLM_MODEL, GROQ_API_KEY
from services.rag_service import get_retriever

# Lower temperature for evaluation = more consistent, deterministic scoring
llm = ChatGroq(model=LLM_MODEL, temperature=0.2, groq_api_key=GROQ_API_KEY)

# ── Per-answer evaluation prompt ──────────────────────────────────────────────
eval_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert interview evaluator with deep technical knowledge.
Evaluate the candidate's answer based on the interview question, their resume background, and the job description.

Question Asked: {question}
Candidate's Answer: {answer}
Resume Context (relevant sections): {resume_context}
Job Description: {job_description}

Evaluate strictly and fairly. Return ONLY a valid JSON object with this exact structure:
{{
  "score": <integer from 1 to 10>,
  "strengths": "<what the candidate did well in their answer>",
  "missing": "<important points they missed or could have elaborated on>",
  "ideal_answer": "<a brief outline of what a strong answer would include>"
}}
"""),
    ("human", "Evaluate the answer now.")
])

# ── Final report prompt ────────────────────────────────────────────────────────
report_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are a senior career coach reviewing a complete mock interview.
Below are all the questions asked, the candidate's answers, and the individual scores.

Interview Data:
{interview_data}

Generate a comprehensive final report as a JSON object with this structure:
{{
  "overall_score": <average score out of 10, rounded to 1 decimal>,
  "overall_summary": "<2-3 sentence summary of how the candidate performed overall>",
  "top_strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "top_improvements": ["<area 1>", "<area 2>", "<area 3>"],
  "skills_gap": "<what skills or knowledge areas need the most work based on the JD>",
  "recommendation": "<Ready for interview / Needs more practice / Not ready — with brief reason>"
}}
"""),
    ("human", "Generate the final interview report now.")
])


def evaluate_answer(
    session_id: str,
    question: str,
    answer: str,
    job_description: str
) -> dict:
    """
    Evaluate a single question-answer pair using RAG + LLM.
    
    Args:
        session_id:       Unique session ID (used to load the right ChromaDB collection)
        question:         The interview question that was asked
        answer:           The candidate's answer (text — from typing or STT)
        job_description:  The job description provided by the user (or empty string)
    
    Returns:
        dict with keys: score, strengths, missing, ideal_answer
    """
    # Fetch the resume chunks most relevant to THIS specific question
    retriever = get_retriever(session_id)
    docs = retriever.invoke(question)
    resume_context = "\n\n".join([doc.page_content for doc in docs])

    chain = eval_prompt | llm | JsonOutputParser()
    result = chain.invoke({
        "question": question,
        "answer": answer,
        "resume_context": resume_context,
        "job_description": job_description or "Not provided"
    })
    return result


def generate_final_report(evaluated_answers: list) -> dict:
    """
    Generate an overall interview performance report from all evaluated Q&A pairs.
    
    Args:
        evaluated_answers: List of dicts, each containing:
                           { question, answer, score, strengths, missing, ideal_answer }
    
    Returns:
        dict with keys: overall_score, overall_summary, top_strengths,
                        top_improvements, skills_gap, recommendation
    """
    # Format all Q&A data into a readable string for the LLM
    interview_data = ""
    for i, item in enumerate(evaluated_answers, 1):
        interview_data += f"""
            Q{i}: {item['question']}
            Answer: {item['answer']}
            Score: {item.get('score', 'N/A')}/10
            Strengths: {item.get('strengths', '')}
            Missing: {item.get('missing', '')}
            ---"""

    chain = report_prompt | llm | JsonOutputParser()
    result = chain.invoke({"interview_data": interview_data})
    return result
