import os
import logging
from groq import Groq
from config import GROQ_API_KEY

logger = logging.getLogger(__name__)

# Initialize Groq client
client = Groq(api_key=GROQ_API_KEY)

def transcribe_audio(audio_file_path: str) -> str:
    """
    Transcribe audio file to text using Groq's insanely fast Whisper API.
    Supports: wav, mp3, webm, m4a, etc.
    """
    logger.info(f"Transcribing {audio_file_path} via Groq Whisper API...")
    with open(audio_file_path, "rb") as file:
        transcription = client.audio.transcriptions.create(
            file=(os.path.basename(audio_file_path), file.read()),
            model="whisper-large-v3",
            response_format="json",
        )
    return transcription.text.strip()
