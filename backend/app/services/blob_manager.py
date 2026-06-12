import logging
import httpx
import os
from app.config import BLOB_READ_WRITE_TOKEN

logger = logging.getLogger(__name__)

VERCEL_BLOB_API = "https://blob.vercel-storage.com"

def _get_headers():
    if not BLOB_READ_WRITE_TOKEN:
        raise ValueError("BLOB_READ_WRITE_TOKEN is not set. Please enable Vercel Blob in your dashboard.")
    return {"authorization": f"Bearer {BLOB_READ_WRITE_TOKEN}"}


def upload_to_blob(session_id: str, relative_path: str, content: bytes) -> str:
    """Uploads a file to Vercel Blob and returns its URL. relative_path includes subdirs like 'images/'"""
    headers = _get_headers()
    pathname = f"{session_id}/{relative_path}"
    url = f"{VERCEL_BLOB_API}/{pathname}"
    
    response = httpx.put(url, content=content, headers=headers, timeout=30.0)
    response.raise_for_status()
    data = response.json()
    logger.info(f"Uploaded {pathname} to Vercel Blob.")
    return data.get("url")


def list_blobs(session_id: str) -> list[dict]:
    """Returns a list of blob objects for a given session."""
    headers = _get_headers()
    # Vercel Blob list API uses query params
    response = httpx.get(f"{VERCEL_BLOB_API}?prefix={session_id}/", headers=headers, timeout=30.0)
    response.raise_for_status()
    data = response.json()
    return data.get("blobs", [])


def download_session(session_id: str, session_dir: str):
    """Downloads all files in a session from Vercel Blob to the local session directory, preserving structure."""
    blobs = list_blobs(session_id)
    if not blobs:
        logger.warning(f"No blobs found for session {session_id}")
        return

    for blob in blobs:
        blob_url = blob["url"]
        pathname = blob["pathname"]
        
        # Extract the relative path after "session_id/"
        if f"{session_id}/" in pathname:
            relative_path = pathname.split(f"{session_id}/", 1)[-1]
        else:
            relative_path = os.path.basename(pathname)
            
        local_path = os.path.join(session_dir, relative_path)
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        # Download the file
        response = httpx.get(blob_url, timeout=30.0)
        response.raise_for_status()
        
        with open(local_path, "wb") as f:
            f.write(response.content)
            
        logger.info(f"Downloaded {relative_path} to {local_path}")


def delete_session(session_id: str):
    """Deletes all blobs for a session."""
    blobs = list_blobs(session_id)
    if not blobs:
        return
        
    urls_to_delete = [blob["url"] for blob in blobs]
    headers = _get_headers()
    
    response = httpx.post(
        f"{VERCEL_BLOB_API}/delete",
        json={"urls": urls_to_delete},
        headers=headers,
        timeout=30.0
    )
    response.raise_for_status()
    logger.info(f"Deleted {len(urls_to_delete)} blobs for session {session_id}.")


def sync_local_to_blob(session_id: str, local_dir: str, subfolder: str = ""):
    """Uploads all files from a local subfolder to Vercel Blob (and overwrites existing)."""
    if not os.path.exists(local_dir):
        return
        
    for filename in os.listdir(local_dir):
        filepath = os.path.join(local_dir, filename)
        if os.path.isfile(filepath):
            with open(filepath, "rb") as f:
                content = f.read()
            # If subfolder is "images", relative_path is "images/filename.jpg"
            relative_path = f"{subfolder}/{filename}" if subfolder else filename
            upload_to_blob(session_id, relative_path, content)
