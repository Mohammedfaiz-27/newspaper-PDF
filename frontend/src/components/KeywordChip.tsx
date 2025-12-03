import { motion } from "framer-motion";
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
    <motion.button
      onClick={onClick}
      disabled={!isClickable}
      whileHover={isClickable ? { scale: 1.05, y: -2 } : {}}
      whileTap={isClickable ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2 }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full font-medium transition-all duration-300",
        "border",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "sm" && "px-4 py-2 text-xs",
        isClickable && [
          "hover:shadow-card",
          isSelected
            ? "bg-primary text-primary-foreground border-primary shadow-sm"
            : "bg-white text-neutral-700 border-neutral-300 hover:border-primary hover:text-primary hover:bg-primary/5",
        ],
        !isClickable && "bg-neutral-100 text-neutral-600 border-neutral-200 cursor-default"
      )}
    >
      <span className="capitalize">{keyword}</span>
      {count !== undefined && (
        <span
          className={cn(
            "min-w-[1.5rem] px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums",
            isSelected
              ? "bg-white/20 text-white"
              : "bg-neutral-200 text-neutral-700"
          )}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}
