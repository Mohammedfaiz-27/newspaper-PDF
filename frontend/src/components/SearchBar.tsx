import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { cn } from "../lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search articles by keyword or topic...",
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="relative">
      <motion.div
        animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex items-center border rounded-xl bg-white transition-all duration-300",
          isFocused
            ? "shadow-lifted ring-2 ring-primary/20 border-primary"
            : "shadow-card border-border hover:border-neutral-400"
        )}
      >
        <Search
          className={cn(
            "w-5 h-5 ml-4 transition-colors duration-300",
            isFocused ? "text-primary" : "text-neutral-400"
          )}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 px-4 py-4 text-base bg-transparent outline-none placeholder:text-neutral-400 text-foreground"
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={handleClear}
              className="mr-4 p-1.5 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-neutral-400 hover:text-neutral-600" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
