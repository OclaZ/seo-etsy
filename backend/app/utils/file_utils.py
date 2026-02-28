import os
import re
from app.config import ALLOWED_IMAGE_EXTENSIONS, MAX_FILE_SIZE_MB


def validate_image_file(filename: str, file_size: int) -> tuple[bool, str]:
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        return False, f"Unsupported format: {ext}"
    if file_size > MAX_FILE_SIZE_MB * 1024 * 1024:
        return False, f"File too large: {file_size} bytes (max {MAX_FILE_SIZE_MB}MB)"
    return True, ""


def sanitize_base_name(name: str) -> str:
    sanitized = re.sub(r'[^\w\-]', '-', name)
    sanitized = re.sub(r'-+', '-', sanitized).strip('-')
    return sanitized or "image"
