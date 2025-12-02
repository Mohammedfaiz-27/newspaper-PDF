import React from 'react';
import { FiLoader, FiCheck, FiCircle } from 'react-icons/fi';

const PROCESSING_STEPS = [
  'Uploading...',
  'Processing PDF...',
  'Extracting text...',
  'Splitting into articles...',
  'Extracting keywords...',
  'Cropping news article images...',
  'Finalizing...',
];

const LoadingStatus = ({ currentStep, progress }) => {
  const getCurrentStepIndex = () => {
    const stepMap = {
      'Initializing...': 0,
      'Starting...': 0,
      'Extracting text from PDF...': 2,
      'Processing PDF pages...': 2,
      'Detecting and splitting articles...': 3,
      'Extracting keywords...': 4,
      'Cropping articles': 5,
      'Computing related articles...': 5,
      'Generating summary...': 5,
      'Storing articles in database...': 6,
      'Finalizing...': 6,
      'Completed': 7,
    };

    for (const [key, index] of Object.entries(stepMap)) {
      if (currentStep.includes(key)) {
        return index;
      }
    }

    // Fallback based on progress
    if (progress < 10) return 0;
    if (progress < 30) return 2;
    if (progress < 50) return 3;
    if (progress < 70) return 4;
    if (progress < 90) return 5;
    if (progress < 100) return 6;
    return 7;
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Processing Your PDF
        </h2>
        <p className="text-gray-600">{currentStep}</p>
      </div>

      <div className="space-y-4 mb-8">
        {PROCESSING_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={index}
              className={`flex items-center space-x-3 transition-all duration-300 ${
                isCurrent ? 'scale-105' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-500'
                    : isCurrent
                    ? 'bg-blue-500'
                    : 'bg-gray-200'
                }`}
              >
                {isCompleted ? (
                  <FiCheck className="w-5 h-5 text-white" />
                ) : isCurrent ? (
                  <FiLoader className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <FiCircle className="w-3 h-3 text-gray-400" />
                )}
              </div>

              <div className="flex-1">
                <p
                  className={`font-medium ${
                    isCompleted
                      ? 'text-green-600'
                      : isCurrent
                      ? 'text-blue-600'
                      : 'text-gray-400'
                  }`}
                >
                  {step}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-center space-x-2 text-sm text-gray-500">
        <FiLoader className="animate-spin" />
        <span>This may take a few moments...</span>
      </div>
    </div>
  );
};

export default LoadingStatus;
