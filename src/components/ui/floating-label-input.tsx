import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "~/lib/utils";
import { Input } from "./input";

interface FloatingLabelInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  disabled?: boolean;
  type?: string;
  required?: boolean;
  name?: string;
}

export function FloatingLabelInput({
  id,
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  type = "text",
  required = false,
  name,
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const shouldShowLabel = isFocused || hasValue;

  return (
    <motion.div
      className="relative"
      animate={{
        marginTop: shouldShowLabel ? "32px" : "10px",
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <AnimatePresence>
        {shouldShowLabel && (
          <motion.label
            htmlFor={id}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -12 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute -left-1 -top-2 z-10 bg-transparent px-1 text-xs font-medium text-gray-600"
          >
            {placeholder}
            {required && <span className="ml-1 text-red-500">*</span>}
          </motion.label>
        )}
      </AnimatePresence>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={shouldShowLabel ? "" : placeholder}
        disabled={disabled}
        required={required}
        className={cn(
          "h-8 border-0 shadow-md transition-all duration-200",
          className,
        )}
      />
    </motion.div>
  );
}
