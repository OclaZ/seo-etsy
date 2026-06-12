import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.models.schemas import KeywordUploadResponse, KeywordsTextRequest
from app.services import session_manager

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/upload-keyword-file", response_model=KeywordUploadResponse)
async def upload_keyword_file(
    file: UploadFile = File(...),
    session_id: str = Form(...),
):
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")

    content = await file.read()
    text = content.decode("utf-8")
    keywords = [line.strip() for line in text.splitlines() if line.strip()]

    if not keywords:
        raise HTTPException(status_code=400, detail="No keywords found in file")

    keywords_path = session_manager.get_keywords_path(session_id)
    keywords_text = "\n".join(keywords)
    keywords_path.write_text(keywords_text, encoding="utf-8")
    
    try:
        from app.services import blob_manager
        blob_manager.upload_to_blob(session_id, "keywords/keywords.txt", keywords_text.encode("utf-8"))
    except Exception as e:
        logger.error(f"Failed to upload keywords to Blob: {e}")
        
    logger.info(f"Saved {len(keywords)} keywords for session {session_id}")

    return KeywordUploadResponse(
        session_id=session_id,
        keyword_count=len(keywords),
        keywords=keywords,
    )


@router.post("/upload-keywords-text", response_model=KeywordUploadResponse)
async def upload_keywords_text(request: KeywordsTextRequest):
    if not session_manager.session_exists(request.session_id):
        raise HTTPException(status_code=404, detail="Session not found")

    keywords = [
        line.strip()
        for line in request.keywords_text.splitlines()
        if line.strip()
    ]

    if not keywords:
        raise HTTPException(status_code=400, detail="No keywords provided")

    keywords_path = session_manager.get_keywords_path(request.session_id)
    keywords_text = "\n".join(keywords)
    keywords_path.write_text(keywords_text, encoding="utf-8")
    
    try:
        from app.services import blob_manager
        blob_manager.upload_to_blob(request.session_id, "keywords/keywords.txt", keywords_text.encode("utf-8"))
    except Exception as e:
        logger.error(f"Failed to upload keywords to Blob: {e}")
        
    logger.info(f"Saved {len(keywords)} keywords for session {request.session_id}")

    return KeywordUploadResponse(
        session_id=request.session_id,
        keyword_count=len(keywords),
        keywords=keywords,
    )
