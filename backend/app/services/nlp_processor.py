import spacy
from keybert import KeyBERT
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Dict, Tuple
import re
from collections import Counter


class NLPProcessor:
    def __init__(self):
        # Load spaCy model (download with: python -m spacy download en_core_web_sm)
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Downloading spaCy model...")
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
            self.nlp = spacy.load("en_core_web_sm")

        # Load KeyBERT for keyword extraction
        self.kw_model = KeyBERT()

        # Load sentence transformer for embeddings
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')

    def extract_keywords(self, text: str, top_n: int = 10) -> List[str]:
        """Extract keywords using KeyBERT"""
        if not text or len(text.strip()) < 20:
            return []

        try:
            # Use KeyBERT to extract keywords
            keywords = self.kw_model.extract_keywords(
                text,
                keyphrase_ngram_range=(1, 2),
                stop_words='english',
                top_n=top_n,
                use_maxsum=True,
                nr_candidates=20
            )

            # Return just the keyword strings
            return [kw[0] for kw in keywords]
        except Exception as e:
            print(f"KeyBERT extraction failed: {e}, falling back to spaCy")
            return self._extract_keywords_spacy(text, top_n)

    def _extract_keywords_spacy(self, text: str, top_n: int = 10) -> List[str]:
        """Fallback keyword extraction using spaCy"""
        doc = self.nlp(text[:100000])  # Limit text length

        # Extract named entities and noun chunks
        keywords = []

        # Named entities
        for ent in doc.ents:
            if ent.label_ in ["PERSON", "ORG", "GPE", "EVENT", "PRODUCT"]:
                keywords.append(ent.text.lower())

        # Noun chunks
        for chunk in doc.noun_chunks:
            if len(chunk.text.split()) <= 2:  # Max 2 words
                keywords.append(chunk.text.lower())

        # Count and return most frequent
        counter = Counter(keywords)
        return [kw for kw, count in counter.most_common(top_n)]

    def generate_hashtags(self, keywords: List[str]) -> List[str]:
        """Convert keywords to hashtags"""
        hashtags = []

        for kw in keywords[:5]:  # Top 5 keywords
            # Clean and format as hashtag
            hashtag = re.sub(r'[^a-zA-Z0-9\s]', '', kw)
            hashtag = hashtag.replace(' ', '')
            if hashtag:
                hashtags.append(f"#{hashtag.capitalize()}")

        return hashtags

    def get_embedding(self, text: str) -> np.ndarray:
        """Get sentence embedding for text"""
        return self.embedder.encode(text)

    def compute_similarity(self, text1: str, text2: str) -> float:
        """Compute cosine similarity between two texts"""
        emb1 = self.get_embedding(text1)
        emb2 = self.get_embedding(text2)

        similarity = cosine_similarity([emb1], [emb2])[0][0]
        return float(similarity)

    def find_related_articles(
        self,
        articles: List[Dict],
        threshold: float = 0.3,
        top_n: int = 5
    ) -> Dict[str, List[str]]:
        """Find related articles for each article using embeddings"""
        if not articles:
            return {}

        # Get embeddings for all articles
        texts = [art.get("title", "") + " " + art.get("content", "")[:500] for art in articles]
        embeddings = self.embedder.encode(texts)

        # Compute similarity matrix
        similarity_matrix = cosine_similarity(embeddings)

        related_map = {}

        for i, article in enumerate(articles):
            article_id = article["article_id"]

            # Get similarity scores for this article
            similarities = similarity_matrix[i]

            # Get indices of most similar articles (excluding itself)
            similar_indices = []
            for j, sim in enumerate(similarities):
                if i != j and sim >= threshold:
                    similar_indices.append((j, sim))

            # Sort by similarity and get top N
            similar_indices.sort(key=lambda x: x[1], reverse=True)
            top_similar = similar_indices[:top_n]

            # Get article IDs
            related_ids = [articles[idx]["article_id"] for idx, sim in top_similar]
            related_map[article_id] = related_ids

        return related_map

    def extract_snippet(self, text: str, max_length: int = 200) -> str:
        """Extract a meaningful snippet from text"""
        # Clean text
        text = text.strip()

        if len(text) <= max_length:
            return text

        # Try to break at sentence boundary
        sentences = text[:max_length + 100].split('.')

        snippet = sentences[0] + '.'
        if len(snippet) > max_length:
            snippet = text[:max_length] + "..."

        return snippet

    def search_articles(
        self,
        query: str,
        articles: List[Dict],
        limit: int = 10
    ) -> List[Tuple[Dict, float]]:
        """Search for articles relevant to query"""
        if not articles:
            return []

        # Get query embedding
        query_embedding = self.get_embedding(query)

        # Get article embeddings
        article_texts = [
            art.get("title", "") + " " +
            " ".join(art.get("keywords", [])) + " " +
            art.get("content", "")[:500]
            for art in articles
        ]
        article_embeddings = self.embedder.encode(article_texts)

        # Compute similarities
        similarities = cosine_similarity([query_embedding], article_embeddings)[0]

        # Create results with scores
        results = []
        for i, article in enumerate(articles):
            score = float(similarities[i])
            if score > 0.1:  # Minimum relevance threshold
                results.append((article, score))

        # Sort by relevance score
        results.sort(key=lambda x: x[1], reverse=True)

        return results[:limit]
