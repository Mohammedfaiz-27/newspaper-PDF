import { FileText } from "lucide-react";
import { KeywordChip } from "./KeywordChip";
import type { Article } from "../types";
import { cn } from "../lib/utils";

interface ArticleCardProps {
  article: Article;
  onKeywordClick: (keyword: string) => void;
  onArticleClick: (article: Article) => void;
  index: number;
}

export function ArticleCard({ article, onKeywordClick, onArticleClick, index }: ArticleCardProps) {
  const snippet = article.content.substring(0, 150) + "...";

  return (
    <div
      className="group bg-card rounded-lg shadow-card hover:shadow-lifted transition-all duration-300 overflow-hidden hover:-translate-y-1 animate-slide-up cursor-pointer"
      style={{
        animationDelay: `${index * 50}ms`,
      }}
      onClick={() => onArticleClick(article)}
    >
      {/* Thumbnail */}
      {article.crop_image_base64 && (
        <div className="relative aspect-video overflow-hidden bg-neutral-100">
          <img
            src={`data:image/jpeg;base64,${article.crop_image_base64}`}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-sm">
            Page {article.page}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-serif font-semibold text-foreground line-clamp-2 mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-neutral-600 line-clamp-3">{snippet}</p>
        </div>

        {/* Keywords */}
        {article.keywords && article.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.keywords.slice(0, 4).map((keyword, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  onKeywordClick(keyword);
                }}
                className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                  "bg-teal-light text-teal-dark",
                  "hover:bg-teal-medium hover:text-white transition-all duration-200",
                  "hover:shadow-sm"
                )}
              >
                {keyword}
              </button>
            ))}
            {article.keywords.length > 4 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                +{article.keywords.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Read More Hint */}
        <div className="pt-2 mt-2 border-t border-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-sm text-primary font-medium">
            Click to read full article →
          </p>
        </div>
      </div>
    </div>
  );
}
