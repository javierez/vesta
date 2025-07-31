/**
 * Get the base URL for the application
 * Works in both server and client environments
 */
export function getBaseUrl() {
  // Server-side
  if (typeof window === "undefined") {
    // In production, use the VERCEL_URL if available
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    
    // Use APP_URL if set (for custom domains)
    if (process.env.APP_URL) {
      return process.env.APP_URL;
    }
    
    // Fallback to localhost for development
    return "http://localhost:3000";
  }
  
  // Client-side: use relative URLs
  // This ensures the client always uses the current domain
  return "";
}