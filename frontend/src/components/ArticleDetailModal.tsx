import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from "./ui/dialog";
import type { Article } from "../types";

interface ArticleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
}

export function ArticleDetailModal({
  isOpen,
  onClose,
  article,
}: ArticleDetailModalProps) {
  if (!article) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full">
                Page {article.page}
              </span>
            </div>
            <DialogTitle className="text-3xl">{article.title}</DialogTitle>
          </div>
        </DialogHeader>

        <DialogBody className="max-h-[75vh] space-y-6">
          {/* Cropped Image - Full Width */}
          {article.crop_image_base64 && (
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-neutral-200">
              <img
                src={`data:image/jpeg;base64,${article.crop_image_base64}`}
                alt={article.title}
                className="w-full h-auto"
              />
              <div className="p-3 bg-neutral-50 border-t border-neutral-200 text-center">
                <p className="text-xs text-neutral-500">
                  Original newspaper crop from page {article.page}
                </p>
              </div>
            </div>
          )}

          {/* Article Content */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-neutral-200">
            <h3 className="font-serif font-semibold text-xl text-foreground mb-4 pb-3 border-b border-neutral-200 flex items-center gap-2">
              <span>Article Content</span>
            </h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-neutral-700 text-base leading-relaxed whitespace-pre-wrap font-serif">
                {article.content}
              </p>
            </div>
          </div>

          {/* Keywords */}
          {article.keywords && article.keywords.length > 0 && (
            <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
              <h4 className="font-serif font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                <span>Keywords</span>
                <span className="text-sm font-normal text-neutral-500">
                  ({article.keywords.length})
                </span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {article.keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-teal-light text-teal-dark border border-teal-medium/30"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hashtags */}
          {article.hashtags && article.hashtags.length > 0 && (
            <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
              <h4 className="font-serif font-semibold text-lg text-foreground mb-3">
                Hashtags
              </h4>
              <div className="flex flex-wrap gap-3">
                {article.hashtags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-base text-primary font-medium hover:text-primary/80 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {article.related_articles && article.related_articles.length > 0 && (
            <div className="bg-white rounded-lg p-5 shadow-sm border border-neutral-200">
              <h4 className="font-serif font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
                <span>Related Articles</span>
                <span className="text-sm font-normal text-neutral-500">
                  ({article.related_articles.length})
                </span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {article.related_articles.map((relatedId, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-neutral-100 text-neutral-700 border border-neutral-300"
                  >
                    {relatedId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
