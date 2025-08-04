// Brand management type definitions
// Following patterns from src/lib/data.ts

export interface BrandAsset {
  id: string;
  accountId: string;
  logoOriginalUrl: string;
  logoTransparentUrl: string;
  colorPalette: string[]; // Array of 6 hex colors
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  updatedAt: Date;
}

export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  area: number; // percentage of image coverage
}

export interface ColorPalette {
  colors: ColorInfo[];
}

export interface BackgroundRemovalResult {
  originalBlob: Blob;
  transparentBlob: Blob;
  originalUrl: string;
  transparentUrl: string;
}

export interface LogoUploadProgress {
  stage: "uploading" | "processing" | "extracting" | "saving" | "complete";
  percentage: number;
  message: string;
}

export interface BrandUploadResult {
  brandAsset: BrandAsset;
  success: boolean;
  error?: string;
}

// Props for components
export interface LogoUploadProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  progress?: LogoUploadProgress;
  acceptedTypes?: string[];
  maxSize?: number; // in bytes
  className?: string;
}

export interface BrandColorPaletteProps {
  colors: string[];
  title?: string;
  showHexValues?: boolean;
  className?: string;
}
