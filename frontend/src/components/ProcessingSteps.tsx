import { useEffect, useState } from "react";
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
    <div className="w-full max-w-2xl mx-auto bg-card rounded-xl shadow-card p-8 animate-fade-in-scale">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Processing Your PDF
        </h2>
        <p className="text-neutral-600">{currentStep}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-neutral-600 mb-2">
          <span>Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-teal-medium transition-all duration-500 ease-out origin-left"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center space-x-4 transition-all duration-300",
                isCurrent && "scale-105"
              )}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isCompleted && "bg-teal-medium",
                  isCurrent && "bg-primary",
                  isPending && "bg-neutral-200",
                  isCurrent && "shadow-lifted animate-shimmer"
                )}
                style={{
                  backgroundImage:
                    isCurrent
                      ? "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, hsl(var(--teal-medium)) 50%, hsl(var(--primary)) 60%, hsl(var(--primary)) 100%)"
                      : undefined,
                  backgroundSize: isCurrent ? "200% 100%" : undefined,
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Circle className="w-3 h-3 text-neutral-400" />
                )}
              </div>

              <div className="flex-1">
                <p
                  className={cn(
                    "font-medium transition-colors",
                    isCompleted && "text-teal-dark",
                    isCurrent && "text-primary",
                    isPending && "text-neutral-400"
                  )}
                >
                  {step.name}
                </p>
              </div>

              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isCompleted && "text-teal-dark",
                  isCurrent && "text-primary",
                  isPending && "text-neutral-300"
                )}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-center space-x-2 text-sm text-neutral-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>This may take a few moments...</span>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
