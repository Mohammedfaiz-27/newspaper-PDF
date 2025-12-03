import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function UploadZone({ onFileSelect, isProcessing }: UploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      alert("Please select a PDF file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-12 md:p-16 text-center transition-all duration-300 cursor-pointer group",
          dragActive
            ? "border-primary bg-primary/5 shadow-lifted"
            : "border-neutral-300 hover:border-primary/50 hover:shadow-card hover:bg-white",
          isProcessing && "opacity-50 pointer-events-none"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          disabled={isProcessing}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-6">
          <motion.div
            animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "p-6 rounded-full transition-colors duration-300",
              dragActive
                ? "bg-primary/10"
                : "bg-neutral-100 group-hover:bg-primary/10"
            )}
          >
            <Upload
              className={cn(
                "w-12 h-12 md:w-16 md:h-16 transition-colors duration-300",
                dragActive
                  ? "text-primary"
                  : "text-neutral-400 group-hover:text-primary"
              )}
            />
          </motion.div>

          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4 px-6 py-3 bg-primary/5 rounded-lg border border-primary/20"
              >
                <FileText className="w-6 h-6 text-primary flex-shrink-0" />
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-neutral-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="p-1 hover:bg-neutral-200 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-neutral-600" />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="no-file"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <p className="text-xl font-medium text-foreground">
                  Drop your newspaper PDF here
                </p>
                <p className="text-sm text-neutral-500">
                  or click to browse files
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedFile && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              disabled={isProcessing}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-lifted disabled:opacity-50"
            >
              Process PDF
            </motion.button>
          )}

          <p className="text-xs text-neutral-400 pt-4">
            Maximum file size: 50MB • Supported format: PDF
          </p>
        </div>
      </div>
    </motion.div>
  );
}
