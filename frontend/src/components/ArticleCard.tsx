import { motion } from "framer-motion";
import { Eye } from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={() => onArticleClick(article)}
      className="group bg-card rounded-xl shadow-card hover:shadow-lifted transition-all duration-300 overflow-hidden cursor-pointer border border-border"
    >
      {/* Thumbnail */}
      {article.crop_image_base64 && (
        <div className="relative aspect-video overflow-hidden bg-neutral-100">
          <img
            src={`data:image/jpeg;base64,${article.crop_image_base64}`}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-3 right-3 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-sm">
            Page {article.page}
          </div>
          {/* View Icon on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white rounded-full p-3 shadow-lifted">
              <Eye className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-serif font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors duration-300">
            {article.title}
          </h3>
          <p className="text-sm text-neutral-600 line-clamp-3 leading-relaxed">{snippet}</p>
        </div>

        {/* Keywords */}
        {article.keywords && article.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.keywords.slice(0, 4).map((keyword, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onKeywordClick(keyword);
                }}
                className={cn(
                  "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium",
                  "bg-primary/10 text-primary border border-primary/20",
                  "hover:bg-primary hover:text-white transition-all duration-300",
                  "hover:shadow-sm"
                )}
              >
                {keyword}
              </motion.button>
            ))}
            {article.keywords.length > 4 && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                +{article.keywords.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Hashtags */}
        {article.hashtags && article.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 text-xs text-neutral-500">
            {article.hashtags.slice(0, 3).map((tag, idx) => (
              <span key={idx}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
