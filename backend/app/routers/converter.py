import io
import logging
import os
import zipfile

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse
from PIL import Image

logger = logging.getLogger(__name__)
router = APIRouter()

ALLOWED_OUTPUT = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
MAX_FILES = 50


@router.post("/convert-images")
async def convert_images(
    files: list[UploadFile] = File(...),
    format: str = Query("jpg"),
):
    format = format.lower().strip()
    if format not in ALLOWED_OUTPUT:
        raise HTTPException(status_code=400, detail=f"Invalid format '{format}'. Use: jpg, jpeg, png, or webp")

    if len(files) > MAX_FILES:
        raise HTTPException(status_code=400, detail=f"Maximum {MAX_FILES} images per conversion")

    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    # Pillow save format name
    if format in ("jpg", "jpeg"):
        pil_format = "JPEG"
        out_ext = "jpg" if format == "jpg" else "jpeg"
    elif format == "webp":
        pil_format = "WEBP"
        out_ext = "webp"
    else:
        pil_format = "PNG"
        out_ext = "png"

    zip_buffer = io.BytesIO()
    converted = 0
    errors = []
    seen_names = set()

    for file in files:
        content = await file.read()

        if len(content) > MAX_FILE_SIZE:
            errors.append(f"{file.filename}: exceeds 20 MB limit")
            continue

        try:
            img = Image.open(io.BytesIO(content))

            # Handle animated images — take first frame
            if hasattr(img, "n_frames") and img.n_frames > 1:
                img.seek(0)

            # Convert RGBA/P/LA to RGB for JPEG output (no alpha channel)
            if pil_format == "JPEG" and img.mode in ("RGBA", "P", "LA", "PA"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                if img.mode in ("RGBA", "LA", "PA"):
                    background.paste(img, mask=img.split()[-1])
                img = background
            elif pil_format == "JPEG" and img.mode not in ("RGB", "L"):
                img = img.convert("RGB")

            # Save to buffer
            output = io.BytesIO()
            save_kwargs = {}
            if pil_format == "JPEG":
                save_kwargs["quality"] = 95
                save_kwargs["optimize"] = True
            elif pil_format == "WEBP":
                save_kwargs["quality"] = 90
                save_kwargs["method"] = 4
            elif pil_format == "PNG":
                save_kwargs["optimize"] = True

            img.save(output, format=pil_format, **save_kwargs)
            img.close()
            output.seek(0)

            # Build unique filename
            base = os.path.splitext(file.filename or "image")[0]
            unique_name = f"{base}.{out_ext}"
            counter = 1
            while unique_name in seen_names:
                unique_name = f"{base}-{counter}.{out_ext}"
                counter += 1
            seen_names.add(unique_name)

            with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED) as zf:
                zf.writestr(unique_name, output.getvalue())
            converted += 1

        except Exception as e:
            logger.warning(f"Failed to convert {file.filename}: {e}")
            errors.append(f"{file.filename}: {str(e)[:100]}")
            continue

    if converted == 0:
        detail = "Could not convert any images."
        if errors:
            detail += " Errors: " + "; ".join(errors[:5])
        raise HTTPException(status_code=400, detail=detail)

    zip_buffer.seek(0)
    logger.info(f"Converted {converted}/{len(files)} images to {format.upper()}")

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="converted-{converted}images-{out_ext}.zip"'
        },
    )
