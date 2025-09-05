"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import type { EnhancementStatus, PropertyImage } from "~/types/freepik";

interface UseImageEnhancementProps {
  propertyId: string;
  onSuccess?: (enhancedImage: PropertyImage) => void;
  onError?: (error: string) => void;
}

interface UseImageEnhancementReturn {
  status: EnhancementStatus;
  progress: number;
  error: string | null;
  enhancedPropertyImage: PropertyImage | null;
  originalImageUrl: string | null;
  enhancedImageUrl: string | null;
  enhance: (imageUrl: string, referenceNumber: string, currentImageOrder: number) => Promise<void>;
  reset: () => void;
  cancel: () => void;
}

/**
 * Custom hook for managing image enhancement with Freepik API
 * Handles the full flow: API call, polling, S3 upload, and database creation
 */
export function useImageEnhancement({
  propertyId,
  onSuccess,
  onError,
}: UseImageEnhancementProps): UseImageEnhancementReturn {
  const [status, setStatus] = useState<EnhancementStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [enhancedPropertyImage, setEnhancedPropertyImage] = useState<PropertyImage | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
  
  // Refs for cleanup
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Use state instead of ref to track mount status - more reliable in React dev mode
  const [isMounted, setIsMounted] = useState(true);

  // Mount/unmount management
  useEffect(() => {
    console.log('📌 [useImageEnhancement] Component mounted, setting isMounted to true');
    setIsMounted(true);
    
    return () => {
      console.log('📌 [useImageEnhancement] Component unmounting, setting isMounted to false');
      setIsMounted(false);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const clearPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const enhance = useCallback(async (
    imageUrl: string,
    referenceNumber: string,
    currentImageOrder: number
  ) => {
    console.log('🎣 [useImageEnhancement] enhance() called', {
      imageUrl,
      referenceNumber,
      currentImageOrder,
      propertyId,
      isMounted
    });
    
    if (!isMounted) {
      console.warn('⚠️ [useImageEnhancement] Component unmounted, skipping enhancement');
      return;
    }

    try {
      console.log('🔄 [useImageEnhancement] Setting initial state');
      setStatus('processing');
      setProgress(0);
      setError(null);
      setOriginalImageUrl(imageUrl);
      setEnhancedImageUrl(null);
      setEnhancedPropertyImage(null);

      console.log(`🚀 [useImageEnhancement] Starting enhancement for image: ${imageUrl}`);

      // 1. Start enhancement
      const apiUrl = `/api/properties/${propertyId}/freepik-enhance`;
      const requestBody = { 
        imageUrl, 
        referenceNumber, 
        currentImageOrder 
      };
      
      console.log('📞 [useImageEnhancement] Making POST request', {
        url: apiUrl,
        body: requestBody
      });
      
      const startResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      console.log('📞 [useImageEnhancement] POST response received', {
        status: startResponse.status,
        ok: startResponse.ok,
        statusText: startResponse.statusText
      });

      if (!startResponse.ok) {
        console.error('❌ [useImageEnhancement] POST request failed', {
          status: startResponse.status,
          statusText: startResponse.statusText
        });
        const errorData = await startResponse.json() as { error?: string };
        console.error('❌ [useImageEnhancement] Error data:', errorData);
        throw new Error(errorData.error ?? 'Failed to start enhancement');
      }

      const startResponseData = await startResponse.json() as { taskId: string };
      const { taskId } = startResponseData;
      console.log('✅ [useImageEnhancement] Enhancement task started successfully', {
        taskId,
        responseData: startResponseData
      });

      // 2. Set up polling for status updates
      let pollAttempts = 0;
      const maxPollAttempts = 60; // 2 minutes with 2-second intervals

      const pollStatus = async () => {
        if (!isMounted) {
          console.warn('⚠️ [useImageEnhancement] Component unmounted during polling, stopping');
          clearPolling();
          return;
        }

        try {
          pollAttempts++;
          
          const statusResponse = await fetch(
            `/api/properties/${propertyId}/freepik-enhance?taskId=${taskId}&referenceNumber=${referenceNumber}&currentImageOrder=${currentImageOrder}`
          );

          if (!statusResponse.ok) {
            throw new Error('Failed to check enhancement status');
          }

          const statusData = await statusResponse.json() as {
            status: string;
            progress?: number;
            propertyImage?: PropertyImage;
            enhancedImageUrl?: string;
            error?: string;
          };
          console.log('🔍 [useImageEnhancement] Status response received:', {
            status: statusData.status,
            progress: statusData.progress,
            hasPropertyImage: !!statusData.propertyImage,
            hasEnhancedImageUrl: !!statusData.enhancedImageUrl,
            enhancedImageUrl: statusData.enhancedImageUrl,
            fullResponse: statusData
          });

          if (!isMounted) return;

          if (statusData.status === 'SUCCESS') {
            clearPolling();
            setStatus('success');
            setProgress(100);
            if (statusData.propertyImage) {
              setEnhancedPropertyImage(statusData.propertyImage);
            }
            if (statusData.enhancedImageUrl) {
              setEnhancedImageUrl(statusData.enhancedImageUrl);
            }
            
            console.log(`Enhancement completed successfully. New image: ${statusData.enhancedImageUrl}`);
            
            // Call success callback
            if (onSuccess && statusData.propertyImage) {
              onSuccess(statusData.propertyImage);
            }
            
            toast.success("¡Imagen mejorada correctamente!");
            
          } else if (statusData.status === 'FAILED') {
            clearPolling();
            const errorMsg = statusData.error ?? 'Enhancement failed';
            setStatus('error');
            setError(errorMsg);
            
            console.error(`Enhancement failed: ${errorMsg}`);
            
            if (onError) {
              onError(errorMsg);
            }
            
            toast.error("Error al mejorar la imagen");
            
          } else if (statusData.status === 'IN_PROGRESS') {
            // Update progress with a mix of real progress and time-based estimation
            const realProgress = statusData.progress ?? 0;
            const timeProgress = Math.min((pollAttempts * 2), 90); // 2% per attempt, cap at 90%
            const combinedProgress = Math.max(realProgress, timeProgress);
            
            setProgress(combinedProgress);
            
            // Continue polling if we haven't exceeded max attempts
            if (pollAttempts >= maxPollAttempts) {
              clearPolling();
              setStatus('error');
              setError('Enhancement timed out');
              toast.error("La mejora de imagen está tardando más de lo esperado");
            }
          }
        } catch (error) {
          if (!isMounted) return;
          
          console.error('Error polling status:', error);
          
          // If we've tried many times, give up
          if (pollAttempts >= 5) {
            clearPolling();
            setStatus('error');
            setError('Failed to check enhancement status');
            toast.error("Error al verificar el progreso");
          }
          // Otherwise, continue polling (network issues might be temporary)
        }
      };

      // Start polling
      pollIntervalRef.current = setInterval(() => { void pollStatus(); }, 2000);
      
      // Also run initial status check immediately
      setTimeout(() => { void pollStatus(); }, 500);

    } catch (error) {
      if (!isMounted) {
        console.warn('⚠️ [useImageEnhancement] Component unmounted during error handling');
        return;
      }
      
      console.error('❌ [useImageEnhancement] Enhancement error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Enhancement failed';
      console.error('❌ [useImageEnhancement] Setting error state:', errorMessage);
      
      setStatus('error');
      setError(errorMessage);
      
      if (onError) {
        console.log('📞 [useImageEnhancement] Calling onError callback');
        onError(errorMessage);
      }
      
      toast.error("Error al iniciar la mejora de imagen");
    }
  }, [propertyId, onSuccess, onError, clearPolling, isMounted]);

  const cancel = useCallback(() => {
    clearPolling();
    setStatus('idle');
    setProgress(0);
    setError(null);
    console.log('Enhancement cancelled by user');
  }, [clearPolling]);

  const reset = useCallback(() => {
    clearPolling();
    setStatus('idle');
    setProgress(0);
    setError(null);
    setEnhancedPropertyImage(null);
    setOriginalImageUrl(null);
    setEnhancedImageUrl(null);
  }, [clearPolling]);

  return {
    status,
    progress,
    error,
    enhancedPropertyImage,
    originalImageUrl,
    enhancedImageUrl,
    enhance,
    reset,
    cancel,
  };
}