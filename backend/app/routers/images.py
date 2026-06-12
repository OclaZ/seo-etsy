import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import StreamingResponse

from app.models.schemas import (
    UploadResponse,
    RenameRequest,
    RenameResponse,
    RenamePreviewItem,
    RenamePreviewResponse,
    InjectRequest,
    InjectResponse,
)
from app.services import session_manager, renamer, injector, zipper
from app.utils.file_utils import validate_image_file

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/upload-images", response_model=UploadResponse)
async def upload_images(
    files: list[UploadFile] = File(...),
    session_id: str | None = Query(None),
):
    if not session_id or not session_manager.session_exists(session_id):
        session_id = session_manager.create_session()

    images_dir = session_manager.get_images_dir(session_id)
    saved_filenames = []

    for file in files:
        content = await file.read()
        valid, error = validate_image_file(file.filename, len(content))
        if not valid:
            logger.warning(f"Skipped invalid file {file.filename}: {error}")
            continue

        file_path = images_dir / file.filename
        file_path.write_bytes(content)
        
        try:
            from app.services import blob_manager
            blob_manager.upload_to_blob(session_id, f"images/{file.filename}", content)
        except Exception as e:
            logger.error(f"Failed to upload {file.filename} to Blob: {e}")

        saved_filenames.append(file.filename)
        logger.info(f"Saved: {file.filename} ({len(content)} bytes)")

    if not saved_filenames:
        raise HTTPException(status_code=400, detail="No valid image files provided")

    return UploadResponse(
        session_id=session_id,
        file_count=len(saved_filenames),
        filenames=saved_filenames,
    )


@router.get("/rename-preview", response_model=RenamePreviewResponse)
async def rename_preview(
    session_id: str = Query(...),
    base_name: str = Query(...),
):
    try:
        images_dir = session_manager.get_images_dir(session_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Session not found")

    preview = renamer.preview_renames(str(images_dir), base_name)
    return RenamePreviewResponse(
        session_id=session_id,
        preview=[RenamePreviewItem(**item) for item in preview],
    )


@router.post("/rename-images", response_model=RenameResponse)
async def rename_images_endpoint(request: RenameRequest):
    try:
        images_dir = session_manager.get_images_dir(request.session_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Session not found")

    results, errors = renamer.rename_images(str(images_dir), request.base_name)
    
    # Sync renames to Blob
    try:
        from app.services import blob_manager
        blob_manager.delete_session(request.session_id)
        blob_manager.sync_local_to_blob(request.session_id, str(images_dir), subfolder="images")
    except Exception as e:
        logger.error(f"Failed to sync renames to Blob: {e}")
        
    return RenameResponse(
        session_id=request.session_id,
        renamed_count=len(results),
        results=[RenamePreviewItem(**r) for r in results],
        errors=errors,
    )


@router.post("/inject-keywords", response_model=InjectResponse)
async def inject_keywords_endpoint(request: InjectRequest):
    try:
        images_dir = session_manager.get_images_dir(request.session_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Session not found")

    keywords = request.keywords
    logger.info(f"[inject] session={request.session_id}, keywords_count={len(keywords) if keywords else 0}, "
                f"selected_files={request.selected_files}, has_seo_settings={request.seo_settings is not None}")

    if not keywords:
        keywords_path = session_manager.get_keywords_path(request.session_id)
        if not keywords_path.exists():
            raise HTTPException(
                status_code=400,
                detail="No keywords provided and no keyword file uploaded",
            )
        keywords = [
            line.strip()
            for line in keywords_path.read_text(encoding="utf-8").splitlines()
            if line.strip()
        ]

    if not keywords:
        raise HTTPException(status_code=400, detail="No keywords found")

    logger.info(f"[inject] final keywords ({len(keywords)}): {keywords[:5]}...")

    seo_dict = None
    if request.seo_settings:
        seo_dict = {
            "title": request.seo_settings.title.model_dump(),
            "subject": request.seo_settings.subject.model_dump(),
            "tags": request.seo_settings.tags.model_dump(),
            "comments": request.seo_settings.comments.model_dump(),
        }
        logger.info(f"[inject] seo_dict={seo_dict}")

    # List files on disk before injection
    disk_files = [f.name for f in images_dir.iterdir() if f.is_file()]
    logger.info(f"[inject] files on disk: {disk_files}")

    successes, errors = injector.inject_keywords(
        str(images_dir), keywords, seo_dict, request.selected_files
    )
    logger.info(f"[inject] result: {len(successes)} success, {len(errors)} errors")
    if errors:
        logger.error(f"[inject] errors: {errors}")

    # Sync injected metadata to Blob
    try:
        from app.services import blob_manager
        blob_manager.sync_local_to_blob(request.session_id, str(images_dir), subfolder="images")
    except Exception as e:
        logger.error(f"Failed to sync injected metadata to Blob: {e}")

    return InjectResponse(
        session_id=request.session_id,
        injected_count=len(successes),
        results=successes,
        errors=errors,
    )


@router.get("/download-results")
async def download_results(session_id: str = Query(...)):
    import random
    import string

    try:
        images_dir = session_manager.get_images_dir(session_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Session not found")

    nb_images = sum(1 for f in images_dir.iterdir() if f.is_file())
    rand_suffix = "".join(random.choices(string.digits, k=6))
    zip_name = f"aamir-{nb_images}images-{rand_suffix}.zip"

    zip_buffer = zipper.create_zip(str(images_dir))
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="{zip_name}"'
        },
    )
