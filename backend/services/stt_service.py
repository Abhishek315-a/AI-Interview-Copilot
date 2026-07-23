from faster_whisper import WhisperModel

# Load once at startup (use "base" for speed, "medium" for accuracy)
model = WhisperModel("base", device="cpu", compute_type="int8")

def transcribe_audio(audio_file_path: str) -> str:
    """
    Transcribe audio file to text using faster-whisper.
    Supports: wav, mp3, webm, m4a, etc.
    """
    segments, info = model.transcribe(audio_file_path, beam_size=5)
    transcript = " ".join([segment.text for segment in segments])
    return transcript.strip()
