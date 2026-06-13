import os
import tempfile
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

UPLOAD_DIR = Path(tempfile.gettempdir()) / "etsy_seo_toolkit"
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
MAX_FILES_PER_UPLOAD = int(os.getenv("MAX_FILES_PER_UPLOAD", "50"))
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_KEYWORD_EXTENSIONS = {".txt"}
SESSION_EXPIRY_MINUTES = int(os.getenv("SESSION_EXPIRY_MINUTES", "60"))

# Vercel Blob Storage Token
BLOB_READ_WRITE_TOKEN = os.getenv("BLOB_READ_WRITE_TOKEN")
