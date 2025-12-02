import React from 'react';
import { FiTag, FiEye } from 'react-icons/fi';

const KeywordCard = ({ keyword, count, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 shadow-md hover:shadow-lg transition-all cursor-pointer transform hover:scale-105 text-white"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <FiTag className="w-5 h-5" />
          <h3 className="font-semibold text-lg capitalize">{keyword}</h3>
        </div>
        <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm font-medium">
          {count}
        </span>
      </div>

      <div className="flex items-center space-x-1 text-sm opacity-90">
        <FiEye className="w-4 h-4" />
        <span>View Articles</span>
      </div>
    </div>
  );
};

export default KeywordCard;
