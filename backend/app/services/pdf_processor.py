import fitz  # PyMuPDF
import pdfplumber
from PIL import Image
import io
import base64
import numpy as np
from typing import List, Dict, Tuple
import re
from collections import Counter


class PDFProcessor:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.doc = fitz.open(pdf_path)
        self.pages = []
        self.page_images = []

    def extract_text(self) -> List[Dict]:
        """Extract text from each page with layout information"""
        pages_data = []

        for page_num in range(len(self.doc)):
            page = self.doc[page_num]

            # Get text blocks with position information
            blocks = page.get_text("dict")["blocks"]

            text_blocks = []
            for block in blocks:
                if block.get("type") == 0:  # Text block
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            text_blocks.append({
                                "text": span["text"],
                                "bbox": span["bbox"],
                                "size": span["size"],
                                "flags": span["flags"],
                                "font": span["font"],
                            })

            # Get full page text
            full_text = page.get_text()

            pages_data.append({
                "page_num": page_num + 1,
                "text": full_text,
                "blocks": text_blocks,
                "width": page.rect.width,
                "height": page.rect.height
            })

        self.pages = pages_data
        return pages_data

    def extract_page_images(self) -> List[Image.Image]:
        """Extract each page as an image"""
        images = []

        for page_num in range(len(self.doc)):
            page = self.doc[page_num]

            # Render page to image (higher DPI for better quality)
            mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for better quality
            pix = page.get_pixmap(matrix=mat)

            # Convert to PIL Image
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            images.append(img)

        self.page_images = images
        return images

    def detect_headlines(self, page_data: Dict) -> List[Dict]:
        """Detect headlines based on font size and formatting"""
        blocks = page_data["blocks"]

        if not blocks:
            return []

        # Calculate average font size
        font_sizes = [b["size"] for b in blocks if b["size"] > 0]
        if not font_sizes:
            return []

        avg_size = np.mean(font_sizes)
        std_size = np.std(font_sizes)

        headlines = []
        for block in blocks:
            # Headline criteria:
            # 1. Larger than average font size
            # 2. Bold (flags & 16)
            # 3. Text length > 10 characters
            is_large = block["size"] > (avg_size + std_size * 0.5)
            is_bold = block["flags"] & 16  # Bold flag
            is_substantial = len(block["text"].strip()) > 10

            if (is_large or is_bold) and is_substantial:
                headlines.append({
                    "text": block["text"].strip(),
                    "bbox": block["bbox"],
                    "size": block["size"]
                })

        return headlines

    def split_into_articles(self, page_data: Dict) -> List[Dict]:
        """Split page into individual articles based on headlines and layout"""
        headlines = self.detect_headlines(page_data)

        if not headlines:
            # If no headlines found, treat whole page as one article
            return [{
                "page": page_data["page_num"],
                "title": f"Article from Page {page_data['page_num']}",
                "content": page_data["text"],
                "bbox": [0, 0, page_data["width"], page_data["height"]]
            }]

        articles = []
        blocks = page_data["blocks"]

        # Sort headlines by vertical position
        headlines.sort(key=lambda h: h["bbox"][1])

        for i, headline in enumerate(headlines):
            # Get content between this headline and the next
            y_start = headline["bbox"][1]
            y_end = headlines[i + 1]["bbox"][1] if i + 1 < len(headlines) else page_data["height"]

            # Collect text blocks in this region
            article_blocks = []
            x_min, y_min, x_max, y_max = float('inf'), y_start, 0, y_end

            for block in blocks:
                block_y = block["bbox"][1]
                if y_start <= block_y < y_end:
                    article_blocks.append(block["text"])
                    # Update bounding box
                    x_min = min(x_min, block["bbox"][0])
                    x_max = max(x_max, block["bbox"][2])
                    y_min = min(y_min, block["bbox"][1])
                    y_max = max(y_max, block["bbox"][3])

            content = " ".join(article_blocks)

            # Only add if content is substantial
            if len(content.strip()) > 50:
                # Add some padding to bbox
                padding = 10
                bbox = [
                    max(0, x_min - padding),
                    max(0, y_min - padding),
                    min(page_data["width"], x_max + padding),
                    min(page_data["height"], y_max + padding)
                ]

                articles.append({
                    "page": page_data["page_num"],
                    "title": headline["text"][:200],  # Limit title length
                    "content": content,
                    "bbox": bbox
                })

        return articles

    def crop_article_image(self, page_num: int, bbox: List[float]) -> str:
        """Crop article region from page image and return as base64"""
        if page_num < 1 or page_num > len(self.page_images):
            return ""

        page_img = self.page_images[page_num - 1]

        # Convert bbox to pixel coordinates (2x zoom was applied)
        x0, y0, x1, y1 = bbox
        scale = 2.0  # Match the zoom factor used in extract_page_images

        crop_box = (
            int(x0 * scale),
            int(y0 * scale),
            int(x1 * scale),
            int(y1 * scale)
        )

        try:
            cropped = page_img.crop(crop_box)

            # OPTIMIZATION: Resize if too large to reduce Base64 size
            max_width = 800  # Max width in pixels
            if cropped.width > max_width:
                ratio = max_width / cropped.width
                new_size = (max_width, int(cropped.height * ratio))
                cropped = cropped.resize(new_size, Image.LANCZOS)

            # Convert to base64 using JPEG for smaller size
            buffer = io.BytesIO()
            # Convert RGBA to RGB if needed (JPEG doesn't support transparency)
            if cropped.mode == 'RGBA':
                rgb_img = Image.new('RGB', cropped.size, (255, 255, 255))
                rgb_img.paste(cropped, mask=cropped.split()[3])
                cropped = rgb_img

            cropped.save(buffer, format="JPEG", optimize=True, quality=60)
            img_str = base64.b64encode(buffer.getvalue()).decode()

            return img_str
        except Exception as e:
            print(f"Error cropping image: {e}")
            return ""

    def process_all(self) -> List[Dict]:
        """Process entire PDF and return all articles"""
        # Extract text and images
        pages_data = self.extract_text()
        self.extract_page_images()

        all_articles = []
        article_counter = 1

        for page_data in pages_data:
            articles = self.split_into_articles(page_data)

            for article in articles:
                # Crop image for this article
                crop_base64 = self.crop_article_image(
                    article["page"],
                    article["bbox"]
                )

                all_articles.append({
                    "article_id": f"article_{article_counter}",
                    "page": article["page"],
                    "title": article["title"],
                    "content": article["content"],
                    "crop_image_base64": crop_base64,
                    "bbox": article["bbox"]
                })

                article_counter += 1

        return all_articles

    def close(self):
        """Close the PDF document"""
        if self.doc:
            self.doc.close()
