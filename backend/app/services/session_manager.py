import uuid
import shutil
import time
import logging
from pathlib import Path
from app.config import UPLOAD_DIR, SESSION_EXPIRY_MINUTES

logger = logging.getLogger(__name__)

_sessions: dict[str, dict] = {}


def create_session() -> str:
    session_id = uuid.uuid4().hex[:12]
    session_dir = UPLOAD_DIR / session_id
    session_dir.mkdir(parents=True, exist_ok=True)
    (session_dir / "images").mkdir(exist_ok=True)
    (session_dir / "keywords").mkdir(exist_ok=True)
    _sessions[session_id] = {"created": time.time(), "dir": str(session_dir)}
    logger.info(f"Created session: {session_id}")
    return session_id


def get_session_dir(session_id: str) -> Path:
    session_dir = UPLOAD_DIR / session_id
    if not session_dir.exists():
        # Try to restore from Vercel Blob on new serverless instances
        from app.services import blob_manager
        try:
            blobs = blob_manager.list_blobs(session_id)
            if blobs:
                session_dir.mkdir(parents=True, exist_ok=True)
                (session_dir / "images").mkdir(exist_ok=True)
                (session_dir / "keywords").mkdir(exist_ok=True)
                _sessions[session_id] = {"created": time.time(), "dir": str(session_dir)}
                blob_manager.download_session(session_id, str(session_dir))
                logger.info(f"Restored session {session_id} from Vercel Blob")
            else:
                raise ValueError(f"Session not found locally or in Blob: {session_id}")
        except Exception as e:
            if isinstance(e, ValueError):
                raise
            raise ValueError(f"Session not found: {session_id} (Blob error: {e})")
    return session_dir


def get_images_dir(session_id: str) -> Path:
    return get_session_dir(session_id) / "images"


def get_keywords_path(session_id: str) -> Path:
    return get_session_dir(session_id) / "keywords" / "keywords.txt"


def session_exists(session_id: str) -> bool:
    if (UPLOAD_DIR / session_id).exists():
        return True
    try:
        from app.services import blob_manager
        blobs = blob_manager.list_blobs(session_id)
        if blobs:
            return True
    except Exception:
        pass
    return False


def cleanup_expired_sessions(cleanup_all: bool = False):
    if not UPLOAD_DIR.exists():
        return
    now = time.time()
    expiry_seconds = SESSION_EXPIRY_MINUTES * 60
    for session_dir in UPLOAD_DIR.iterdir():
        if not session_dir.is_dir():
            continue
        session_id = session_dir.name
        session_info = _sessions.get(session_id)
        if cleanup_all or (session_info and now - session_info["created"] > expiry_seconds):
            shutil.rmtree(session_dir, ignore_errors=True)
            _sessions.pop(session_id, None)
            logger.info(f"Cleaned up session: {session_id}")
