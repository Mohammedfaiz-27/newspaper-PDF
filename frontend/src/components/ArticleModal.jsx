import React, { useEffect } from 'react';
import { FiX, FiExternalLink } from 'react-icons/fi';

const ArticleModal = ({ isOpen, onClose, articles, keyword }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div>
            <h2 className="text-2xl font-bold">
              {keyword ? `Articles: "${keyword}"` : 'Article Details'}
            </h2>
            <p className="text-sm opacity-90 mt-1">
              {articles.length} article{articles.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
          <div className="space-y-6">
            {articles.map((article) => (
              <div
                key={article.article_id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Cropped Image */}
                  {article.crop_image_base64 && (
                    <div className="lg:w-1/2">
                      <div className="bg-white rounded-lg p-2 shadow-sm">
                        <img
                          src={`data:image/png;base64,${article.crop_image_base64}`}
                          alt={article.title}
                          className="w-full h-auto rounded"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Page {article.page}
                      </p>
                    </div>
                  )}

                  {/* Article Details */}
                  <div className="lg:w-1/2 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {article.title}
                      </h3>
                      <div className="bg-white rounded p-3 max-h-64 overflow-y-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {article.content}
                        </p>
                      </div>
                    </div>

                    {/* Keywords */}
                    {article.keywords && article.keywords.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Keywords:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {article.keywords.map((kw, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hashtags */}
                    {article.hashtags && article.hashtags.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Hashtags:
                        </h4>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                          {article.hashtags.map((tag, index) => (
                            <span key={index}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Articles */}
                    {article.related_articles &&
                      article.related_articles.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                            <FiExternalLink className="w-4 h-4" />
                            <span>Related Articles:</span>
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {article.related_articles.map((relatedId, index) => (
                              <span
                                key={index}
                                className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs"
                              >
                                {relatedId}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;
