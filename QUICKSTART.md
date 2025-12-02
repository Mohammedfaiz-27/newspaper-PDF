# Quick Start Guide

Get the Newspaper PDF Processor running in minutes!

## Option 1: Docker (Recommended)

The easiest way to run the entire stack:

```bash
# Make sure Docker and Docker Compose are installed
docker-compose up -d

# Wait for services to start (about 2-3 minutes)
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
# MongoDB: localhost:27017
```

That's it! Open http://localhost:3000 in your browser.

## Option 2: Manual Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- MongoDB 5.0+

### Step 1: Start MongoDB

```bash
# If MongoDB is not installed, install it first
# Then start MongoDB service
mongod --dbpath /path/to/data
```

### Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download NLP model
python -m spacy download en_core_web_sm

# Copy environment file
cp .env.example .env

# Edit .env if needed (default settings should work)

# Start the server
python run.py
```

Backend is now running at http://localhost:8000

### Step 3: Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start the dev server
npm run dev
```

Frontend is now running at http://localhost:3000

### Step 4: Use the Application

1. Open http://localhost:3000 in your browser
2. Upload a newspaper PDF
3. Watch the processing stages
4. Browse and search extracted articles!

## Testing the API

Visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

## Troubleshooting

**MongoDB connection error:**
- Make sure MongoDB is running
- Check the MONGODB_URL in backend/.env

**spaCy model not found:**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m spacy download en_core_web_sm
```

**Port already in use:**
- Backend: Change port in backend/run.py
- Frontend: Change port in frontend/vite.config.js
- MongoDB: Use different port in .env

**CORS errors:**
- Ensure frontend URL is in CORS_ORIGINS in backend/.env

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [CLAUDE.md](CLAUDE.md) for architecture details
- Explore the API at http://localhost:8000/docs
