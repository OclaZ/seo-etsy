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

    img = Image.open(image_path)

    if ext in [".jpg", ".jpeg"]:
        try:
            exif_dict = piexif.load(img.info.get('exif', b''))
        except Exception:
            exif_dict = {
                "0th": {}, "Exif": {}, "GPS": {},
                "Interop": {}, "1st": {}, "thumbnail": None,
            }

        user_comment = helper.UserComment.dump(keywords_str)
        exif_dict["Exif"][piexif.ExifIFD.UserComment] = user_comment
        exif_dict["0th"][piexif.ImageIFD.ImageDescription] = keywords_str.encode("utf-8")
        try:
            exif_dict["0th"][piexif.ImageIFD.XPKeywords] = keywords_str.encode("utf-16le")
        except Exception:
            safe_keywords = ", ".join(
                [k for k in keywords if all(ord(c) < 128 for c in k)]
            )
            exif_dict["0th"][piexif.ImageIFD.XPKeywords] = safe_keywords.encode("utf-16le")

        exif_bytes = piexif.dump(exif_dict)
        img.save(image_path, "jpeg", exif=exif_bytes, quality=95)

    elif ext == ".png":
        png_info = PngImagePlugin.PngInfo()
        for k, v in img.info.items():
            if isinstance(v, str):
                png_info.add_text(k, v)
        png_info.add_text("Keywords", keywords_str)
        img.save(image_path, "png", pnginfo=png_info)

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

    successes = []
    errors = []

    for image_path in image_files:
        filename = os.path.basename(image_path)
        try:
            add_keywords_to_image(image_path, keywords)
            successes.append(filename)
            logger.info(f"Injected keywords into: {filename}")
        except Exception as e:
            error_msg = f"Error processing {filename}: {e}"
            errors.append(error_msg)
            logger.error(error_msg)

    return successes, errors
