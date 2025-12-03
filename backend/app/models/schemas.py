from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime


class Article(BaseModel):
    article_id: str
    page: int
    title: str
    content: str
    summary: str = ""  # AI-generated summary
    keywords: List[str] = []
    hashtags: List[str] = []
    crop_image_base64: str = ""
    related_articles: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)


class KeywordSummary(BaseModel):
    keyword: str
    count: int


class ProcessResult(BaseModel):
    job_id: str
    pages: int
    articles: List[Article]
    keywords_summary: List[KeywordSummary]


class Job(BaseModel):
    job_id: str
    status: str  # processing, completed, failed
    step: str = ""
    progress: int = 0
    result: Optional[Dict] = None
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class JobStatusResponse(BaseModel):
    status: str
    step: str
    progress: int
    error: Optional[str] = None


class ProcessResponse(BaseModel):
    job_id: str
    message: str = "Processing started"


class SearchRequest(BaseModel):
    query: str
    limit: int = 10


class SearchResult(BaseModel):
    article_id: str
    title: str
    snippet: str
    keywords: List[str]
    crop_image_base64: str
    page: int
    relevance_score: float
