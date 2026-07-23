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

```text
User (Browser)
      │
      ▼
React Frontend (Vite)
      │  REST API
      ▼
FastAPI Backend
      ├── Resume Parser       → Extracts text from PDF/DOCX
      ├── RAG Service         → Chunks + embeds resume → Qdrant Cloud Vector DB
      ├── Session Manager     → Stores session state → Upstash Redis
      ├── Question Chain      → RAG + Groq LLM → Interview questions
      ├── STT Service         → Groq Whisper API → Voice to text
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
| **Qdrant Cloud** | Vector Database | Free tier vector database to store resume embeddings for RAG |
| **Upstash Redis** | Session Management | Serverless Redis for keeping track of interview state securely |
| **langchain-google-genai** | Embedding Model | Google Gemini `text-embedding-004` — massive free tier, uses 0 local RAM |
| **groq** | Speech-to-Text (STT) | Groq Whisper API `whisper-large-v3` — 100x faster than local STT, 0 local RAM |
| **gTTS** | Text-to-Speech (TTS) | Converts AI-generated questions to audio using Google's TTS API |

### Frontend
- **React.js (Vite)** — Lightning-fast development server and optimized production build
- **Axios** — Seamless REST API communication
- **Vanilla CSS** — Custom beautiful, glassmorphic UI elements and responsive design
- **React Router** — Seamless client-side routing

### LLM Provider
- **Groq** (`llama-3.3-70b-versatile`): Generates interview questions and evaluates answers. Chosen for its speed (fastest inference available) and free tier.

---

## 📁 Project Structure

```text
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
│   └── services/
│       ├── resume_parser.py     # PDF/DOCX → LangChain Document objects
│       ├── rag_service.py       # Chunking, embedding, Qdrant Cloud storage & retrieval
│       ├── session_manager.py   # Upstash Redis state management
│       ├── question_chain.py    # LangChain chain: RAG + Groq → interview questions
│       ├── eval_chain.py        # LangChain chain: RAG + Groq → per-answer scores + final report
│       ├── tts_service.py       # Google Cloud TTS: question text → .mp3 audio file
│       └── stt_service.py       # Groq Whisper API: audio file → transcript text
│
├── frontend/                    # React SPA built with Vite
│   ├── src/                     # Source files (App, API config, Styles)
│   └── vercel.json              # Vercel configuration for SPA routing
│
├── Procfile                     # Deployment configurations for Railway
├── .env                         # API keys (not committed to git)
├── .gitignore
└── requirements.txt
```

---

## 🔄 Pipeline Flow

```text
1. UPLOAD
   User uploads resume.pdf + job description text
         ↓
   PyPDFLoader parses PDF → List[Document]
         ↓
   RecursiveCharacterTextSplitter chunks text (500 chars, 50 overlap)
         ↓
   Google Gemini (text-embedding-004) embeds chunks → 768-dim vectors
         ↓
   Qdrant Cloud stores vectors (collection: "resume_{session_id}")
         ↓
   session_id returned to frontend

2. GENERATE QUESTIONS
   Frontend sends session_id + num_questions
         ↓
   Qdrant Cloud retrieves 4 most relevant resume chunks (RAG)
         ↓
   Groq LLM (Llama 3.3-70B) generates N questions as JSON array
         ↓
   Questions stored in Upstash Redis session, returned to frontend

3. INTERVIEW SESSION
   ┌─── TEXT MODE ───────────────────────────────────┐
   │  Question displayed on screen                   │
   │  User types answer → POST /submit-answer        │
   └─────────────────────────────────────────────────┘
   ┌─── VOICE MODE ──────────────────────────────────┐
   │  GET /question-audio → gTTS → .mp3 played       │
   │  User speaks → audio recorded in browser        │
   │  POST /transcribe → Groq Whisper API → text     │
   │  POST /submit-answer with transcribed text      │
   └─────────────────────────────────────────────────┘

4. EVALUATE
   All (question, answer) pairs sent to evaluation chain
         ↓
   For each pair: Qdrant Cloud retrieves relevant resume context (RAG)
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

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/upload/` | Upload resume + job description |
| `POST` | `/api/interview/generate-questions` | Generate tailored questions |
| `GET` | `/api/interview/question-audio/{session_id}/{index}` | Get question as audio (TTS) |
| `POST` | `/api/interview/transcribe` | Transcribe voice answer via Groq (STT) |
| `POST` | `/api/interview/submit-answer` | Submit a text or transcribed answer |
| `POST` | `/api/feedback/evaluate` | Evaluate all answers + generate report |
| `GET` | `/api/feedback/result/{session_id}` | Re-fetch cached evaluation report |

---

## ⚙️ Setup & Running Locally

### 1. Start the Backend

1. Install Python 3.10+
2. Install dependencies: `pip install -r requirements.txt`
3. Create a `.env` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
QDRANT_URL=your_qdrant_cloud_url
QDRANT_API_KEY=your_qdrant_api_key
REDIS_URL=your_upstash_redis_url
ALLOWED_ORIGINS=http://localhost:5173
```
4. Run the backend:
```bash
uvicorn backend.main:app --reload
```

### 2. Start the Frontend

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open your browser to `http://localhost:5173`

---

## 🌍 Free-Tier Production Deployment Guide

The app is completely production-ready and optimized for free-tier hosting!

### 1. Deploy the Backend (Render)
1. Go to [Render.com](https://render.com/) and sign up.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Render will auto-detect Python. Make sure these settings are applied:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Scroll down to **Environment Variables** and add all your variables from your `.env` file (leave `ALLOWED_ORIGINS` empty for a moment).
   - Also add `PYTHON_VERSION` with a value of `3.11` to ensure it builds perfectly.
6. Click **Create Web Service**. Wait for the build to finish, and copy your live URL (e.g., `https://ai-interview-backend.onrender.com`).

### 2. Deploy the Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and import your GitHub repository.
2. Under "Framework Preset", ensure **Vite** is selected.
3. Set the **Root Directory** to `frontend`.
4. In Environment Variables, add `VITE_API_URL` and paste your Render backend domain.
5. Click **Deploy**.

### 3. Finalize Connection
Take the Vercel URL you were just given (e.g., `https://my-frontend.vercel.app`), go back to your **Render Web Service -> Environment**, and paste it into the `ALLOWED_ORIGINS` variable. Restart the Render service.

That's it! Your AI Interview Copilot is fully live on the internet. 🚀
