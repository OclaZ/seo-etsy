import os
import glob
import logging
from PIL import Image, PngImagePlugin
import piexif
from piexif import helper

logger = logging.getLogger(__name__)


def _resolve_field_value(field_config, keywords_str: str) -> str | None:
    """Return the value to inject for a field, or None if disabled."""
    if field_config is None:
        return keywords_str
    if not field_config.get("enabled", True):
        return None
    if field_config.get("mode") == "custom" and field_config.get("custom_value", "").strip():
        return field_config["custom_value"].strip()
    return keywords_str


def add_keywords_to_image(image_path: str, keywords: list[str], seo_settings: dict | None = None) -> None:
    keywords_str = ", ".join(keywords)
    ext = os.path.splitext(image_path)[1].lower()
    filename = os.path.basename(image_path)

    # Resolve per-field values
    settings = seo_settings or {}
    title_val = _resolve_field_value(settings.get("title"), keywords_str)
    subject_val = _resolve_field_value(settings.get("subject"), keywords_str)
    tags_val = _resolve_field_value(settings.get("tags"), keywords_str)
    description_val = _resolve_field_value(settings.get("description"), keywords_str)
    comments_val = _resolve_field_value(settings.get("comments"), keywords_str)

    img = Image.open(image_path)

    if ext in [".jpg", ".jpeg"]:
        try:
            exif_dict = piexif.load(img.info.get("exif", b""))
        except Exception:
            exif_dict = {
                "0th": {},
                "Exif": {},
                "GPS": {},
                "Interop": {},
                "1st": {},
                "thumbnail": None,
            }

        # --- Description (ImageDescription + UserComment) ---
        if description_val is not None:
            exif_dict["0th"][piexif.ImageIFD.ImageDescription] = description_val.encode("utf-8")
            exif_dict["Exif"][piexif.ExifIFD.UserComment] = helper.UserComment.dump(description_val)

        # --- Title (XPTitle, tag 0x9C9B) ---
        if title_val is not None:
            try:
                exif_dict["0th"][0x9C9B] = title_val.encode("utf-16le")
            except Exception as e:
                logger.warning(f"Could not set XPTitle for {filename}: {e}")

        # --- Comments (XPComment, tag 0x9C9C) ---
        if comments_val is not None:
            try:
                exif_dict["0th"][0x9C9C] = comments_val.encode("utf-16le")
            except Exception as e:
                logger.warning(f"Could not set XPComment for {filename}: {e}")

        # --- Tags/Keywords (XPKeywords, tag 0x9C9E) ---
        if tags_val is not None:
            try:
                exif_dict["0th"][0x9C9E] = tags_val.encode("utf-16le")
            except Exception as e:
                logger.warning(f"Could not set XPKeywords for {filename}: {e}")
                try:
                    safe = ", ".join([k for k in keywords if all(ord(c) < 128 for c in k)])
                    exif_dict["0th"][0x9C9E] = safe.encode("utf-16le")
                except Exception:
                    pass

        # --- Subject (XPSubject, tag 0x9C9F) ---
        if subject_val is not None:
            try:
                exif_dict["0th"][0x9C9F] = subject_val.encode("utf-16le")
            except Exception as e:
                logger.warning(f"Could not set XPSubject for {filename}: {e}")

        # --- Dump and save ---
        # Save image first, then inject EXIF separately with piexif.insert()
        # This avoids PIL stripping non-standard XP tags during save.
        try:
            img.save(image_path, "jpeg", quality=95)
            img.close()
            exif_bytes = piexif.dump(exif_dict)
            piexif.insert(exif_bytes, image_path)
            logger.info(f"JPEG metadata injected: {filename}")
        except Exception as e:
            logger.error(f"Failed to save EXIF for {filename}: {e}")
            fallback_dict = {
                "0th": {},
                "Exif": {},
                "GPS": {},
                "Interop": {},
                "1st": {},
                "thumbnail": None,
            }
            if description_val is not None:
                fallback_dict["0th"][piexif.ImageIFD.ImageDescription] = description_val.encode("utf-8")
                fallback_dict["Exif"][piexif.ExifIFD.UserComment] = helper.UserComment.dump(description_val)
            try:
                exif_bytes = piexif.dump(fallback_dict)
                piexif.insert(exif_bytes, image_path)
                logger.info(f"JPEG fallback metadata injected: {filename}")
            except Exception as e2:
                logger.error(f"Fallback EXIF also failed for {filename}: {e2}")
                raise

    elif ext == ".png":
        png_info = PngImagePlugin.PngInfo()

        # Preserve existing text chunks
        for k, v in img.info.items():
            if isinstance(v, str):
                png_info.add_text(k, v)

        # Add SEO metadata text chunks per field
        if tags_val is not None:
            png_info.add_text("Keywords", tags_val)
        if description_val is not None:
            png_info.add_text("Description", description_val)
        if title_val is not None:
            png_info.add_text("Title", title_val)
        if comments_val is not None:
            png_info.add_text("Comment", comments_val)
        if subject_val is not None:
            png_info.add_text("Subject", subject_val)

        img.save(image_path, "png", pnginfo=png_info)
        logger.info(f"PNG metadata injected: {filename}")

    else:
        img.close()
        raise ValueError(f"Unsupported image format: {ext}")

    # Close for PNG path (JPEG path closes earlier before piexif.insert)
    if ext == ".png":
        img.close()


def inject_keywords(
    folder_path: str,
    keywords: list[str],
    seo_settings: dict | None = None,
    selected_files: list[str] | None = None,
) -> tuple[list[str], list[str]]:
    image_files = []
    for ext in ("*.jpg", "*.jpeg", "*.png"):
        image_files.extend(glob.glob(os.path.join(folder_path, ext)))

    if not image_files:
        return [], ["No supported images found in session"]

    # Filter to selected files only (renamed filenames that exist on disk)
    if selected_files:
        selected_set = {f.lower() for f in selected_files}
        image_files = [fp for fp in image_files if os.path.basename(fp).lower() in selected_set]

    logger.info(f"Injecting keywords into {len(image_files)} images in {folder_path}")

    successes = []
    errors = []

    for image_path in image_files:
        filename = os.path.basename(image_path)
        try:
            add_keywords_to_image(image_path, keywords, seo_settings)
            successes.append(filename)
        except Exception as e:
            error_msg = f"Error processing {filename}: {e}"
            errors.append(error_msg)
            logger.error(error_msg)

    logger.info(f"Injection complete: {len(successes)} success, {len(errors)} errors")
    return successes, errors
