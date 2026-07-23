from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from langchain_core.output_parsers import JsonOutputParser
from config import LLM_MODEL,GROQ_API_KEY
from services.rag_service import get_retriever

llm = ChatGroq(model=LLM_MODEL, temperature=0.7, groq_api_key=GROQ_API_KEY)

question_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert technical interviewer.
Based on the candidate's resume and the job description, generate exactly {num_questions} 
interview questions. Mix behavioral and technical questions relevant to their background.

Resume Context:
{resume_context}

Job Description:
{job_description}

Return ONLY a valid JSON array of question strings. Example:
["Question 1?", "Question 2?", "Question 3?"]
"""),
    ("human", "Generate the interview questions now.")
])

def generate_questions(session_id: str, job_description: str, num_questions: int = 5):
    retriever = get_retriever(session_id)
    docs = retriever.invoke("skills experience projects education")
    resume_context = "\n\n".join([d.page_content for d in docs])
    
    chain = question_prompt | llm | JsonOutputParser()
    return chain.invoke({
        "num_questions": num_questions,
        "resume_context": resume_context,
        "job_description": job_description or "Not provided"
    })
