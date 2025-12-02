# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack newspaper PDF processing application that extracts individual news articles from newspaper PDFs, performs NLP analysis, and provides search capabilities.

**Stack**: FastAPI (Python) + React + MongoDB

## Commands

### Backend Development

```bash
# Navigate to backend
cd backend

# Create/activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model (required on first setup)
python -m spacy download en_core_web_sm

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# The backend runs on http://localhost:8000
# API docs available at http://localhost:8000/docs
```

### Frontend Development

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database

```bash
# Ensure MongoDB is running
# Default connection: mongodb://localhost:27017

# Database name: newspaper_db
# Collections: articles, jobs
```

## Architecture

### Backend Architecture

**Entry Point**: `backend/app/main.py` - FastAPI application with CORS, routes, and lifespan events

**Key Services**:
1. **PDF Processing** (`services/pdf_processor.py`):
   - Extracts text and images from PDF using PyMuPDF
   - Detects headlines by font size and formatting
   - Splits pages into individual articles based on layout
   - Crops article regions from page images
   - Returns articles with Base64-encoded crop images

2. **NLP Processing** (`services/nlp_processor.py`):
   - Keyword extraction using KeyBERT (primary) and spaCy (fallback)
   - Hashtag generation from keywords
   - Semantic embeddings using SentenceTransformer ('all-MiniLM-L6-v2')
   - Related article computation via cosine similarity
   - Semantic search functionality

3. **Job Processing** (`services/job_processor.py`):
   - Background task orchestration
   - Progress tracking through multiple stages
   - Updates job status in MongoDB
   - Handles full pipeline: PDF → extraction → splitting → NLP → cropping → storage

**API Routes** (`routes/api.py`):
- `POST /api/process-pdf`: Upload PDF, returns job_id
- `GET /api/status/{job_id}`: Poll for processing status/progress
- `GET /api/result/{job_id}`: Get final results when complete
- `POST /api/search`: Semantic search across articles
- `GET /api/keywords/{keyword}/articles`: Get articles by keyword
- `GET /api/articles/{article_id}`: Get specific article

**Database Models** (`models/`):
- `database.py`: Motor (async MongoDB) client setup
- `schemas.py`: Pydantic models for API request/response validation

**Configuration** (`config.py`):
- Uses pydantic-settings for environment variable management
- Configures upload directories, MongoDB connection, CORS origins, file size limits

### Frontend Architecture

**Entry Point**: `src/main.jsx` → `src/App.jsx`

**Main App Flow** (`App.jsx`):
1. Upload stage → File selection
2. Processing stage → Poll status every 1 second
3. Results stage → Display keywords, articles, search
4. Error stage → Show errors with retry option

**Key Components**:
- `FileUpload.jsx`: Drag-drop file upload with validation
- `LoadingStatus.jsx`: Step-by-step progress visualization with 7 stages
- `ResultsView.jsx`: Main results screen, coordinates search and keyword filtering
- `KeywordCard.jsx`: Clickable keyword cards showing article count
- `ArticleCard.jsx`: Article preview with snippet, keywords, hashtags, crop thumbnail
- `ArticleModal.jsx`: Full-screen modal for viewing cropped article images
- `SearchBar.jsx`: Search input with debouncing

**API Client** (`services/api.js`):
- Axios instance with base URL configuration
- All backend API calls abstracted as functions

**State Management**:
- Uses React hooks (useState, useEffect)
- No external state management library
- Polling implemented with setInterval in useEffect

## Important Implementation Details

### PDF Article Detection Logic
Articles are detected by:
1. Finding headlines (large/bold text using font size + flags)
2. Sorting headlines by vertical position
3. Splitting content between consecutive headlines
4. Collecting text blocks within each region
5. Computing bounding box for cropping

The bounding box calculation adds padding and crops at 2x scale (matches page image rendering).

### Keyword Extraction Strategy
- Primary: KeyBERT with `use_maxsum=True` for diversity
- Fallback: spaCy named entities + noun chunks if KeyBERT fails
- Extracts 1-2 word phrases (ngram_range=(1,2))
- Top 10 keywords per article

### Related Articles Algorithm
1. Concatenate title + first 500 chars of content
2. Generate embeddings using 'all-MiniLM-L6-v2'
3. Compute cosine similarity matrix
4. Filter by threshold (0.3) and return top 5 similar articles

### Search Implementation
- Semantic search using sentence embeddings
- Query embedding compared against: title + keywords + content (first 500 chars)
- Returns results sorted by relevance score
- Minimum relevance threshold: 0.1

### Image Cropping
- Pages rendered at 2x scale (Matrix(2.0, 2.0)) for quality
- Bounding boxes scaled accordingly before cropping
- Images converted to PNG and Base64-encoded for storage
- Base64 strings stored directly in MongoDB (consider GridFS for production at scale)

## Database Schema

### articles Collection
```javascript
{
  _id: ObjectId,
  article_id: "article_1",        // Sequential ID
  job_id: "uuid",                 // Links to processing job
  page: 1,                        // Page number in PDF
  title: "...",                   // Detected headline
  content: "...",                 // Full article text
  keywords: [...],                // Extracted keywords
  hashtags: ["#News", ...],       // Generated hashtags
  crop_image_base64: "...",       // Base64 PNG image
  related_articles: ["article_7", ...],  // Related article IDs
  bbox: [x0, y0, x1, y1],        // Bounding box coordinates
  created_at: ISODate
}
```

### jobs Collection
```javascript
{
  _id: ObjectId,
  job_id: "uuid",
  status: "processing|completed|failed",
  step: "Extracting keywords...",
  progress: 0-100,
  result: {...},                  // Full result object (when completed)
  error: "...",                   // Error message (when failed)
  created_at: ISODate,
  updated_at: ISODate
}
```

## Development Patterns

### Adding New API Endpoints
1. Define Pydantic schemas in `models/schemas.py`
2. Add route handler in `routes/api.py`
3. Add corresponding function in `frontend/src/services/api.js`

### Modifying Article Detection
Edit `PDFProcessor.detect_headlines()` and `split_into_articles()` in `services/pdf_processor.py`

### Changing Keyword Extraction
Modify `NLPProcessor.extract_keywords()` in `services/nlp_processor.py`

### Adding Processing Steps
1. Add step to job_processor.py with status update
2. Add corresponding step name to LoadingStatus.jsx PROCESSING_STEPS array

## Performance Considerations

- PDF processing is CPU-intensive and runs in background tasks
- Large PDFs (50MB max) may take 30-60 seconds to process
- MongoDB stores Base64 images inline (consider GridFS for >1000 articles)
- Frontend polls every 1 second during processing
- NLP models loaded once on startup (singleton pattern)

## Environment Setup

Backend requires:
- `.env` file with MONGODB_URL, DATABASE_NAME, CORS_ORIGINS
- MongoDB running and accessible
- spaCy English model downloaded

Frontend requires:
- `.env` file with VITE_API_URL pointing to backend

Both have `.env.example` templates for reference.
