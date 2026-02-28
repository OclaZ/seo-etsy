import logging
import io

from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import piexif

logger = logging.getLogger(__name__)
router = APIRouter()

# Windows XP tag IDs
XP_TAG_IDS = {0x9C9B, 0x9C9C, 0x9C9D, 0x9C9E, 0x9C9F}

XP_TAG_NAMES = {
    0x9C9B: "XPTitle",
    0x9C9C: "XPComment",
    0x9C9D: "XPAuthor",
    0x9C9E: "XPKeywords",
    0x9C9F: "XPSubject",
}


def _to_bytes(value):
    """Convert piexif value (bytes or tuple of ints) to bytes."""
    if isinstance(value, bytes):
        return value
    if isinstance(value, (tuple, list)) and all(isinstance(v, int) for v in value):
        return bytes(value)
    return None


def _decode_value(value, is_xp_tag=False):
    """Convert EXIF values to JSON-safe representations."""
    # Convert tuples of ints to bytes first (piexif returns XP tags this way)
    raw = _to_bytes(value)
    if raw is not None:
        if is_xp_tag:
            # XP tags are always UTF-16LE
            try:
                decoded = raw.decode("utf-16le").strip().rstrip("\x00")
                if decoded:
                    return decoded
            except (UnicodeDecodeError, ValueError):
                pass
        # Try UTF-8
        try:
            decoded = raw.decode("utf-8").strip().rstrip("\x00")
            if decoded and all(c.isprintable() or c in "\n\r\t" for c in decoded):
                return decoded
        except (UnicodeDecodeError, ValueError):
            pass
        # Try UTF-16LE
        try:
            decoded = raw.decode("utf-16le").strip().rstrip("\x00")
            if decoded and all(c.isprintable() or c in "\n\r\t" for c in decoded):
                return decoded
        except (UnicodeDecodeError, ValueError):
            pass
        # Short binary → hex, long → placeholder
        if len(raw) <= 64:
            return raw.hex()
        return f"[Binary data, {len(raw)} bytes]"
    if isinstance(value, (tuple, list)):
        # Rational number (numerator, denominator)
        if len(value) == 2 and all(isinstance(v, int) for v in value):
            if value[1] != 0:
                result = value[0] / value[1]
                if result == int(result):
                    return str(int(result))
                return f"{value[0]}/{value[1]} ({result:.4f})"
            return f"{value[0]}/{value[1]}"
        # Tuple of rationals (e.g. GPS coordinates)
        parts = []
        for item in value:
            if isinstance(item, (tuple, list)) and len(item) == 2:
                if item[1] != 0:
                    parts.append(f"{item[0]}/{item[1]}")
                else:
                    parts.append(str(item))
            else:
                parts.append(str(item))
        return ", ".join(parts)
    return value


def _get_tag_name(ifd_key, tag_id):
    """Resolve a piexif tag ID to its human-readable name."""
    if tag_id in XP_TAG_NAMES:
        return XP_TAG_NAMES[tag_id]
    tags_dict = piexif.TAGS.get(ifd_key, {})
    tag_info = tags_dict.get(tag_id)
    if tag_info and "name" in tag_info:
        return tag_info["name"]
    return f"Tag_0x{tag_id:04X}"


def _human_size(num_bytes):
    for unit in ("B", "KB", "MB"):
        if num_bytes < 1024:
            return f"{num_bytes:.1f} {unit}"
        num_bytes /= 1024
    return f"{num_bytes:.1f} GB"


def _decode_user_comment(raw):
    """Decode UserComment which has an 8-byte charset prefix."""
    if isinstance(raw, bytes) and len(raw) > 8:
        prefix = raw[:8]
        payload = raw[8:]
        if prefix.startswith(b"UNICODE"):
            try:
                return payload.decode("utf-16le").strip().rstrip("\x00")
            except (UnicodeDecodeError, ValueError):
                pass
        if prefix.startswith(b"ASCII"):
            try:
                return payload.decode("ascii").strip().rstrip("\x00")
            except (UnicodeDecodeError, ValueError):
                pass
    return _decode_value(raw)


@router.post("/check-metadata")
async def check_metadata(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ("jpg", "jpeg", "png"):
        raise HTTPException(
            status_code=400, detail="Only JPEG and PNG files are supported"
        )

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    try:
        img = Image.open(io.BytesIO(content))
    except Exception:
        raise HTTPException(status_code=400, detail="Could not open image file")

    basic_info = {
        "filename": file.filename,
        "format": img.format or ext.upper(),
        "width": img.size[0],
        "height": img.size[1],
        "color_mode": img.mode,
        "file_size_bytes": len(content),
        "file_size_human": _human_size(len(content)),
    }

    result = {
        "basic_info": basic_info,
        "xp_tags": {},
        "exif_0th": {},
        "exif_details": {},
        "gps": {},
        "exif_1st": {},
        "png_text_chunks": {},
        "has_thumbnail": False,
    }

    if ext in ("jpg", "jpeg"):
        try:
            exif_bytes = img.info.get("exif", b"")
            if exif_bytes:
                exif_dict = piexif.load(exif_bytes)

                # 0th IFD — separate XP tags into their own section
                for tag_id, value in exif_dict.get("0th", {}).items():
                    name = _get_tag_name("0th", tag_id)
                    if tag_id in XP_TAG_IDS:
                        result["xp_tags"][name] = _decode_value(value, is_xp_tag=True)
                    else:
                        result["exif_0th"][name] = _decode_value(value)

                # Exif IFD
                for tag_id, value in exif_dict.get("Exif", {}).items():
                    name = _get_tag_name("Exif", tag_id)
                    if tag_id == 37510:  # UserComment
                        result["exif_details"][name] = _decode_user_comment(value)
                    else:
                        result["exif_details"][name] = _decode_value(value)

                # GPS IFD
                for tag_id, value in exif_dict.get("GPS", {}).items():
                    name = _get_tag_name("GPS", tag_id)
                    result["gps"][name] = _decode_value(value)

                # 1st IFD (thumbnail)
                for tag_id, value in exif_dict.get("1st", {}).items():
                    name = _get_tag_name("1st", tag_id)
                    result["exif_1st"][name] = _decode_value(value)

                result["has_thumbnail"] = exif_dict.get("thumbnail") is not None

        except Exception as e:
            logger.warning(f"Failed to parse EXIF for {file.filename}: {e}")

    elif ext == "png":
        for key, value in img.info.items():
            if isinstance(value, str):
                result["png_text_chunks"][key] = value
            elif isinstance(value, bytes):
                try:
                    result["png_text_chunks"][key] = value.decode("utf-8")
                except UnicodeDecodeError:
                    result["png_text_chunks"][key] = f"[Binary data, {len(value)} bytes]"

    img.close()
    logger.info(
        f"Metadata extracted for {file.filename}: "
        f"xp={len(result['xp_tags'])}, 0th={len(result['exif_0th'])}, "
        f"exif={len(result['exif_details'])}, gps={len(result['gps'])}, "
        f"png={len(result['png_text_chunks'])}"
    )
    return result
