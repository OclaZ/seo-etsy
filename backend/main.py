import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.routers import images, keywords, metadata, scraper, converter
from app.services.session_manager import cleanup_expired_sessions
from app.config import UPLOAD_DIR

STATIC_DIR = Path(__file__).parent / "static"

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    logger.info(f"Upload directory: {UPLOAD_DIR}")
    yield
    cleanup_expired_sessions(cleanup_all=True)
    logger.info("Cleaned up all sessions on shutdown")


app = FastAPI(
    title="SEOINJECTER",
    description="Optimize your Etsy product images with SEO-friendly filenames and metadata keywords",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(images.router, prefix="/api", tags=["images"])
app.include_router(keywords.router, prefix="/api", tags=["keywords"])
app.include_router(metadata.router, prefix="/api", tags=["metadata"])
app.include_router(scraper.router, prefix="/api", tags=["scraper"])
app.include_router(converter.router, prefix="/api", tags=["converter"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "SEOINJECTER"}


# Serve frontend static files (production: built by Docker)
if STATIC_DIR.exists():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")
    app.mount("/imgs", StaticFiles(directory=STATIC_DIR / "imgs"), name="imgs")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve the React SPA for all non-API routes."""
        file_path = STATIC_DIR / full_path
        if full_path and file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")
