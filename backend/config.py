from dotenv import load_dotenv
import os

load_dotenv()

# Groq LLM
GROQ_API_KEY    = os.getenv("GROQ_API_KEY")
LLM_MODEL       = "llama-3.3-70b-versatile"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# Upstash Redis
REDIS_URL       = os.getenv("REDIS_URL")
SESSION_TTL     = 3600  # 1 hour

# Qdrant Cloud
QDRANT_URL      = os.getenv("QDRANT_URL")
QDRANT_API_KEY  = os.getenv("QDRANT_API_KEY")

# CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
