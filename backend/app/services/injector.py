import os
import glob
import logging
from PIL import Image, PngImagePlugin
import piexif
from piexif import helper

logger = logging.getLogger(__name__)


def add_keywords_to_image(image_path: str, keywords: list[str]) -> None:
    keywords_str = ", ".join(keywords)
    ext = os.path.splitext(image_path)[1].lower()
    filename = os.path.basename(image_path)

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

        # --- EXIF: UserComment ---
        user_comment = helper.UserComment.dump(keywords_str)
        exif_dict["Exif"][piexif.ExifIFD.UserComment] = user_comment

        # --- IFD0: ImageDescription ---
        exif_dict["0th"][piexif.ImageIFD.ImageDescription] = keywords_str.encode("utf-8")

        # --- Windows XP Tags (visible in Windows Explorer "Details" tab) ---
        keywords_utf16 = keywords_str.encode("utf-16le")

        # XPTitle (tag 40091) — shows as "Title"
        try:
            exif_dict["0th"][0x9C9B] = keywords_utf16
        except Exception as e:
            logger.warning(f"Could not set XPTitle for {filename}: {e}")

        # XPComment (tag 40092) — shows as "Comments"
        try:
            exif_dict["0th"][0x9C9C] = keywords_utf16
        except Exception as e:
            logger.warning(f"Could not set XPComment for {filename}: {e}")

        # XPKeywords (tag 40094) — shows as "Tags"
        try:
            exif_dict["0th"][0x9C9E] = keywords_utf16
        except Exception as e:
            logger.warning(f"Could not set XPKeywords for {filename}: {e}")
            try:
                safe_keywords = ", ".join(
                    [k for k in keywords if all(ord(c) < 128 for c in k)]
                )
                exif_dict["0th"][0x9C9E] = safe_keywords.encode("utf-16le")
            except Exception:
                pass

        # XPSubject (tag 40095) — shows as "Subject"
        try:
            exif_dict["0th"][0x9C9F] = keywords_utf16
        except Exception as e:
            logger.warning(f"Could not set XPSubject for {filename}: {e}")

        # --- Dump and save ---
        try:
            exif_bytes = piexif.dump(exif_dict)
            img.save(image_path, "jpeg", exif=exif_bytes, quality=95)
            logger.info(f"JPEG metadata injected: {filename} ({len(keywords)} keywords)")
        except Exception as e:
            logger.error(f"Failed to save EXIF for {filename}: {e}")
            # Fallback: try with minimal tags only
            fallback_dict = {
                "0th": {
                    piexif.ImageIFD.ImageDescription: keywords_str.encode("utf-8"),
                },
                "Exif": {
                    piexif.ExifIFD.UserComment: user_comment,
                },
                "GPS": {},
                "Interop": {},
                "1st": {},
                "thumbnail": None,
            }
            try:
                exif_bytes = piexif.dump(fallback_dict)
                img.save(image_path, "jpeg", exif=exif_bytes, quality=95)
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

        # Add SEO metadata text chunks
        png_info.add_text("Keywords", keywords_str)
        png_info.add_text("Description", keywords_str)
        png_info.add_text("Title", keywords_str)
        png_info.add_text("Comment", keywords_str)
        png_info.add_text("Author", "SEO Image Toolkit")

        img.save(image_path, "png", pnginfo=png_info)
        logger.info(f"PNG metadata injected: {filename} ({len(keywords)} keywords)")

    else:
        img.close()
        raise ValueError(f"Unsupported image format: {ext}")

    img.close()


def inject_keywords(folder_path: str, keywords: list[str]) -> tuple[list[str], list[str]]:
    image_files = []
    for ext in ("*.jpg", "*.jpeg", "*.png"):
        image_files.extend(glob.glob(os.path.join(folder_path, ext)))

    if not image_files:
        return [], ["No supported images found in session"]

    logger.info(f"Injecting {len(keywords)} keywords into {len(image_files)} images in {folder_path}")

    successes = []
    errors = []

    for image_path in image_files:
        filename = os.path.basename(image_path)
        try:
            add_keywords_to_image(image_path, keywords)
            successes.append(filename)
        except Exception as e:
            error_msg = f"Error processing {filename}: {e}"
            errors.append(error_msg)
            logger.error(error_msg)

    logger.info(f"Injection complete: {len(successes)} success, {len(errors)} errors")
    return successes, errors
