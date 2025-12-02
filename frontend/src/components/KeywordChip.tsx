import { Hash } from "lucide-react";
import { cn } from "../lib/utils";

interface KeywordChipProps {
  keyword: string;
  count?: number;
  isSelected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}

export function KeywordChip({
  keyword,
  count,
  isSelected = false,
  onClick,
  size = "md",
}: KeywordChipProps) {
  const isClickable = !!onClick;

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={cn(
        "inline-flex items-center space-x-2 rounded-lg font-medium transition-all",
        "border",
        size === "md" && "px-4 py-2.5 text-sm",
        size === "sm" && "px-3 py-1.5 text-xs",
        isClickable && [
          "hover:shadow-card hover:-translate-y-0.5",
          isSelected
            ? "bg-primary text-primary-foreground border-primary shadow-card"
            : "bg-background text-foreground border-input hover:border-primary/50",
        ],
        !isClickable && "bg-neutral-100 text-neutral-700 border-neutral-200 cursor-default"
      )}
    >
      <Hash className={cn(size === "md" ? "w-4 h-4" : "w-3 h-3")} />
      <span className="capitalize">{keyword}</span>
      {count !== undefined && (
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-semibold",
            isSelected ? "bg-white/20" : "bg-neutral-200 text-neutral-700"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
