import { useState, useMemo } from "react";
import { Filter, X } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-b from-background via-neutral-50 to-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Article Explorer
              </h1>
              <p className="text-neutral-600 mt-1">
                {result.articles.length} articles across {result.pages} pages
              </p>
            </div>
          </div>

          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search articles by keyword or topic..."
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Keyword Filter Section */}
        {result.keywords_summary.length > 0 && (
          <section className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-neutral-600" />
                <h2 className="text-2xl font-bold text-foreground">
                  Filter by Keyword
                </h2>
              </div>

              {selectedKeyword && (
                <button
                  onClick={() => setSelectedKeyword(null)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear filter
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {result.keywords_summary.slice(0, 12).map((kw, index) => (
                <div
                  key={index}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <KeywordChip
                    keyword={kw.keyword}
                    count={kw.count}
                    isSelected={selectedKeyword === kw.keyword}
                    onClick={() => handleKeywordClick(kw.keyword)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Results Count */}
        <div className="flex items-center gap-2 text-neutral-600">
          <span className="font-medium text-foreground">
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
        </div>

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
          <div className="text-center py-24 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 mb-4">
              <Filter className="w-10 h-10 text-neutral-400" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
              No articles found
            </h3>
            <p className="text-neutral-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
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
