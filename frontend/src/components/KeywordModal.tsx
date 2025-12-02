import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "./ui/dialog";
import { KeywordChip } from "./KeywordChip";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Article } from "../types";

interface KeywordModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  articles: Article[];
}

export function KeywordModal({
  isOpen,
  onClose,
  keyword,
  articles,
}: KeywordModalProps) {
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const toggleArticle = (articleId: string) => {
    setExpandedArticle(expandedArticle === articleId ? null : articleId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <KeywordChip keyword={keyword} size="md" />
            <DialogTitle>Articles</DialogTitle>
            <span className="text-neutral-500 text-base font-normal">
              ({articles.length} found)
            </span>
          </div>
        </DialogHeader>

        <DialogBody className="max-h-[70vh]">
          <div className="space-y-6">
            {articles.map((article) => {
              const isExpanded = expandedArticle === article.article_id;
              const snippet = article.content.substring(0, 200) + "...";

              return (
                <div
                  key={article.article_id}
                  className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-card transition-shadow"
                >
                  {/* Article Header - Always Visible */}
                  <div
                    className="p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                    onClick={() => toggleArticle(article.article_id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-bold text-xl text-foreground mb-1">
                          {article.title}
                        </h4>
                        <p className="text-sm text-neutral-500 mb-2">
                          Page {article.page}
                        </p>
                        {!isExpanded && (
                          <p className="text-sm text-neutral-600 line-clamp-2">
                            {snippet}
                          </p>
                        )}
                      </div>

                      <button className="flex-shrink-0 p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-neutral-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-neutral-600" />
                        )}
                      </button>
                    </div>

                    {/* Keywords - Always Visible */}
                    {article.keywords && article.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {article.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-teal-light text-teal-dark"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-neutral-200 p-6 space-y-6 animate-fade-in bg-neutral-50">
                      {/* Cropped Image - Large and Prominent */}
                      {article.crop_image_base64 && (
                        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                          <img
                            src={`data:image/jpeg;base64,${article.crop_image_base64}`}
                            alt={article.title}
                            className="w-full h-auto"
                          />
                        </div>
                      )}

                      {/* Full Article Content */}
                      <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h5 className="font-serif font-semibold text-lg text-foreground mb-4 pb-2 border-b border-neutral-200">
                          Article Content
                        </h5>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-neutral-700 leading-relaxed whitespace-pre-wrap">
                            {article.content}
                          </p>
                        </div>
                      </div>

                      {/* Hashtags */}
                      {article.hashtags && article.hashtags.length > 0 && (
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h5 className="font-serif font-semibold text-sm text-foreground mb-2">
                            Hashtags
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {article.hashtags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-sm text-primary font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Related Articles */}
                      {article.related_articles && article.related_articles.length > 0 && (
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h5 className="font-serif font-semibold text-sm text-foreground mb-2">
                            Related Articles
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {article.related_articles.map((relatedId, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-200 text-neutral-700"
                              >
                                {relatedId}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {articles.length === 0 && (
              <div className="text-center py-12 text-neutral-500">
                No articles found for this keyword
              </div>
            )}
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
