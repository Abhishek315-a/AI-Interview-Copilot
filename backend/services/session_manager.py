import redis
import json
import logging
from config import REDIS_URL, SESSION_TTL

logger = logging.getLogger(__name__)

# Upstash uses SSL — redis.from_url handles rediss:// automatically
r = redis.from_url(REDIS_URL, decode_responses=True)

def set_session(session_id: str, data: dict):
    """Store session data in Redis with TTL."""
    r.setex(session_id, SESSION_TTL, json.dumps(data))
    logger.info(f"Session created: {session_id}")

def get_session(session_id: str) -> dict | None:
    """Retrieve session data. Returns None if expired or not found."""
    val = r.get(session_id)
    if val is None:
        return None
    return json.loads(val)

def update_session(session_id: str, data: dict):
    """Update session data and reset TTL."""
    r.setex(session_id, SESSION_TTL, json.dumps(data))

def delete_session(session_id: str):
    """Remove session from Redis."""
    r.delete(session_id)
    logger.info(f"Session deleted: {session_id}")
