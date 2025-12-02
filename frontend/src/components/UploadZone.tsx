import { useState, useRef } from "react";
import { Upload, FileText } from "lucide-react";
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
    <div className="w-full max-w-2xl mx-auto animate-fade-in-scale">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-16 text-center transition-all cursor-pointer group",
          dragActive
            ? "border-primary bg-teal-light/30 shadow-lifted"
            : "border-neutral-300 hover:border-primary/50 hover:shadow-lifted hover:bg-neutral-50",
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
          <div
            className={cn(
              "p-6 rounded-full transition-colors",
              dragActive
                ? "bg-primary/10"
                : "bg-neutral-100 group-hover:bg-primary/10"
            )}
          >
            <Upload
              className={cn(
                "w-16 h-16 transition-colors",
                dragActive
                  ? "text-primary"
                  : "text-neutral-400 group-hover:text-primary"
              )}
            />
          </div>

          {selectedFile ? (
            <div className="flex items-center space-x-3 text-primary animate-fade-in">
              <FileText className="w-6 h-6" />
              <div className="text-left">
                <p className="font-medium text-lg">{selectedFile.name}</p>
                <p className="text-sm text-neutral-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xl font-medium text-foreground">
                Drop your newspaper PDF here
              </p>
              <p className="text-sm text-neutral-500">
                or click to browse files
              </p>
            </div>
          )}

          {selectedFile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              disabled={isProcessing}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow-lifted disabled:opacity-50 animate-fade-in"
            >
              Process PDF
            </button>
          )}

          <p className="text-xs text-neutral-400 pt-4">
            Maximum file size: 50MB • Supported format: PDF
          </p>
        </div>
      </div>
    </div>
  );
}
