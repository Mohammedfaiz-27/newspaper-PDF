from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks
from typing import List
import uuid
import os
from datetime import datetime

from app.models.schemas import (
    ProcessResponse,
    JobStatusResponse,
    ProcessResult,
    SearchRequest,
    SearchResult,
    Article
)
from app.models.database import get_database
from app.services.job_processor import process_pdf_background
from app.services.nlp_processor import NLPProcessor
from app.config import settings

router = APIRouter()

# Initialize NLP processor for search
nlp_processor = NLPProcessor()


@router.post("/process-pdf", response_model=ProcessResponse)
async def process_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """
    Upload and process a PDF file
    Returns a job_id to track progress
    """
    # Validate file
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Check file size
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
        )

    # Generate job ID
    job_id = str(uuid.uuid4())

    # Save file temporarily
    file_path = os.path.join(settings.UPLOAD_DIR, f"{job_id}.pdf")
    with open(file_path, "wb") as f:
        f.write(contents)

    # Create job record
    db = get_database()
    await db.jobs.insert_one({
        "job_id": job_id,
        "status": "pending",
        "step": "Initializing...",
        "progress": 0,
        "result": None,
        "error": None,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })

    # Start background processing
    background_tasks.add_task(process_pdf_background, job_id, file_path)

    return ProcessResponse(job_id=job_id, message="Processing started")


@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """
    Get the status of a processing job
    """
    db = get_database()
    job = await db.jobs.find_one({"job_id": job_id})

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobStatusResponse(
        status=job["status"],
        step=job["step"],
        progress=job["progress"],
        error=job.get("error")
    )


@router.get("/result/{job_id}", response_model=ProcessResult)
async def get_job_result(job_id: str):
    """
    Get the final result of a completed job
    """
    db = get_database()
    job = await db.jobs.find_one({"job_id": job_id})

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job["status"] == "processing":
        raise HTTPException(status_code=202, detail="Job still processing")

    if job["status"] == "failed":
        raise HTTPException(
            status_code=500,
            detail=f"Job failed: {job.get('error', 'Unknown error')}"
        )

    if not job.get("result"):
        raise HTTPException(status_code=500, detail="No result available")

    return ProcessResult(**job["result"])


@router.post("/search", response_model=List[SearchResult])
async def search_articles(search_request: SearchRequest):
    """
    Search for articles by keyword/query
    Returns relevant articles with snippets and images
    """
    db = get_database()

    # Get all articles
    articles_cursor = db.articles.find({})
    articles = await articles_cursor.to_list(length=1000)

    if not articles:
        return []

    # Perform semantic search
    results = nlp_processor.search_articles(
        search_request.query,
        articles,
        limit=search_request.limit
    )

    # Format results
    search_results = []
    for article, score in results:
        snippet = nlp_processor.extract_snippet(article["content"])

        search_results.append(SearchResult(
            article_id=article["article_id"],
            title=article["title"],
            snippet=snippet,
            keywords=article.get("keywords", []),
            crop_image_base64=article.get("crop_image_base64", ""),
            page=article["page"],
            relevance_score=score
        ))

    return search_results


@router.get("/articles/{article_id}", response_model=Article)
async def get_article(article_id: str):
    """
    Get a specific article by ID
    """
    db = get_database()
    article = await db.articles.find_one({"article_id": article_id})

    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    return Article(
        article_id=article["article_id"],
        page=article["page"],
        title=article["title"],
        content=article["content"],
        keywords=article.get("keywords", []),
        hashtags=article.get("hashtags", []),
        crop_image_base64=article.get("crop_image_base64", ""),
        related_articles=article.get("related_articles", []),
        created_at=article.get("created_at", datetime.utcnow())
    )


@router.get("/keywords/{keyword}/articles", response_model=List[Article])
async def get_articles_by_keyword(keyword: str, limit: int = 20):
    """
    Get all articles containing a specific keyword
    """
    db = get_database()

    # Find articles with this keyword
    articles_cursor = db.articles.find(
        {"keywords": {"$regex": keyword, "$options": "i"}}
    ).limit(limit)

    articles = await articles_cursor.to_list(length=limit)

    return [
        Article(
            article_id=art["article_id"],
            page=art["page"],
            title=art["title"],
            content=art["content"],
            keywords=art.get("keywords", []),
            hashtags=art.get("hashtags", []),
            crop_image_base64=art.get("crop_image_base64", ""),
            related_articles=art.get("related_articles", []),
            created_at=art.get("created_at", datetime.utcnow())
        )
        for art in articles
    ]


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
