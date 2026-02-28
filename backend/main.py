import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import images, keywords, metadata
from app.services.session_manager import cleanup_expired_sessions
from app.config import UPLOAD_DIR

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
    title="Etsy SEO Image Toolkit",
    description="Optimize your Etsy product images with SEO-friendly filenames and metadata keywords",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(images.router, prefix="/api", tags=["images"])
app.include_router(keywords.router, prefix="/api", tags=["keywords"])
app.include_router(metadata.router, prefix="/api", tags=["metadata"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "Etsy SEO Image Toolkit"}
