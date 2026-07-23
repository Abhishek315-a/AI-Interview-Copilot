import os
import uuid
from gtts import gTTS

# Directory to temporarily store generated audio files
AUDIO_DIR = "./audio_cache"
os.makedirs(AUDIO_DIR, exist_ok=True)

def text_to_speech(text: str) -> str:
    """
    Convert text to speech using gTTS (Google Text-to-Speech).
    Returns the file path of the generated .mp3 audio file.
    
    Args:
        text: The question or text to be spoken aloud.
    
    Returns:
        str: Absolute path to the generated .mp3 file.
    """
    # Generate a unique filename so concurrent users don't overwrite each other
    filename = f"{uuid.uuid4()}.mp3"
    file_path = os.path.join(AUDIO_DIR, filename)
    
    # Create the TTS audio
    tts = gTTS(text=text, lang="en", slow=False)
    tts.save(file_path)
    
    return file_path


def cleanup_audio(file_path: str):
    """
    Delete the audio file after it has been served to the client.
    Call this after the frontend has received/played the audio.
    
    Args:
        file_path: Path to the .mp3 file to delete.
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Warning: Could not delete audio file {file_path}: {e}")
