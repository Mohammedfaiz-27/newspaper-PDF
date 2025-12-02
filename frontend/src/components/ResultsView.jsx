import React, { useState } from 'react';
import KeywordCard from './KeywordCard';
import ArticleCard from './ArticleCard';
import ArticleModal from './ArticleModal';
import SearchBar from './SearchBar';
import { FiGrid, FiList } from 'react-icons/fi';
import { searchArticles, getArticlesByKeyword } from '../services/api';

const ResultsView = ({ result, onReset }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalArticles, setModalArticles] = useState([]);
  const [modalKeyword, setModalKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'search'

  const handleKeywordClick = async (keyword) => {
    try {
      const articles = await getArticlesByKeyword(keyword);
      setModalArticles(articles);
      setModalKeyword(keyword);
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching articles by keyword:', error);
      alert('Failed to load articles for this keyword');
    }
  };

  const handleViewCrop = (article) => {
    setModalArticles([article]);
    setModalKeyword('');
    setModalOpen(true);
  };

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      setViewMode('all');
      return;
    }

    setIsSearching(true);
    setViewMode('search');

    try {
      const results = await searchArticles(query, 20);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching articles:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const articlesToDisplay =
    viewMode === 'search' ? searchResults : result.articles;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Processing Complete!
        </h1>
        <p className="text-gray-600">
          Found {result.articles.length} articles across {result.pages} pages
        </p>
        <button
          onClick={onReset}
          className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Process Another PDF
        </button>
      </div>

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} isSearching={isSearching} />

      {/* Keywords Summary */}
      {viewMode === 'all' && result.keywords_summary.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <FiGrid className="w-6 h-6" />
            <span>Top Keywords</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {result.keywords_summary.slice(0, 12).map((kw, index) => (
              <KeywordCard
                key={index}
                keyword={kw.keyword}
                count={kw.count}
                onClick={() => handleKeywordClick(kw.keyword)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Articles List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
          <FiList className="w-6 h-6" />
          <span>
            {viewMode === 'search'
              ? `Search Results (${searchResults.length})`
              : 'All Articles'}
          </span>
        </h2>

        {viewMode === 'search' && searchResults.length === 0 && !isSearching && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No articles found for your search.</p>
          </div>
        )}

        <div className="space-y-4">
          {articlesToDisplay.map((article) => (
            <ArticleCard
              key={article.article_id}
              article={article}
              onViewCrop={handleViewCrop}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      <ArticleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        articles={modalArticles}
        keyword={modalKeyword}
      />
    </div>
  );
};

export default ResultsView;
