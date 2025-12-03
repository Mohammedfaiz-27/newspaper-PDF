# 🤖 Gemini AI Integration Setup Guide

This guide will help you integrate Google Gemini API for enhanced keyword extraction and content analysis.

## ✨ What Gemini Does

With Gemini AI enabled, your newspaper processor will:

1. **Extract Better Keywords** - AI-powered semantic keyword extraction
2. **Improve Article Titles** - Clean up unclear or incomplete headlines
3. **Generate Summaries** - Create clean, readable article summaries
4. **Enhance Content** - Fix OCR errors and improve text quality
5. **Smart Ranking** - Better relevance ranking for search results

## 📝 Setup Steps

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated API key

### 2. Configure Backend

1. Open your `.env` file in the `backend` folder:
```bash
cd backend
notepad .env
```

2. Add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
USE_GEMINI=true
```

3. Save the file

### 3. Install Dependencies

Install the Google Generative AI library:

```bash
cd backend
pip install google-generativeai==0.3.2
```

Or reinstall all requirements:
```bash
pip install -r requirements.txt
```

### 4. Restart Backend

Restart your backend server:
```bash
python run.py
```

## 🎯 How It Works

### During PDF Processing:

**Step 1: Content Enhancement (40%)**
- AI improves article titles
- Generates clean summaries

**Step 2: Keyword Extraction (50-70%)**
- Gemini extracts contextual keywords
- Falls back to spaCy if Gemini fails

**Step 3: Related Articles (70%)**
- Uses sentence embeddings for similarity

### Features:

✅ **Better Keywords**
- Example: Instead of "government", "police" → "government policy", "police reform"

✅ **Clean Titles**
- Before: "chat data with hash-value certif..."
- After: "Government Issues Hash-Value Certificates for Chat Data"

✅ **Smart Summaries**
- AI generates 200-character professional summaries
- Fixes grammar and removes OCR errors

✅ **Automatic Fallback**
- If Gemini fails, uses spaCy/KeyBERT
- No processing interruption

## 🔧 Configuration Options

In `backend/.env`:

```env
# Enable/Disable Gemini (default: true)
USE_GEMINI=true

# Your Gemini API key
GEMINI_API_KEY=your_key_here
```

To **disable Gemini** and use only spaCy:
```env
USE_GEMINI=false
```

## 💰 API Costs

Gemini API Pricing (as of 2024):
- **Free Tier**: 60 requests per minute
- **Cost**: Very low (usually free for moderate use)
- **Models**: Uses` (text-only, fast)

For a typical newspaper PDF (20-30 articles):
- ~50-100 API calls
- Usually stays within free tier

## 🐛 Troubleshooting

### API Key Issues

**Error**: `API key not found`
- Check `.env` file has `GEMINI_API_KEY=...`
- Make sure no spaces around `=`
- Restart backend after adding key

### API Quota Exceeded

**Error**: `429 Resource Exhausted`
- You hit the rate limit (60 requests/minute)
- Processing will fallback to spaCy automatically
- Wait 1 minute and retry

### Gemini Not Working

1. Check API key is valid:

```

2. Check internet connection
3. Verify `USE_GEMINI=true` in `.env`

## 📊 Comparison: With vs Without Gemini

### Without Gemini (spaCy/KeyBERT):
```
Keywords: ["data", "phone", "certificates", "hard disks"]
Title: "chat data with hash-value certif..."
Content: Raw extracted text with OCR errors...
```

### With Gemini:
```
Keywords: ["hash-value certificates", "data storage", "phone security", "digital forensics"]
Title: "Hash-Value Certificates Required for Chat Data Storage"
Content: Clean, readable summary with proper grammar...
```

## 🚀 Best Practices

1. **Use for Production**: Gemini significantly improves quality
2. **Enable Caching**: Results are stored in MongoDB
3. **Monitor Usage**: Check Google AI Studio dashboard
4. **Set Rate Limits**: Already built-in with fallback

## 📚 Additional Resources

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Python SDK](https://github.com/google/generative-ai-python)

---

**Need Help?** Check the backend logs for detailed error messages:
```bash
cd backend
python run.py
# Watch for "Gemini" related log messages
```
