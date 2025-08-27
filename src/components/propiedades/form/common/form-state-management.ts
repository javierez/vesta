"use client";

import { useState, useEffect } from "react";

// Types that all forms must use
export type SaveState = "idle" | "modified" | "saving" | "saved" | "error";

export interface ModuleState {
  saveState: SaveState;
  hasChanges: boolean;
  lastSaved?: Date;
}

// Generic module names type - can be extended by specific forms
export type BaseModuleName =
  | "basicInfo"
  | "propertyDetails"
  | "location"
  | "features"
  | "description"
  | "contactInfo";

/**
 * Hook to manage module states for property forms
 * @param hasPropertyTypeChanged - Whether the property type has been changed
 * @param moduleNames - Array of module names specific to the form
 * @returns Object with moduleStates and setModuleStates
 */
export function useModuleStates<T extends string>(
  hasPropertyTypeChanged: boolean,
  moduleNames: T[],
): {
  moduleStates: Record<T, ModuleState>;
  setModuleStates: React.Dispatch<React.SetStateAction<Record<T, ModuleState>>>;
  updateModuleState: (moduleName: T, hasChanges: boolean) => void;
} {
  const [moduleStates, setModuleStates] = useState<Record<T, ModuleState>>(
    () => {
      const initialState = {} as Record<T, ModuleState>;

      // Initialize all modules with idle state
      moduleNames.forEach((moduleName) => {
        initialState[moduleName] = {
          saveState: "idle" as SaveState,
          hasChanges:
            moduleName === "basicInfo"
              ? Boolean(hasPropertyTypeChanged)
              : false,
        };
      });

      // Set basicInfo to modified if property type changed
      if (hasPropertyTypeChanged && initialState["basicInfo" as T]) {
        initialState["basicInfo" as T].saveState = "modified";
      }

      return initialState;
    },
  );

  // Update module states when property type change is detected
  useEffect(() => {
    if (hasPropertyTypeChanged) {
      setModuleStates((prev) => ({
        ...prev,
        ["basicInfo" as T]: {
          ...prev["basicInfo" as T],
          saveState: "modified",
          hasChanges: true,
        },
      }));
    }
  }, [hasPropertyTypeChanged]);

  // Function to update module state
  const updateModuleState = (moduleName: T, hasChanges: boolean) => {
    setModuleStates((prev) => {
      const currentState = prev[moduleName] ?? {
        saveState: "idle" as SaveState,
        hasChanges: false,
      };
      return {
        ...prev,
        [moduleName]: {
          ...currentState,
          saveState: hasChanges ? "modified" : "idle",
          hasChanges,
          lastSaved: currentState.lastSaved,
        },
      };
    });
  };

  return { moduleStates, setModuleStates, updateModuleState };
}

/**
 * Get CSS classes for card styling based on save state
 * @param state - Current save state of the module
 * @returns CSS class string for styling
 */
export function getCardStyles(state: SaveState): string {
  switch (state) {
    case "modified":
      return "ring-2 ring-yellow-500/20 shadow-lg shadow-yellow-500/10 border-yellow-500/20";
    case "saving":
      return "ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10 border-amber-500/20";
    case "saved":
      return "ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/10 border-emerald-500/20";
    case "error":
      return "ring-2 ring-red-500/20 shadow-lg shadow-red-500/10 border-red-500/20";
    default:
      return "hover:shadow-lg transition-all duration-300";
  }
}

/**
 * Update module state to indicate save operation started
 * @param setModuleStates - State setter function
 * @param moduleName - Name of the module being saved
 */
export function setModuleSaving<T extends string>(
  setModuleStates: React.Dispatch<React.SetStateAction<Record<T, ModuleState>>>,
  moduleName: T,
): void {
  setModuleStates((prev) => {
    const currentState = prev[moduleName] ?? {
      saveState: "idle" as SaveState,
      hasChanges: false,
    };
    return {
      ...prev,
      [moduleName]: {
        ...currentState,
        saveState: "saving",
        hasChanges: currentState.hasChanges,
      },
    };
  });
}

/**
 * Update module state to indicate successful save
 * @param setModuleStates - State setter function
 * @param moduleName - Name of the module that was saved
 */
export function setModuleSaved<T extends string>(
  setModuleStates: React.Dispatch<React.SetStateAction<Record<T, ModuleState>>>,
  moduleName: T,
): void {
  setModuleStates((prev) => ({
    ...prev,
    [moduleName]: {
      ...prev[moduleName],
      saveState: "saved",
      hasChanges: false,
      lastSaved: new Date(),
    },
  }));
}

/**
 * Update module state to indicate save error
 * @param setModuleStates - State setter function
 * @param moduleName - Name of the module that failed to save
 */
export function setModuleError<T extends string>(
  setModuleStates: React.Dispatch<React.SetStateAction<Record<T, ModuleState>>>,
  moduleName: T,
): void {
  setModuleStates((prev) => ({
    ...prev,
    [moduleName]: {
      ...prev[moduleName],
      saveState: "error",
    },
  }));
}

/**
 * Check if property type has changed based on listing and search params
 * @param listing - Property listing object
 * @param searchParams - URL search parameters
 * @returns boolean indicating if property type changed
 */
export function checkPropertyTypeChanged(
  listing: { propertyType?: string },
  searchParams: URLSearchParams | null,
): boolean {
  return Boolean(
    listing.propertyType &&
      searchParams?.get("type") &&
      listing.propertyType !== searchParams.get("type"),
  );
}
