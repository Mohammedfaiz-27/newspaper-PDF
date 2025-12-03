import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, X, Hash, FileText } from "lucide-react";
import { SearchBar } from "../components/SearchBar";
import { KeywordChip } from "../components/KeywordChip";
import { ArticleCard } from "../components/ArticleCard";
import { KeywordModal } from "../components/KeywordModal";
import { ArticleDetailModal } from "../components/ArticleDetailModal";
import type { ProcessResult, Article } from "../types";

interface DashboardProps {
  result: ProcessResult;
}

export function Dashboard({ result }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [modalKeyword, setModalKeyword] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Filter articles based on search and keyword filter
  const filteredArticles = useMemo(() => {
    let articles = result.articles;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      articles = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.keywords.some((kw) => kw.toLowerCase().includes(query))
      );
    }

    // Apply keyword filter
    if (selectedKeyword) {
      articles = articles.filter((article) =>
        article.keywords.some(
          (kw) => kw.toLowerCase() === selectedKeyword.toLowerCase()
        )
      );
    }

    return articles;
  }, [result.articles, searchQuery, selectedKeyword]);

  // Get articles for modal keyword
  const modalArticles = useMemo(() => {
    if (!modalKeyword) return [];
    return result.articles.filter((article) =>
      article.keywords.some(
        (kw) => kw.toLowerCase() === modalKeyword.toLowerCase()
      )
    );
  }, [result.articles, modalKeyword]);

  const handleKeywordClick = (keyword: string) => {
    if (selectedKeyword === keyword) {
      setSelectedKeyword(null);
    } else {
      setSelectedKeyword(keyword);
    }
  };

  const handleKeywordChipClick = (keyword: string) => {
    setModalKeyword(keyword);
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-neutral-50 to-background">
      {/* Sticky Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-lg border-b border-border shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
                Extracted Articles
              </h1>
              <div className="flex items-center gap-3 mt-2 text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">{result.articles.length}</span>
                  <span>{result.articles.length === 1 ? "article" : "articles"}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Hash className="w-4 h-4" />
                  <span className="font-medium">{result.keywords_summary.length}</span>
                  <span>keywords</span>
                </div>
                <span>•</span>
                <span>{result.pages} {result.pages === 1 ? "page" : "pages"}</span>
              </div>
            </div>
          </div>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search articles by keyword or topic..."
          />
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Keyword Filter Section */}
        {result.keywords_summary.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Filter className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-foreground">
                    Filter by Keyword
                  </h2>
                  <p className="text-sm text-neutral-600">
                    Click a keyword to filter articles
                  </p>
                </div>
              </div>

              <AnimatePresence>
                {selectedKeyword && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSelectedKeyword(null)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-foreground bg-white rounded-lg border border-border hover:shadow-card transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                    Clear filter
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap gap-3">
              {result.keywords_summary.slice(0, 12).map((kw, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.03 }}
                >
                  <KeywordChip
                    keyword={kw.keyword}
                    count={kw.count}
                    isSelected={selectedKeyword === kw.keyword}
                    onClick={() => handleKeywordClick(kw.keyword)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex items-center gap-2 text-neutral-600 text-sm"
        >
          <span className="font-semibold text-foreground text-lg">
            {filteredArticles.length}
          </span>
          <span>
            {filteredArticles.length === 1 ? "article" : "articles"}
            {selectedKeyword && (
              <span className="ml-1">
                with keyword{" "}
                <span className="font-medium text-primary">
                  "{selectedKeyword}"
                </span>
              </span>
            )}
          </span>
        </motion.div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <ArticleCard
                key={article.article_id}
                article={article}
                onKeywordClick={handleKeywordChipClick}
                onArticleClick={handleArticleClick}
                index={index}
              />
            ))}
          </section>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Filter className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">
              No articles found
            </h3>
            <p className="text-neutral-600">
              Try adjusting your search or filter criteria
            </p>
          </motion.div>
        )}
      </main>

      {/* Keyword Modal */}
      <KeywordModal
        isOpen={!!modalKeyword}
        onClose={() => setModalKeyword(null)}
        keyword={modalKeyword || ""}
        articles={modalArticles}
      />

      {/* Article Detail Modal */}
      <ArticleDetailModal
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        article={selectedArticle}
      />
    </div>
  );
}
