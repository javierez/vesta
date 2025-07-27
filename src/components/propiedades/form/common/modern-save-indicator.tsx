import React, { useState, useEffect } from "react";
import { Check, AlertCircle, Save } from "lucide-react";
import { cn } from "~/lib/utils";

type SaveState = "idle" | "modified" | "saving" | "saved" | "error";

interface ModernSaveIndicatorProps {
  state: SaveState;
  onSave: () => Promise<void>;
  className?: string;
}

export function ModernSaveIndicator({
  state,
  onSave,
  className,
}: ModernSaveIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(state !== "idle");
  }, [state]);

  const handleClick = async () => {
    if (state === "modified") {
      await onSave();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "absolute -right-2 -top-2 z-10 transition-all duration-500 ease-out",
        "transform-gpu",
        isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0",
        className,
      )}
    >
      {/* Modified State - Floating Save Button */}
      {state === "modified" && (
        <button
          onClick={handleClick}
          className={cn(
            "group relative",
            "h-8 w-8 rounded-full",
            "bg-gradient-to-br from-yellow-400 to-amber-500",
            "shadow-lg shadow-yellow-500/25",
            "hover:shadow-xl hover:shadow-yellow-500/40",
            "hover:scale-110 active:scale-95",
            "transition-all duration-300 ease-out",
            "border border-white/20",
            "backdrop-blur-sm",
          )}
        >
          <div className="relative flex h-full items-center justify-center">
            <Save className="h-4 w-4 text-white transition-transform duration-200 group-hover:scale-110" />
          </div>
        </button>
      )}

      {/* Saving State - Animated Ring */}
      {state === "saving" && (
        <div className="relative h-8 w-8">
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              "bg-gradient-to-br from-amber-400 to-orange-500",
              "shadow-lg shadow-amber-500/25",
              "border border-white/20",
              "backdrop-blur-sm",
            )}
          >
            <div className="absolute inset-1 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        </div>
      )}

      {/* Saved State - Success Checkmark */}
      {state === "saved" && (
        <div
          className={cn(
            "h-8 w-8 rounded-full",
            "bg-gradient-to-br from-emerald-500 to-green-600",
            "shadow-lg shadow-emerald-500/25",
            "border border-white/20",
            "backdrop-blur-sm",
            "flex items-center justify-center",
            "animate-in zoom-in-50 duration-500",
          )}
        >
          <Check className="animate-in zoom-in-50 h-4 w-4 text-white delay-100 duration-300" />
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20" />
        </div>
      )}

      {/* Error State - Error Indicator */}
      {state === "error" && (
        <div
          className={cn(
            "h-8 w-8 rounded-full",
            "bg-gradient-to-br from-red-500 to-red-600",
            "shadow-lg shadow-red-500/25",
            "border border-white/20",
            "backdrop-blur-sm",
            "flex items-center justify-center",
            "animate-bounce",
          )}
        >
          <AlertCircle className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}
