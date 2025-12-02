import { useState, useEffect } from "react";
import { UploadZone } from "./components/UploadZone";
import { ProcessingSteps } from "./components/ProcessingSteps";
import { Dashboard } from "./pages/Dashboard";
import { uploadPDF, getJobStatus, getJobResult } from "./lib/api";
import type { AppState, ProcessResult } from "./types";

function App() {
  const [appState, setAppState] = useState<AppState>("upload");
  const [jobId, setJobId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll for job status
  useEffect(() => {
    if (appState !== "processing" || !jobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const status = await getJobStatus(jobId);

        setCurrentStep(status.step);
        setProgress(status.progress);

        if (status.status === "completed") {
          clearInterval(pollInterval);
          // Fetch final result
          try {
            const finalResult = await getJobResult(jobId);
            setResult(finalResult);
            setAppState("dashboard");
          } catch (err) {
            console.error("Error fetching result:", err);
            setError("Failed to fetch results. Please try again.");
            setAppState("upload");
          }
        } else if (status.status === "failed") {
          clearInterval(pollInterval);
          setError(status.error || "Processing failed");
          setAppState("upload");
          alert(`Processing failed: ${status.error || "Unknown error"}`);
        }
      } catch (err) {
        console.error("Error polling status:", err);
      }
    }, 1000); // Poll every second

    return () => clearInterval(pollInterval);
  }, [appState, jobId]);

  const handleFileSelect = async (file: File) => {
    try {
      setAppState("processing");
      setProgress(0);
      setCurrentStep("Uploading...");
      setError(null);

      const response = await uploadPDF(file);
      setJobId(response.job_id);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.detail || "Failed to upload file. Please try again."
      );
      setAppState("upload");
      alert(`Upload failed: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleReset = () => {
    setAppState("upload");
    setJobId(null);
    setCurrentStep("");
    setProgress(0);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen">
      {appState === "upload" && (
        <div className="min-h-screen bg-gradient-to-br from-background via-neutral-50 to-background flex flex-col">
          {/* Header */}
          <header className="w-full px-6 py-12 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              Newspaper PDF Processor
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Extract, analyze, and search news articles from PDF newspapers
              using advanced AI-driven NLP
            </p>
          </header>

          {/* Upload Zone */}
          <main className="flex-1 flex items-center justify-center px-6 pb-12">
            <UploadZone onFileSelect={handleFileSelect} isProcessing={false} />
          </main>

          {/* Footer */}
          <footer className="w-full px-6 py-8 text-center text-sm text-neutral-500 border-t border-border">
            Powered by FastAPI, React, and AI-driven NLP
          </footer>
        </div>
      )}

      {appState === "processing" && (
        <div className="min-h-screen bg-gradient-to-br from-background via-neutral-50 to-background flex items-center justify-center px-6 py-12">
          <ProcessingSteps currentStep={currentStep} progress={progress} />
        </div>
      )}

      {appState === "dashboard" && result && (
        <Dashboard result={result} />
      )}
    </div>
  );
}

export default App;
