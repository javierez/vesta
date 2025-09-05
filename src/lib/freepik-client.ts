import { 
  LIGHT_ENHANCEMENT_SETTINGS, 
  type FreepikEnhanceResponse, 
  type FreepikTaskStatus 
} from '~/types/freepik';

// Validate required environment variables
const requiredEnvVars = {
  FREEPIK_API_KEY: process.env.FREEPIK_API_KEY,
};

// Check if any required environment variables are missing
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required Freepik environment variables: ${missingEnvVars.join(", ")}`,
  );
}

class FreepikClient {
  private apiKey: string;
  private baseUrl = 'https://api.freepik.com/v1/ai/image-upscaler-precision';

  constructor() {
    this.apiKey = process.env.FREEPIK_API_KEY!;
  }

  /**
   * Enhance an image using Freepik's Image Upscaler Precision API
   * Always uses Light preset settings for cost optimization
   */
  async enhance(imageBase64: string): Promise<FreepikEnhanceResponse> {
    const response = await this.fetchWithRetry('', {
      method: 'POST',
      headers: {
        'x-freepik-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
        sharpen: LIGHT_ENHANCEMENT_SETTINGS.sharpen,
        smart_grain: LIGHT_ENHANCEMENT_SETTINGS.smartGrain,
        ultra_detail: LIGHT_ENHANCEMENT_SETTINGS.ultraDetail,
      }),
    }) as {
      data: {
        task_id: string;
        status: 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';
        generated?: string[];
        error?: string;
      };
    };

    return {
      taskId: response.data.task_id,
      status: response.data.status,
      generated: response.data.generated,
      error: response.data.error,
    };
  }

  /**
   * Check the status of an enhancement task
   */
  async checkStatus(taskId: string): Promise<FreepikTaskStatus> {
    const response = await this.fetchWithRetry(`/${taskId}`, {
      method: 'GET',
      headers: {
        'x-freepik-api-key': this.apiKey,
      },
    }) as {
      data: {
        status: 'IN_PROGRESS' | 'SUCCESS' | 'FAILED' | 'COMPLETED';
        progress?: number;
        generated?: string[]; // Freepik returns images directly here
        error?: string;
        [key: string]: unknown; // Allow other fields
      };
    };

    console.log('🔍 [FreepikClient] Raw API response for task', taskId, ':', {
      fullResponse: response,
      dataKeys: Object.keys(response.data || {}),
      status: response.data?.status,
      generated: response.data?.generated,
      generatedLength: response.data?.generated?.length,
      generatedIsEmpty: response.data?.generated?.length === 0,
      allDataFields: response.data
    });

    // Fix: Freepik returns generated images directly in data.generated, not data.result.generated
    const result = response.data.generated && response.data.generated.length > 0 ? {
      generated: response.data.generated
    } : undefined;

    return {
      id: taskId,
      status: response.data.status as 'IN_PROGRESS' | 'SUCCESS' | 'FAILED',
      progress: response.data.progress,
      result: result,
      error: response.data.error,
    };
  }

  /**
   * Fetch with exponential backoff retry logic
   */
  private async fetchWithRetry(
    endpoint: string, 
    options: RequestInit, 
    retries = 3
  ): Promise<unknown> {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, options);
        
        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited - wait and retry
            const waitTime = Math.pow(2, i) * 1000;
            console.log(`Freepik API rate limited, waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          // Try to get error message from response
          let errorMessage = `API error: ${response.status}`;
          try {
            const errorData = await response.json() as { error?: string };
            if (errorData.error) {
              errorMessage = `API error: ${response.status} - ${errorData.error}`;
            }
          } catch {
            // If we can't parse the error response, use the status code
          }
          
          throw new Error(errorMessage);
        }
        
        return await response.json();
      } catch (error) {
        if (i === retries - 1) {
          // Last retry failed, throw the error
          console.error('Freepik API error after all retries:', error);
          throw error;
        }
        
        // Wait before retrying with exponential backoff
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`Freepik API request failed, waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    // This shouldn't be reached, but TypeScript requires it
    throw new Error('Max retries exceeded');
  }
}

// Export a singleton instance
export const freepikClient = new FreepikClient();

// Also export the class for testing purposes
export { FreepikClient };