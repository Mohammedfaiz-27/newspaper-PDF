from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.models.database import connect_to_mongo, close_mongo_connection
from app.routes import api
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="Newspaper PDF Processor API",
    description="API for processing newspaper PDFs and extracting articles with keyword search",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api.router, prefix="/api", tags=["API"])


@app.get("/")
async def root():
    return {
        "message": "Newspaper PDF Processor API",
        "version": "1.0.0",
        "endpoints": {
            "upload": "/api/process-pdf",
            "status": "/api/status/{job_id}",
            "result": "/api/result/{job_id}",
            "search": "/api/search",
            "health": "/api/health"
        }
    }
