"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { ExpandableSectionProps } from "~/types/activity";

export function ExpandableSection({
  title,
  count,
  defaultExpanded = true,
  children,
  storageKey,
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Load from localStorage on mount
  useEffect(() => {
    if (storageKey && typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setIsExpanded(saved === "true");
      }
    }
  }, [storageKey]);

  // Save to localStorage when changed
  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (storageKey && typeof window !== "undefined") {
      localStorage.setItem(storageKey, String(newState));
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between group"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          {title} <span className="text-gray-500 font-normal">({count})</span>
        </h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 group-hover:text-gray-600 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="animate-in fade-in duration-200">{children}</div>
      )}
    </div>
  );
}
