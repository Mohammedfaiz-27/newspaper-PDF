import { useState } from "react";
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
      <div
        className={cn(
          "flex items-center border rounded-xl bg-background transition-all duration-200",
          isFocused
            ? "shadow-lifted ring-2 ring-primary/20 scale-[1.02] border-primary"
            : "shadow-card border-input hover:shadow-lifted"
        )}
      >
        <Search className="w-5 h-5 text-neutral-400 ml-4" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 px-4 py-4 text-base bg-transparent outline-none placeholder:text-neutral-400"
        />
        {value && (
          <button
            onClick={handleClear}
            className="mr-4 p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        )}
      </div>
    </div>
  );
}
