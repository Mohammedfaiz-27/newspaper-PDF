import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import LoadingStatus from './components/LoadingStatus';
import ResultsView from './components/ResultsView';
import { uploadPDF, getJobStatus, getJobResult } from './services/api';
import { FiAlertCircle } from 'react-icons/fi';

function App() {
  const [stage, setStage] = useState('upload'); // 'upload', 'processing', 'results', 'error'
  const [jobId, setJobId] = useState(null);
  const [currentStep, setCurrentStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let pollInterval;

    if (stage === 'processing' && jobId) {
      // Poll for status updates
      pollInterval = setInterval(async () => {
        try {
          const status = await getJobStatus(jobId);

          setCurrentStep(status.step);
          setProgress(status.progress);

          if (status.status === 'completed') {
            clearInterval(pollInterval);
            // Fetch final result
            try {
              const finalResult = await getJobResult(jobId);
              setResult(finalResult);
              setStage('results');
            } catch (err) {
              console.error('Error fetching result:', err);
              setError('Failed to fetch results. Please try again.');
              setStage('error');
            }
          } else if (status.status === 'failed') {
            clearInterval(pollInterval);
            setError(status.error || 'Processing failed');
            setStage('error');
          }
        } catch (err) {
          console.error('Error polling status:', err);
        }
      }, 1000); // Poll every second
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [stage, jobId]);

  const handleFileSelect = async (file) => {
    try {
      setStage('processing');
      setProgress(0);
      setCurrentStep('Uploading...');

      const response = await uploadPDF(file);
      setJobId(response.job_id);
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err.response?.data?.detail || 'Failed to upload file. Please try again.'
      );
      setStage('error');
    }
  };

  const handleReset = () => {
    setStage('upload');
    setJobId(null);
    setCurrentStep('');
    setProgress(0);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Newspaper PDF Processor
          </h1>
          <p className="text-gray-600 mt-1">
            Extract, analyze, and search news articles from PDF newspapers
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {stage === 'upload' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Upload Your Newspaper PDF
              </h2>
              <p className="text-gray-600">
                Our AI will extract articles, keywords, and create searchable content
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} isProcessing={false} />
          </div>
        )}

        {stage === 'processing' && (
          <LoadingStatus currentStep={currentStep} progress={progress} />
        )}

        {stage === 'results' && result && (
          <ResultsView result={result} onReset={handleReset} />
        )}

        {stage === 'error' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-800 mb-2">
                Processing Failed
              </h2>
              <p className="text-red-700 mb-6">{error}</p>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          Powered by FastAPI, React, and AI-driven NLP
        </div>
      </footer>
    </div>
  );
}

export default App;
