# Newspaper PDF Processor

A full-stack application that processes newspaper PDFs, extracts individual articles using NLP and document layout analysis, and provides intelligent search capabilities.

## Features

- **PDF Processing**: Upload newspaper PDFs and automatically extract individual articles
- **Article Detection**: Uses layout analysis and NLP to detect article boundaries
- **Keyword Extraction**: Automatically extracts keywords and generates hashtags using KeyBERT and spaCy
- **Image Cropping**: Crops each article region as an image for visual reference
- **Related Articles**: Computes semantic similarity to find related news articles
- **Search**: Semantic search across all articles with relevance scoring
- **Real-time Progress**: Step-by-step loading UI showing processing stages

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: Document database for storing articles
- **PyMuPDF & pdfplumber**: PDF text and image extraction
- **spaCy**: Natural language processing
- **KeyBERT**: Keyword extraction
- **Sentence Transformers**: Semantic embeddings for search and similarity

### Frontend
- **React 18**: UI framework
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Build tool and dev server
- **Axios**: HTTP client

## Project Structure

```
keyword/
├── backend/
│   ├── app/
│   │   ├── models/           # Database models and schemas
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic (PDF, NLP processing)
│   │   ├── config.py         # Configuration
│   │   └── main.py           # FastAPI application
│   ├── requirements.txt      # Python dependencies
│   └── .env.example          # Environment variables template
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API client
│   │   ├── App.jsx           # Main application
│   │   └── main.jsx          # Entry point
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite configuration
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB 5.0+

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Download spaCy model:
```bash
python -m spacy download en_core_web_sm
```

5. Create `.env` file from example:
```bash
cp .env.example .env
```

6. Edit `.env` and configure MongoDB connection:
```
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=newspaper_db
```

7. Start the backend server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Usage

1. **Upload PDF**: Drag and drop or select a newspaper PDF file
2. **Processing**: Watch real-time progress as the system:
   - Extracts text from the PDF
   - Detects individual articles
   - Extracts keywords
   - Crops article images
   - Computes related articles
3. **Browse Results**:
   - View top keywords as clickable cards
   - Browse all extracted articles
   - Click on keyword cards to see all related articles
4. **Search**: Use the search bar to find articles by topic or keyword

## API Endpoints

### POST `/api/process-pdf`
Upload a PDF file for processing
- **Input**: PDF file (multipart/form-data)
- **Output**: `{ job_id: string }`

### GET `/api/status/{job_id}`
Get processing status
- **Output**: `{ status, step, progress, error? }`

### GET `/api/result/{job_id}`
Get final processing result
- **Output**: Full result with articles and keywords

### POST `/api/search`
Search for articles
- **Input**: `{ query: string, limit?: number }`
- **Output**: Array of search results with relevance scores

### GET `/api/keywords/{keyword}/articles`
Get all articles containing a keyword
- **Output**: Array of articles

## Development

### Running Tests
```bash
# Backend tests (if implemented)
cd backend
pytest

# Frontend tests (if implemented)
cd frontend
npm test
```

### Building for Production

Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Frontend:
```bash
cd frontend
npm run build
npm run preview
```

## Configuration

### Backend Environment Variables
- `MONGODB_URL`: MongoDB connection string
- `DATABASE_NAME`: Database name
- `UPLOAD_DIR`: Directory for uploaded files
- `TEMP_DIR`: Directory for temporary files
- `MAX_FILE_SIZE`: Maximum upload size in bytes
- `CORS_ORIGINS`: Allowed CORS origins

### Frontend Environment Variables
- `VITE_API_URL`: Backend API base URL

## Troubleshooting

### Backend Issues
- **MongoDB connection failed**: Ensure MongoDB is running and connection string is correct
- **spaCy model not found**: Run `python -m spacy download en_core_web_sm`
- **PDF processing errors**: Check PDF is valid and not corrupted

### Frontend Issues
- **API connection failed**: Check backend is running on correct port
- **CORS errors**: Verify CORS_ORIGINS in backend .env includes frontend URL

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
