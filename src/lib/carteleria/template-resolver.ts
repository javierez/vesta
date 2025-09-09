import { type FC } from "react";
import type { ConfigurableTemplateProps } from "~/types/template-data";
import { ClassicTemplate } from "~/components/admin/carteleria/templates/classic/classic-vertical-template";
import { BasicTemplate } from "~/components/propiedades/detail/cartel/templates/basic-template";

export type TemplateStyle = "classic" | "basic";

export interface AccountPreferences {
  poster_preferences?: {
    template_style?: TemplateStyle;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Resolves and returns the appropriate template component based on account preferences
 * @param preferences - Account preferences JSON containing poster_preferences
 * @returns The template component to render
 */
export function getTemplateComponent(
  preferences: string | AccountPreferences | null | undefined,
): FC<ConfigurableTemplateProps> {
  try {
    let parsedPreferences: AccountPreferences;

    // Handle different input formats
    if (typeof preferences === "string") {
      parsedPreferences = JSON.parse(preferences) as AccountPreferences;
    } else if (preferences && typeof preferences === "object") {
      parsedPreferences = preferences;
    } else {
      // Default to classic template if no preferences
      return ClassicTemplate;
    }

    // Extract template style from poster_preferences
    const templateStyle = parsedPreferences.poster_preferences?.template_style;

    switch (templateStyle) {
      case "basic":
        return BasicTemplate;
      case "classic":
      default:
        return ClassicTemplate;
    }
  } catch (error) {
    console.error("Error parsing account preferences for template selection:", error);
    // Fallback to classic template on error
    return ClassicTemplate;
  }
}

/**
 * Gets the template style name from preferences for display purposes
 * @param preferences - Account preferences JSON containing poster_preferences
 * @returns The template style name or "classic" as default
 */
export function getTemplateStyleName(
  preferences: string | AccountPreferences | null | undefined,
): TemplateStyle {
  try {
    let parsedPreferences: AccountPreferences;

    if (typeof preferences === "string") {
      parsedPreferences = JSON.parse(preferences) as AccountPreferences;
    } else if (preferences && typeof preferences === "object") {
      parsedPreferences = preferences;
    } else {
      return "classic";
    }

    return parsedPreferences.poster_preferences?.template_style ?? "classic";
  } catch (error) {
    console.error("Error parsing account preferences for template style:", error);
    return "classic";
  }
}