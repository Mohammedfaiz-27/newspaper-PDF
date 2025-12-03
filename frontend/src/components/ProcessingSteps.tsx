import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Scissors,
  Hash,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Circle,
} from "lucide-react";
import { cn } from "../lib/utils";

interface ProcessingStepsProps {
  currentStep: string;
  progress: number;
}

const STEPS = [
  { id: 1, name: "Uploading...", icon: Upload },
  { id: 2, name: "Processing PDF...", icon: FileText },
  { id: 3, name: "Extracting text...", icon: FileText },
  { id: 4, name: "Detecting articles...", icon: Scissors },
  { id: 5, name: "Extracting keywords...", icon: Hash },
  { id: 6, name: "Cropping images...", icon: ImageIcon },
  { id: 7, name: "Finalizing...", icon: CheckCircle2 },
];

export function ProcessingSteps({ currentStep, progress }: ProcessingStepsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Map backend steps to frontend step indices
    const stepMap: Record<string, number> = {
      "Initializing...": 0,
      "Starting...": 0,
      "Uploading...": 0,
      "Extracting text from PDF...": 2,
      "Processing PDF pages...": 2,
      "Detecting and splitting articles...": 3,
      "Extracting keywords...": 4,
      "Computing related articles...": 5,
      "Cropping articles": 5,
      "Generating summary...": 5,
      "Storing articles in database...": 6,
      "Finalizing...": 6,
      "Completed": 7,
    };

    // Find matching step or fallback to progress-based estimation
    let index = 0;
    for (const [key, value] of Object.entries(stepMap)) {
      if (currentStep.includes(key)) {
        index = value;
        break;
      }
    }

    // Fallback based on progress if no match found
    if (index === 0 && progress > 0) {
      if (progress < 20) index = 1;
      else if (progress < 30) index = 2;
      else if (progress < 50) index = 3;
      else if (progress < 70) index = 4;
      else if (progress < 90) index = 5;
      else index = 6;
    }

    setCurrentIndex(index);
  }, [currentStep, progress]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-2xl mx-auto bg-card rounded-xl shadow-card p-8 md:p-10 border border-border"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
          Processing Your Document
        </h2>
        <p className="text-neutral-600">{currentStep}</p>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-10"
      >
        <div className="flex justify-between text-sm text-neutral-600 mb-3">
          <span className="font-medium">Progress</span>
          <span className="font-semibold text-primary">{progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-neutral-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="h-full bg-gradient-to-r from-primary via-teal-medium to-primary rounded-full"
          />
        </div>
      </motion.div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          const Icon = step.icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
              className={cn(
                "flex items-center space-x-4 p-3 rounded-lg transition-all duration-300",
                isCurrent && "bg-primary/5 scale-[1.02]"
              )}
            >
              <motion.div
                animate={isCurrent ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 2, repeat: isCurrent ? Infinity : 0 }}
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted && "bg-primary shadow-sm",
                  isCurrent && "bg-primary shadow-md",
                  isPending && "bg-neutral-200"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Circle className="w-3 h-3 text-neutral-400" />
                )}
              </motion.div>

              <div className="flex-1">
                <p
                  className={cn(
                    "font-medium transition-colors duration-300",
                    isCompleted && "text-primary",
                    isCurrent && "text-primary font-semibold",
                    isPending && "text-neutral-400"
                  )}
                >
                  {step.name}
                </p>
              </div>

              <Icon
                className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isCompleted && "text-primary",
                  isCurrent && "text-primary",
                  isPending && "text-neutral-300"
                )}
              />
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="mt-8 pt-6 border-t border-border flex items-center justify-center space-x-2 text-sm text-neutral-500"
      >
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span>This usually takes less than a minute</span>
      </motion.div>
    </motion.div>
  );
}
