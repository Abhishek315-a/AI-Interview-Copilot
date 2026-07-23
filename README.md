# 🎤 AI Interview Copilot

An intelligent AI-powered interview preparation platform that helps candidates practice technical and behavioral interviews with personalized, resume-aware questions and detailed feedback.

---

## 🚀 What Does It Do?

1. **Upload Your Resume** (PDF or DOCX) + optional Job Description
2. **AI generates tailored interview questions** based on your actual experience and the role
3. **Answer via voice or text** — your choice
4. **AI evaluates every answer** with a score, strengths, what's missing, and an ideal answer outline
5. **Get a final report** — overall score, top strengths, improvement areas, and a hiring recommendation

---

## 🏗️ System Architecture

```
User (Browser)
      │
      ▼
React Frontend (Vite)
      │  REST API
      ▼
FastAPI Backend
      ├── Resume Parser       → Extracts text from PDF/DOCX
      ├── RAG Service         → Chunks + embeds resume → ChromaDB
      ├── Question Chain      → RAG + Groq LLM → Interview questions
      ├── STT Service         → faster-whisper → Voice to text
      ├── TTS Service         → gTTS → Text to speech
      └── Eval Chain          → RAG + Groq LLM → Scores + feedback
```

---

## 🧠 Tech Stack & Why Each Library Was Chosen

### Backend

| Library | Role | Why |
|---------|------|-----|
| **FastAPI** | REST API framework | Async support, automatic Swagger UI, Pydantic validation |
| **LangChain** | LLM orchestration | Chains, prompt templates, output parsers — makes LLM pipelines clean and composable |
| **langchain-groq** | Groq LLM integration | Uses `ChatGroq` to connect to Groq's ultra-fast Llama 3.3-70B model |
| **langchain-core** | Core LangChain primitives | `ChatPromptTemplate`, `JsonOutputParser` — the building blocks |
| **langchain-community** | Community integrations | `PyPDFLoader`, `Docx2txtLoader`, `Chroma` vector store |
| **langchain-text-splitters** | Document chunking | `RecursiveCharacterTextSplitter` — splits resume text into optimal chunks for RAG |
| **langchain-huggingface** | HuggingFace embeddings | `HuggingFaceEmbeddings` — local embedding model, free, no API needed |
| **sentence-transformers** | Embedding model backend | Powers `all-MiniLM-L6-v2` — lightweight, fast, 384-dim embeddings |
| **ChromaDB** | Vector database | Stores and retrieves resume embeddings locally; used for RAG retrieval |
| **pypdf** | PDF parsing | Powers `PyPDFLoader` under the hood |
| **docx2txt** | DOCX parsing | Powers `Docx2txtLoader` — extracts text from Word documents |
| **faster-whisper** | Speech-to-Text (STT) | Converts user's voice answer to text; 4x faster than original Whisper, Python 3.13 compatible |
| **gTTS** | Text-to-Speech (TTS) | Converts AI-generated questions to audio using Google's TTS API |
| **pydantic** | Data validation | Request/response schemas, automatic type checking |
| **python-dotenv** | Environment variables | Loads `.env` file for API keys |
| **python-multipart** | File uploads | Required by FastAPI to handle `UploadFile` (resume uploads) |
| **uvicorn** | ASGI server | Runs the FastAPI app with hot reload for development |

### LLM Provider

| Provider | Model | Role |
|----------|-------|------|
| **Groq** | `llama-3.3-70b-versatile` | Generates interview questions and evaluates answers. Chosen for its speed (fastest inference available) and free tier. |

### Embedding Model

| Model | Provider | Dimensions | Why |
|-------|----------|-----------|-----|
| `all-MiniLM-L6-v2` | HuggingFace (local) | 384 | Free, runs locally, fast, good semantic similarity for resume text |

---

## 📁 Project Structure

```
AI_Interview_Copilot/
│
├── backend/
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── config.py                # API keys and constants from .env
│   │
│   ├── routers/
│   │   ├── upload.py            # POST /api/upload/ — file upload + RAG indexing
│   │   ├── interview.py         # Question generation, TTS, STT, answer submission
│   │   └── feedback.py          # Answer evaluation + final report
│   │
│   ├── services/
│   │   ├── resume_parser.py     # PDF/DOCX → LangChain Document objects
│   │   ├── rag_service.py       # Chunking, embedding, ChromaDB storage & retrieval
│   │   ├── question_chain.py    # LangChain chain: RAG + Groq → interview questions
│   │   ├── eval_chain.py        # LangChain chain: RAG + Groq → per-answer scores + final report
│   │   ├── tts_service.py       # gTTS: question text → .mp3 audio file
│   │   └── stt_service.py       # faster-whisper: audio file → transcript text
│   │
│   └── models/
│       └── schemas.py           # Pydantic request/response models
│
├── frontend/                    # React + Vite (coming soon)
├── notebooks/                   # Jupyter notebooks for pipeline testing
├── .env                         # API keys (not committed to git)
├── .gitignore
└── requirements.txt
```

---

## 🔄 Pipeline Flow

```
1. UPLOAD
   User uploads resume.pdf + job description text
         ↓
   PyPDFLoader parses PDF → List[Document]
         ↓
   RecursiveCharacterTextSplitter chunks text (500 chars, 50 overlap)
         ↓
   all-MiniLM-L6-v2 embeds chunks → 384-dim vectors
         ↓
   ChromaDB stores vectors (collection: "resume_{session_id}")
         ↓
   session_id returned to frontend

2. GENERATE QUESTIONS
   Frontend sends session_id + num_questions
         ↓
   ChromaDB retrieves 4 most relevant resume chunks (RAG)
         ↓
   Groq LLM (Llama 3.3-70B) generates N questions as JSON array
         ↓
   Questions stored in session, returned to frontend

3. INTERVIEW SESSION
   ┌─── TEXT MODE ───────────────────────────────────┐
   │  Question displayed on screen                   │
   │  User types answer → POST /submit-answer        │
   └─────────────────────────────────────────────────┘
   ┌─── VOICE MODE ──────────────────────────────────┐
   │  GET /question-audio → gTTS → .mp3 played       │
   │  User speaks → audio recorded in browser        │
   │  POST /transcribe → faster-whisper → text       │
   │  POST /submit-answer with transcribed text      │
   └─────────────────────────────────────────────────┘

4. EVALUATE
   All (question, answer) pairs sent to evaluation chain
         ↓
   For each pair: ChromaDB retrieves relevant resume context (RAG)
         ↓
   Groq LLM scores each answer (1-10) with:
     - Strengths
     - What was missing
     - Ideal answer outline
         ↓
   Final report generated:
     - Overall score
     - Top 3 strengths
     - Top 3 improvement areas
     - Skills gap analysis
     - Hiring recommendation
```

---

## 🔑 Why RAG?

RAG (Retrieval-Augmented Generation) is used in two critical places:

**Question Generation:** Instead of dumping the entire resume into the prompt (expensive, noisy), RAG retrieves only the 4 most relevant chunks (e.g., "ML skills", "Python projects") so questions are targeted and specific.

**Evaluation:** When scoring an answer about "machine learning experience", RAG fetches the exact ML sections from the resume. The LLM can then compare what the user *said* vs. what they *claimed on the resume* — giving grounded, fair feedback.

---

## ⚙️ Setup & Running

### Prerequisites
- Python 3.10+ (3.13 tested)
- `uv` package manager (recommended) or `pip`
- Groq API key → [console.groq.com](https://console.groq.com)

### Installation

```bash
# 1. Clone the repo
git clone <repo-url>
cd AI_Interview_Copilot

# 2. Create virtual environment
uv venv .venv
.venv\Scripts\activate   # Windows

# 3. Install dependencies
uv add -r requirements.txt

# 4. Create .env file
echo GROQ_API_KEY=gsk_your_key_here > .env
echo HF_HUB_DISABLE_SYMLINKS_WARNING=1 >> .env

# 5. Start the backend
cd backend
uvicorn main:app --reload
```

### API Documentation
Once running, visit: `http://127.0.0.1:8000/docs`

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/upload/` | Upload resume + job description |
| `POST` | `/api/interview/generate-questions` | Generate tailored questions |
| `GET` | `/api/interview/question-audio/{session_id}/{index}` | Get question as audio (TTS) |
| `POST` | `/api/interview/transcribe` | Transcribe voice answer (STT) |
| `POST` | `/api/interview/submit-answer` | Submit a text or transcribed answer |
| `POST` | `/api/feedback/evaluate` | Evaluate all answers + generate report |
| `GET` | `/api/feedback/result/{session_id}` | Re-fetch cached evaluation report |

---

## 🚀 Production Considerations

For production deployment, the following changes are recommended:

- **Session storage**: Replace in-memory dict with **Redis** (Upstash — free tier)
- **Vector database**: Replace local ChromaDB with **Qdrant Cloud** (free tier)
- **Server**: Use **Gunicorn** with multiple workers instead of single uvicorn
- **Voice quality**: Upgrade from gTTS to **ElevenLabs** for realistic voice
- **Auth**: Add JWT-based authentication
- **Rate limiting**: Limit LLM API calls per user

Recommended free-tier stack: Railway (backend) + Vercel (frontend) + Upstash (Redis) + Qdrant Cloud (vectors)

---
