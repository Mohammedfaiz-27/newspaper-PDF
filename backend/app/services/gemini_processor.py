import google.generativeai as genai
from typing import List, Dict, Optional
import json
import re
from app.config import settings


class GeminiProcessor:
    def __init__(self):
        self.enabled = settings.USE_GEMINI and settings.GEMINI_API_KEY
        if self.enabled and settings.GEMINI_API_KEY != "your_gemini_api_key_here":
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)

                # Try multiple model names in order of preference (updated for Gemini 2.x)
                model_names = [
                    'models/gemini-2.5-flash',      # Stable, fast (recommended)
                    'models/gemini-flash-latest',    # Latest flash model
                    'models/gemini-2.5-pro',         # Higher quality
                    'models/gemini-pro-latest',      # Latest pro model
                    'models/gemini-2.0-flash'        # Fallback to 2.0
                ]

                self.model = None
                for model_name in model_names:
                    try:
                        self.model = genai.GenerativeModel(model_name)
                        # Test the model
                        test_response = self.model.generate_content("test")
                        print(f"✓ Successfully loaded Gemini model: {model_name}")
                        break
                    except Exception as e:
                        print(f"Failed to load {model_name}: {str(e)[:100]}")
                        continue

                if not self.model:
                    print("❌ Could not load any Gemini model. Disabling Gemini.")
                    self.enabled = False

            except Exception as e:
                print(f"Gemini initialization failed: {e}")
                self.enabled = False
                self.model = None
        else:
            self.model = None
            if self.enabled:
                print("❌ Gemini API key not configured properly")

    def extract_keywords_with_ai(self, text: str, top_n: int = 10) -> List[str]:
        """Extract keywords using Gemini AI for better accuracy"""
        if not self.enabled or not text or len(text.strip()) < 50:
            return []

        try:
            # Limit text length for API efficiency
            text_sample = text[:2000]

            prompt = f"""Analyze the following news article text and extract the {top_n} most important keywords or key phrases.

Rules:
1. Extract meaningful keywords that represent the main topics, people, places, organizations, or events
2. Prefer multi-word phrases when they represent important concepts (e.g., "climate change" instead of just "climate")
3. Return ONLY the keywords as a JSON array, nothing else
4. Each keyword should be 1-3 words maximum
5. Keywords should be lowercase
6. Focus on nouns and proper nouns

Article text:
{text_sample}

Return format: ["keyword1", "keyword2", "keyword3", ...]
"""

            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # Extract JSON array from response
            match = re.search(r'\[.*?\]', result_text, re.DOTALL)
            if match:
                keywords = json.loads(match.group())
                return keywords[:top_n]

            return []

        except Exception as e:
            print(f"Gemini keyword extraction failed: {e}")
            return []

    def generate_article_summary(self, text: str, title: str, max_length: int = 200) -> str:
        """Generate a clean, coherent summary of the article using Gemini"""
        if not self.enabled or not text or len(text.strip()) < 50:
            return text[:max_length] + "..."

        try:
            prompt = f"""You are a professional news editor. Create a clear, concise summary of the following news article.

Title: {title}

Article text:
{text[:3000]}

Requirements:
1. Write a {max_length}-character summary
2. Use proper grammar and complete sentences
3. Focus on the main points and key facts
4. Write in third person, professional news style
5. Do NOT include editorial opinions
6. Return ONLY the summary text, no formatting or extra text

Summary:"""

            response = self.model.generate_content(prompt)
            summary = response.text.strip()

            # Clean up and limit length
            summary = summary.replace('\n', ' ').strip()
            if len(summary) > max_length:
                summary = summary[:max_length].rsplit(' ', 1)[0] + "..."

            return summary

        except Exception as e:
            print(f"Gemini summary generation failed: {e}")
            return text[:max_length] + "..."

    def improve_article_title(self, text: str, original_title: str) -> str:
        """Improve or generate a better article title using Gemini"""
        if not self.enabled or not text:
            return original_title

        try:
            # Only improve if original title is too short, unclear, or seems incomplete
            if len(original_title) > 30 and not original_title.endswith('...'):
                return original_title

            prompt = f"""You are a news headline editor. Based on the article text below, create a clear, professional headline.

Current headline: {original_title}

Article text:
{text[:1500]}

Requirements:
1. Create a clear, informative headline (5-15 words)
2. Use title case
3. Be specific and factual
4. Do NOT use clickbait or sensationalism
5. Focus on the main news point
6. Return ONLY the headline, no quotes or extra text

Headline:"""

            response = self.model.generate_content(prompt)
            improved_title = response.text.strip().strip('"\'')

            # Only use if it's reasonable length
            if 10 < len(improved_title) < 150:
                return improved_title

            return original_title

        except Exception as e:
            print(f"Gemini title improvement failed: {e}")
            return original_title

    def enhance_article_content(self, text: str, title: str) -> str:
        """Clean up and enhance article content for better readability"""
        if not self.enabled or not text or len(text.strip()) < 100:
            return text

        try:
            prompt = f"""You are a professional editor. Clean up the following news article text that was extracted from a PDF.

Title: {title}

Raw extracted text:
{text[:4000]}

Tasks:
1. Fix any OCR errors or garbled text
2. Organize into proper paragraphs
3. Fix grammar and punctuation
4. Remove any irrelevant extracted content (page numbers, headers, footers)
5. Maintain all factual information
6. Keep the original meaning and tone
7. Return ONLY the cleaned article text, no additional commentary

Cleaned article:"""

            response = self.model.generate_content(prompt)
            cleaned_text = response.text.strip()

            # Only use if the result is reasonable
            if len(cleaned_text) > 50 and len(cleaned_text) < len(text) * 2:
                return cleaned_text

            return text

        except Exception as e:
            print(f"Gemini content enhancement failed: {e}")
            return text

    def enhance_article_fast(self, text: str, original_title: str, top_keywords: int = 10) -> Dict:
        """
        OPTIMIZED: Get title, summary, and keywords in ONE API call
        Returns: {"title": str, "summary": str, "keywords": List[str]}
        """
        if not self.enabled or not text or len(text.strip()) < 50:
            return {
                "title": original_title,
                "summary": text[:200] + "...",
                "keywords": []
            }

        try:
            prompt = f"""Analyze this news article and provide:
1. An improved headline (if the current one is unclear/incomplete)
2. A professional 200-character summary
3. The {top_keywords} most important keywords

Current headline: {original_title}

Article text:
{text[:3000]}

IMPORTANT: Return ONLY valid JSON in this exact format:
{{
  "title": "Improved Headline Here",
  "summary": "Professional summary in 200 characters...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}}

Rules:
- Title: Clear, 5-15 words, title case, no clickbait
- Summary: Exactly 200 characters max, professional news style
- Keywords: 1-3 words each, lowercase, focus on main topics/entities
- Return ONLY the JSON object, nothing else"""

            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # Extract JSON from response
            match = re.search(r'\{.*\}', result_text, re.DOTALL)
            if match:
                result = json.loads(match.group())

                # Validate and clean results
                title = result.get("title", original_title)
                if len(title) < 10 or len(title) > 150:
                    title = original_title

                summary = result.get("summary", text[:200] + "...")
                if len(summary) > 250:
                    summary = summary[:200].rsplit(' ', 1)[0] + "..."

                keywords = result.get("keywords", [])[:top_keywords]

                return {
                    "title": title,
                    "summary": summary,
                    "keywords": keywords
                }

            return {
                "title": original_title,
                "summary": text[:200] + "...",
                "keywords": []
            }

        except Exception as e:
            print(f"Gemini fast enhancement failed: {e}")
            return {
                "title": original_title,
                "summary": text[:200] + "...",
                "keywords": []
            }

    def analyze_article_relevance(self, articles: List[Dict], keyword: str) -> List[Dict]:
        """Use Gemini to rank articles by relevance to a keyword"""
        if not self.enabled or not articles:
            return articles

        try:
            # Prepare article summaries for analysis
            article_summaries = []
            for i, article in enumerate(articles[:20]):  # Limit to 20 for API efficiency
                article_summaries.append({
                    'index': i,
                    'title': article.get('title', ''),
                    'snippet': article.get('content', '')[:200]
                })

            prompt = f"""Analyze these news articles and rank them by relevance to the keyword: "{keyword}"

Articles:
{json.dumps(article_summaries, indent=2)}

Return a JSON array of article indices in order of relevance (most relevant first).
Consider:
1. Direct mention of the keyword
2. Semantic relevance to the topic
3. Context and importance

Return format: [0, 3, 1, 5, 2, ...]
Return ONLY the JSON array, nothing else.
"""

            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # Extract JSON array
            match = re.search(r'\[.*?\]', result_text, re.DOTALL)
            if match:
                ranked_indices = json.loads(match.group())
                # Reorder articles based on AI ranking
                ranked_articles = []
                for idx in ranked_indices:
                    if 0 <= idx < len(articles):
                        ranked_articles.append(articles[idx])
                # Add any remaining articles
                for i, article in enumerate(articles):
                    if i not in ranked_indices:
                        ranked_articles.append(article)
                return ranked_articles

            return articles

        except Exception as e:
            print(f"Gemini relevance analysis failed: {e}")
            return articles
