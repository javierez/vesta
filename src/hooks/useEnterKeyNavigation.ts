import { useEffect } from "react";

/**
 * Custom hook that adds Enter key navigation to form pages
 * Triggers the provided callback when Enter is pressed (similar to clicking Next/Finalizar)
 * Excludes textarea, contenteditable elements, and input fields to avoid conflicts
 */
export function useEnterKeyNavigation(callback: () => void) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger if Enter is pressed and not in combination with other keys
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        event.target instanceof Element
      ) {
        const target = event.target as HTMLElement;
        
        // Don't trigger if user is typing in a textarea or contenteditable
        if (
          target.tagName === "TEXTAREA" ||
          target.contentEditable === "true" ||
          target.isContentEditable
        ) {
          return;
        }

        // Don't trigger if user is typing in an input field
        if (target.tagName === "INPUT") {
          return;
        }

        // Don't trigger if user is interacting with a button (let the button handle it)
        if (target.tagName === "BUTTON") {
          return;
        }

        // Don't trigger if user is interacting with a select element
        if (target.tagName === "SELECT") {
          return;
        }

        // Prevent default form submission
        event.preventDefault();
        
        // Trigger the callback (same as clicking Next/Finalizar)
        callback();
      }
    };

    // Add event listener to the document
    document.addEventListener("keydown", handleKeyPress);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [callback]);
}