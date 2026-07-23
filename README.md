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
| **Qdrant Cloud** | Vector Database | Free tier vector database to store resume embeddings for RAG |
| **Upstash Redis** | Session Management | Serverless Redis for keeping track of interview state securely |
| **sentence-transformers** | Embedding model backend | Powers `all-MiniLM-L6-v2` — lightweight, fast, 384-dim embeddings |
| **faster-whisper** | Speech-to-Text (STT) | Converts user's voice answer to text; 4x faster than original Whisper |
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
│       ├── tts_service.py       # gTTS: question text → .mp3 audio file
│       └── stt_service.py       # faster-whisper: audio file → transcript text
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

## ⚙️ Setup & Running Locally

### 1. Start the Backend

1. Install Python 3.10+
2. Install dependencies: `pip install -r requirements.txt`
3. Create a `.env` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key
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
