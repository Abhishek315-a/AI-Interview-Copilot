from faster_whisper import WhisperModel

import logging

logger = logging.getLogger(__name__)
_model = None

def get_stt_model():
    global _model
    if _model is None:
        logger.info("Loading Whisper Tiny model into RAM...")
        _model = WhisperModel("tiny", device="cpu", compute_type="int8")
    return _model

def transcribe_audio(audio_file_path: str) -> str:
    """
    Transcribe audio file to text using faster-whisper.
    Supports: wav, mp3, webm, m4a, etc.
    """
    m = get_stt_model()
    segments, info = m.transcribe(audio_file_path, beam_size=5)
    transcript = " ".join([segment.text for segment in segments])
    return transcript.strip()
