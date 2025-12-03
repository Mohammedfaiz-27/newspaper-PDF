import asyncio
from typing import Dict
from datetime import datetime
from collections import Counter
import uuid
import os

from app.services.pdf_processor import PDFProcessor
from app.services.nlp_processor import NLPProcessor
from app.services.gemini_processor import GeminiProcessor
from app.models.database import get_database
from app.config import settings


class JobProcessor:
    def __init__(self):
        self.nlp_processor = NLPProcessor()
        self.gemini_processor = GeminiProcessor()

    async def update_job_status(self, job_id: str, status: str, step: str, progress: int, error: str = None):
        """Update job status in database"""
        db = get_database()

        update_data = {
            "status": status,
            "step": step,
            "progress": progress,
            "updated_at": datetime.utcnow()
        }

        if error:
            update_data["error"] = error

        await db.jobs.update_one(
            {"job_id": job_id},
            {"$set": update_data}
        )

    async def process_pdf(self, job_id: str, pdf_path: str):
        """Process PDF file and extract articles"""
        try:
            # Initialize job
            await self.update_job_status(job_id, "processing", "Starting...", 0)

            # Step 1: Extract text and images
            await self.update_job_status(job_id, "processing", "Extracting text from PDF...", 10)
            pdf_processor = PDFProcessor(pdf_path)

            # Step 2: Extract page images
            await self.update_job_status(job_id, "processing", "Processing PDF pages...", 20)
            pages_data = pdf_processor.extract_text()
            pdf_processor.extract_page_images()

            # Step 3: Split into articles
            await self.update_job_status(job_id, "processing", "Detecting and splitting articles...", 30)
            all_articles = pdf_processor.process_all()

            if not all_articles:
                await self.update_job_status(
                    job_id, "failed", "No articles found", 100,
                    "Could not extract any articles from the PDF"
                )
                pdf_processor.close()
                return

            # Make article IDs unique by incorporating job_id
            for i, article in enumerate(all_articles):
                # Update article_id to be unique across all jobs
                article["article_id"] = f"{job_id}_{i + 1}"

            # Step 4: OPTIMIZED - Enhance with AI (parallel processing)
            await self.update_job_status(job_id, "processing", "Enhancing with AI...", 40)

            async def enhance_single_article(article, index):
                """Process a single article with AI (runs in parallel)"""
                if self.gemini_processor.enabled:
                    # ONE API call instead of 3!
                    result = await asyncio.to_thread(
                        self.gemini_processor.enhance_article_fast,
                        article["content"],
                        article["title"]
                    )

                    # Apply AI enhancements
                    article["title"] = result["title"]
                    article["summary"] = result["summary"]

                    # Use AI keywords, fallback to spaCy if empty
                    if result["keywords"]:
                        article["keywords"] = result["keywords"]
                    else:
                        article["keywords"] = self.nlp_processor.extract_keywords(article["content"])
                else:
                    # No AI - use spaCy/KeyBERT
                    article["summary"] = article["content"][:200] + "..."
                    article["keywords"] = self.nlp_processor.extract_keywords(article["content"])

                # Generate hashtags
                article["hashtags"] = self.nlp_processor.generate_hashtags(article["keywords"])

                return article

            # Process articles in parallel batches of 10
            batch_size = 10
            for batch_start in range(0, len(all_articles), batch_size):
                batch_end = min(batch_start + batch_size, len(all_articles))
                batch = all_articles[batch_start:batch_end]

                # Process batch in parallel
                tasks = [enhance_single_article(article, i) for i, article in enumerate(batch)]
                await asyncio.gather(*tasks)

                # Update progress
                progress = 40 + int((batch_end / len(all_articles)) * 30)
                await self.update_job_status(
                    job_id, "processing",
                    f"AI enhancement ({batch_end}/{len(all_articles)})...",
                    progress
                )

            # Step 5: Compute related articles
            await self.update_job_status(job_id, "processing", "Computing related articles...", 75)
            related_map = self.nlp_processor.find_related_articles(all_articles)

            for article in all_articles:
                article["related_articles"] = related_map.get(article["article_id"], [])

            # Step 6: Generate keywords summary
            await self.update_job_status(job_id, "processing", "Generating summary...", 85)
            all_keywords = []
            for article in all_articles:
                all_keywords.extend(article["keywords"])

            keyword_counts = Counter(all_keywords)
            keywords_summary = [
                {"keyword": kw, "count": count}
                for kw, count in keyword_counts.most_common(20)
            ]

            # Step 7: Store in database
            await self.update_job_status(job_id, "processing", "Storing articles in database...", 90)

            db = get_database()

            # Store articles
            for article in all_articles:
                article["job_id"] = job_id
                article["created_at"] = datetime.utcnow()

                await db.articles.insert_one(article)

            # Step 8: Finalize
            await self.update_job_status(job_id, "processing", "Finalizing...", 95)

            # Store lightweight summary in job (without images to avoid size limit)
            result_summary = {
                "job_id": job_id,
                "pages": len(pages_data),
                "article_count": len(all_articles),
                "keywords_summary": keywords_summary
            }

            # Update job with lightweight summary
            await db.jobs.update_one(
                {"job_id": job_id},
                {
                    "$set": {
                        "status": "completed",
                        "step": "Completed",
                        "progress": 100,
                        "result": result_summary,
                        "updated_at": datetime.utcnow()
                    }
                }
            )

            # Close PDF
            pdf_processor.close()

            # Clean up temporary file
            try:
                os.remove(pdf_path)
            except:
                pass

        except Exception as e:
            error_msg = str(e)
            print(f"Error processing PDF: {error_msg}")
            await self.update_job_status(
                job_id, "failed", "Processing failed", 100, error_msg
            )

            # Clean up
            try:
                os.remove(pdf_path)
            except:
                pass


# Global job processor instance
job_processor = JobProcessor()


async def process_pdf_background(job_id: str, pdf_path: str):
    """Background task to process PDF"""
    await job_processor.process_pdf(job_id, pdf_path)
