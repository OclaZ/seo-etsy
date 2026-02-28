import os
import glob
import logging
from app.utils.file_utils import sanitize_base_name

logger = logging.getLogger(__name__)


def _collect_images(folder_path: str) -> list[str]:
    image_files = []
    for ext in ("*.png", "*.jpeg", "*.jpg"):
        image_files.extend(glob.glob(os.path.join(folder_path, ext)))
    image_files.sort()
    return image_files


def preview_renames(folder_path: str, base_name: str) -> list[dict]:
    base_name = sanitize_base_name(base_name)
    image_files = _collect_images(folder_path)
    results = []
    for i, old_path in enumerate(image_files, 1):
        ext = os.path.splitext(old_path)[1].lower()
        new_filename = f"{base_name}{ext}" if i == 1 else f"{base_name}-{i}{ext}"
        results.append({
            "original": os.path.basename(old_path),
            "renamed": new_filename,
        })
    return results


def rename_images(folder_path: str, base_name: str) -> tuple[list[dict], list[str]]:
    base_name = sanitize_base_name(base_name)
    image_files = _collect_images(folder_path)
    results = []
    errors = []

    for i, old_path in enumerate(image_files, 1):
        ext = os.path.splitext(old_path)[1].lower()
        new_filename = f"{base_name}{ext}" if i == 1 else f"{base_name}-{i}{ext}"
        new_path = os.path.join(folder_path, new_filename)
        try:
            os.rename(old_path, new_path)
            results.append({
                "original": os.path.basename(old_path),
                "renamed": new_filename,
            })
            logger.info(f"Renamed: {os.path.basename(old_path)} -> {new_filename}")
        except Exception as e:
            error_msg = f"Error renaming {os.path.basename(old_path)}: {e}"
            errors.append(error_msg)
            logger.error(error_msg)

    return results, errors
