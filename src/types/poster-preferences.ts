// Poster preferences types for the cartelería personalization

export interface PosterPreferences {
  // Display options - all the visualization toggles
  show_icons: boolean; // Mostrar iconos para habitaciones, baños y metros
  show_qr_code: boolean; // Incluir código QR
  show_watermark: boolean; // Mostrar logo como marca de agua
  show_phone: boolean; // Mostrar teléfono
  show_email: boolean; // Mostrar email de contacto
  show_website: boolean; // Mostrar sitio web
  show_reference: boolean; // Mostrar referencia del piso
  show_description: boolean; // Incluir descripción breve

  // Style preferences (from Estilo tab)
  template_style?: string; // Selected template style (e.g., "modern", "classic")

  // Format preferences (from Formatos tab)
  orientation?: "vertical" | "horizontal";
  format_ids?: string[]; // Selected format IDs (e.g., ["a4_vertical", "digital_story"])
}

// Default poster preferences
export const defaultPosterPreferences: PosterPreferences = {
  show_icons: true,
  show_qr_code: false,
  show_watermark: false,
  show_phone: true,
  show_email: false,
  show_website: false,
  show_reference: false,
  show_description: false,
};

// Props for the personalization component
export interface PersonalizationProps {
  currentSelection: {
    styleId: string | null;
    formatIds: string[];
  };
  preferences: PosterPreferences;
  onUpdate: (updates: { displayOptions: PosterPreferences }) => void;
}

// Props for display options control component
export interface DisplayOptionsProps {
  preferences: PosterPreferences;
  onChange: (updates: Partial<PosterPreferences>) => void;
}
