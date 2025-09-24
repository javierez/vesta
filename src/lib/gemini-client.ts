import { GoogleGenAI } from "@google/genai";
import { 
  GEMINI_RENOVATION_SETTINGS,
  getRenovationPromptWithStyle,
  type GeminiRenovationResponse,
  type RenovationType,
  type RenovationStyle
} from "~/types/gemini";

// Environment validation function (called at runtime, not module load)
function validateEnvironment() {
  const requiredEnvVars = {
    GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
  };

  const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required Gemini environment variables: ${missingEnvVars.join(", ")}`,
    );
  }
}

class GeminiClient {
  private genAI: GoogleGenAI;
  
  constructor() {
    validateEnvironment();
    this.genAI = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GEMINI_API_KEY!
    });
  }

  /**
   * Detect room type from image analysis (simplified heuristic)
   * In a real implementation, you might use additional AI analysis
   */
  private detectRoomType(_imageBase64: string): RenovationType {
    // For now, default to generic renovation
    // Could be enhanced with additional image analysis
    return 'generic';
  }

  /**
   * Generate renovation image using Gemini API
   * Uses the gemini-2.5-flash-image-preview model for image editing
   */
  async renovateImage(imageBase64: string, roomType?: RenovationType, style: RenovationStyle = 'modern'): Promise<GeminiRenovationResponse> {
    try {
      // Auto-detect room type if not provided
      const detectedRoomType = roomType ?? this.detectRoomType(imageBase64);
      const prompt = getRenovationPromptWithStyle(detectedRoomType, style);

      console.log('Gemini API renovation request:', {
        model: GEMINI_RENOVATION_SETTINGS.model,
        roomType: detectedRoomType,
        style: style,
        prompt: prompt.substring(0, 100) + '...',
        imageDataLength: imageBase64.length,
        settings: GEMINI_RENOVATION_SETTINGS
      });

      // Clean base64 string (remove data URL prefix if present)
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

      // Prepare the content array with text prompt and image
      const contents = [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64,
          },
        },
      ];

      // Call Gemini API
      const model = this.genAI.models.generateContent({
        model: GEMINI_RENOVATION_SETTINGS.model,
        contents,
      });

      const response = await model;

      console.log('Gemini API response received:', {
        candidatesCount: response.candidates?.length ?? 0,
        hasContent: !!response.candidates?.[0]?.content
      });

      // Process response to find generated image
      if (!response.candidates?.[0]?.content?.parts) {
        throw new Error('No content returned from Gemini API');
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          
          console.log('Generated image found:', {
            mimeType: part.inlineData.mimeType,
            dataLength: imageData?.length ?? 0
          });

          return {
            success: true,
            renovatedImageBase64: imageData
          };
        }
      }

      // If no image data found, check for text response that might contain error info
      const textParts = response.candidates[0].content.parts.filter(part => part.text);
      if (textParts.length > 0) {
        console.log('Gemini text response:', textParts[0]?.text);
        throw new Error('Gemini API returned text instead of image. Response: ' + textParts[0]?.text);
      }

      throw new Error('No image data found in Gemini API response');

    } catch (error) {
      console.error("Gemini renovation error:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Validate image format and size for Gemini API
   */
  validateImageInput(imageBase64: string): { valid: boolean; error?: string } {
    try {
      // Check if it's a valid base64 string
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return { valid: false, error: 'Invalid image data format' };
      }

      // Remove data URL prefix if present for size calculation
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      
      // Check base64 format
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
        return { valid: false, error: 'Invalid base64 format' };
      }

      // Calculate approximate file size (base64 is ~33% larger than original)
      const sizeInBytes = (cleanBase64.length * 3) / 4;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      // Gemini has a 20MB limit for images
      if (sizeInMB > 20) {
        return { valid: false, error: `Image too large (${sizeInMB.toFixed(2)}MB). Maximum size is 20MB` };
      }

      return { valid: true };
      
    } catch {
      return { valid: false, error: 'Failed to validate image input' };
    }
  }
}

// Export a lazy-loaded singleton instance
let clientInstance: GeminiClient | null = null;

export const geminiClient = {
  get instance(): GeminiClient {
    clientInstance ??= new GeminiClient();
    return clientInstance;
  },
  
  // Proxy methods to the actual client
  renovateImage: (imageBase64: string, roomType?: RenovationType, style: RenovationStyle = 'modern') => 
    geminiClient.instance.renovateImage(imageBase64, roomType, style),
    
  validateImageInput: (imageBase64: string) =>
    geminiClient.instance.validateImageInput(imageBase64),
};

// Also export the class for testing purposes
export { GeminiClient };