import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HomePage } from "./components/HomePage";
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
            alert("Failed to fetch results. Please try again.");
            setAppState("upload");
          }
        } else if (status.status === "failed") {
          clearInterval(pollInterval);
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

      const response = await uploadPDF(file);
      setJobId(response.job_id);
    } catch (err: any) {
      console.error("Upload error:", err);
      setAppState("upload");
      alert(`Upload failed: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {appState === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <HomePage onFileSelect={handleFileSelect} isProcessing={false} />
          </motion.div>
        )}

        {appState === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-gradient-to-br from-background via-neutral-50 to-background flex items-center justify-center px-6 py-12"
          >
            <ProcessingSteps currentStep={currentStep} progress={progress} />
          </motion.div>
        )}

        {appState === "dashboard" && result && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dashboard result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
