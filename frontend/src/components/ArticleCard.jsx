import React from 'react';
import { FiFileText, FiHash, FiMaximize2 } from 'react-icons/fi';

const ArticleCard = ({ article, onViewCrop }) => {
  const snippet = article.content.substring(0, 150) + '...';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Article Image Preview */}
        {article.crop_image_base64 && (
          <div className="md:w-48 flex-shrink-0">
            <div
              className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100"
              onClick={() => onViewCrop(article)}
            >
              <img
                src={`data:image/png;base64,${article.crop_image_base64}`}
                alt={article.title}
                className="w-full h-32 md:h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <FiMaximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <FiFileText className="w-5 h-5 text-blue-600" />
              <span>{article.title}</span>
            </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Page {article.page}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{snippet}</p>

          {/* Keywords */}
          {article.keywords && article.keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {article.keywords.slice(0, 5).map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                >
                  <FiHash className="w-3 h-3" />
                  <span>{keyword}</span>
                </span>
              ))}
            </div>
          )}

          {/* Hashtags */}
          {article.hashtags && article.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              {article.hashtags.map((tag, index) => (
                <span key={index}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
