import asyncio
import io
import logging
import os
import re
import zipfile
from urllib.parse import urljoin, urlparse

import cloudscraper
import httpx
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp", ".ico", ".avif"}

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/125.0.0.0 Safari/537.36"
)


class ScrapeRequest(BaseModel):
    url: str


class DownloadScrapedRequest(BaseModel):
    images: list[dict]  # [{"url": "...", "filename": "..."}]


def _is_image_url(url: str) -> bool:
    """Check if URL looks like an image (by extension or common CDN patterns)."""
    parsed = urlparse(url)
    path = parsed.path.lower().split("?")[0]
    if any(path.endswith(ext) for ext in IMAGE_EXTENSIONS):
        return True
    # Common CDN image patterns (no extension but clearly images)
    if re.search(r"/image[s]?/|/photo[s]?/|/img/|/media/", path):
        return True
    return False


def _extract_filename(url: str) -> str:
    """Extract a readable filename from an image URL."""
    parsed = urlparse(url)
    path = parsed.path.rstrip("/")
    filename = path.split("/")[-1] if "/" in path else path
    # Remove query params from filename
    filename = filename.split("?")[0]
    if not filename or filename == "":
        filename = "image"
    return filename[:120]  # Limit length


def _extract_images(html: str, base_url: str) -> list[dict]:
    """Parse HTML and extract all image URLs."""
    soup = BeautifulSoup(html, "html.parser")
    seen = set()
    images = []

    # <img> tags — src and data-src (lazy loading)
    for img in soup.find_all("img"):
        for attr in ("src", "data-src", "data-lazy-src", "data-original"):
            src = img.get(attr)
            if src and src.strip():
                src = src.strip()
                if src.startswith("data:"):
                    continue
                abs_url = urljoin(base_url, src)
                if abs_url not in seen:
                    seen.add(abs_url)
                    images.append({
                        "url": abs_url,
                        "filename": _extract_filename(abs_url),
                    })

    # <source> tags inside <picture>
    for source in soup.find_all("source"):
        srcset = source.get("srcset")
        if srcset:
            # srcset can contain "url 1x, url 2x" — take each URL
            for entry in srcset.split(","):
                parts = entry.strip().split()
                if parts:
                    src = parts[0].strip()
                    if src.startswith("data:"):
                        continue
                    abs_url = urljoin(base_url, src)
                    if abs_url not in seen:
                        seen.add(abs_url)
                        images.append({
                            "url": abs_url,
                            "filename": _extract_filename(abs_url),
                        })

    # Background images in inline styles
    for tag in soup.find_all(style=True):
        style = tag["style"]
        urls = re.findall(r'url\(["\']?([^"\')\s]+)["\']?\)', style)
        for src in urls:
            if src.startswith("data:"):
                continue
            abs_url = urljoin(base_url, src)
            if abs_url not in seen and _is_image_url(abs_url):
                seen.add(abs_url)
                images.append({
                    "url": abs_url,
                    "filename": _extract_filename(abs_url),
                })

    # <meta property="og:image"> and <link rel="image_src">
    for meta in soup.find_all("meta", property="og:image"):
        content = meta.get("content")
        if content and content not in seen:
            abs_url = urljoin(base_url, content)
            seen.add(abs_url)
            images.append({"url": abs_url, "filename": _extract_filename(abs_url)})

    return images


@router.post("/scrape-images")
async def scrape_images(request: ScrapeRequest):
    url = request.url.strip()

    # Validate URL
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    if not re.match(r"^https?://", url, re.IGNORECASE):
        raise HTTPException(status_code=400, detail="URL must start with http:// or https://")

    parsed = urlparse(url)
    if not parsed.netloc:
        raise HTTPException(status_code=400, detail="Invalid URL format")

    logger.info(f"Scraping images from: {url}")

    html = None
    use_cloudscraper = False

    # Try httpx first (fast)
    try:
        async with httpx.AsyncClient(
            timeout=15.0,
            follow_redirects=True,
            verify=False,
            headers={"User-Agent": USER_AGENT},
        ) as client:
            response = await client.get(url)
            response.raise_for_status()

        content_type = response.headers.get("content-type", "")
        if "text/html" not in content_type and "application/xhtml" not in content_type:
            raise HTTPException(status_code=400, detail="URL does not point to an HTML page")

        # Check if Cloudflare challenge page
        if "Just a moment" in response.text[:2000] or "cf-browser-verification" in response.text[:5000]:
            logger.info(f"Cloudflare detected on {url}, switching to cloudscraper")
            use_cloudscraper = True
        else:
            html = response.text

    except httpx.HTTPStatusError as e:
        if e.response.status_code in (403, 503):
            logger.info(f"Got {e.response.status_code} from {url}, trying cloudscraper")
            use_cloudscraper = True
        else:
            raise HTTPException(status_code=502, detail=f"Website returned error: {e.response.status_code}")
    except httpx.TimeoutException:
        raise HTTPException(status_code=502, detail="Website took too long to respond (timeout)")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Could not connect to website: {str(e)[:200]}")

    # Fallback: cloudscraper bypasses Cloudflare TLS fingerprint checks
    if use_cloudscraper:
        try:
            def _fetch_with_cloudscraper():
                # Try multiple browser configurations for better success rate
                browsers = [
                    {"browser": "chrome", "platform": "windows", "desktop": True},
                    {"browser": "firefox", "platform": "windows", "desktop": True},
                    {"browser": "chrome", "platform": "linux", "desktop": True},
                ]
                last_error = None
                for browser_cfg in browsers:
                    try:
                        scraper = cloudscraper.create_scraper(
                            browser=browser_cfg,
                            delay=5,
                        )
                        scraper.headers.update({
                            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                            "Accept-Language": "en-US,en;q=0.9",
                            "Accept-Encoding": "gzip, deflate, br",
                            "DNT": "1",
                            "Connection": "keep-alive",
                            "Upgrade-Insecure-Requests": "1",
                            "Sec-Fetch-Dest": "document",
                            "Sec-Fetch-Mode": "navigate",
                            "Sec-Fetch-Site": "none",
                            "Sec-Fetch-User": "?1",
                            "Cache-Control": "max-age=0",
                        })
                        resp = scraper.get(url, timeout=25)
                        resp.raise_for_status()
                        return resp.text, resp.headers.get("content-type", "")
                    except Exception as e:
                        last_error = e
                        logger.info(f"cloudscraper with {browser_cfg['browser']} failed: {e}")
                        continue
                raise last_error

            text, ct = await asyncio.to_thread(_fetch_with_cloudscraper)

            if "text/html" not in ct and "application/xhtml" not in ct:
                raise HTTPException(status_code=400, detail="URL does not point to an HTML page")
            html = text
        except HTTPException:
            raise
        except Exception as e:
            error_msg = str(e)[:200]
            raise HTTPException(
                status_code=502,
                detail=(
                    f"This website has strong bot protection that could not be bypassed. "
                    f"Try a different website or check if the URL is correct. ({error_msg})"
                ),
            )

    images = _extract_images(html, url)

    logger.info(f"Found {len(images)} images on {url}")

    return {
        "url": url,
        "image_count": len(images),
        "images": images,
    }


@router.post("/download-scraped")
async def download_scraped(request: DownloadScrapedRequest):
    if not request.images:
        raise HTTPException(status_code=400, detail="No images selected")

    if len(request.images) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 images per download")

    zip_buffer = io.BytesIO()
    downloaded = 0
    seen_names = set()

    async with httpx.AsyncClient(
        timeout=10.0,
        follow_redirects=True,
        verify=False,
        headers={"User-Agent": USER_AGENT},
    ) as client:
        for img in request.images:
            url = img.get("url", "")
            filename = img.get("filename", "image")

            # Deduplicate filenames
            base, ext = os.path.splitext(filename)
            if not ext:
                ext = ".jpg"
            unique_name = f"{base}{ext}"
            counter = 1
            while unique_name in seen_names:
                unique_name = f"{base}-{counter}{ext}"
                counter += 1
            seen_names.add(unique_name)

            try:
                resp = await client.get(url)
                resp.raise_for_status()
                with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED) as zf:
                    zf.writestr(unique_name, resp.content)
                downloaded += 1
            except Exception as e:
                logger.warning(f"Failed to download {url}: {e}")
                continue

    if downloaded == 0:
        raise HTTPException(status_code=502, detail="Could not download any images")

    zip_buffer.seek(0)
    logger.info(f"Packaged {downloaded}/{len(request.images)} scraped images into ZIP")

    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f'attachment; filename="scraped-{downloaded}images.zip"'
        },
    )
