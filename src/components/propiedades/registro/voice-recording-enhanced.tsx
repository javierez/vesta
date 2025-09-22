"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "~/lib/utils";
import {
  Mic,
  Pause,
  Play,
  Square,
  RotateCcw,
  Send,
  Upload,
  Headphones,
  Brain,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { EnhancedExtractedPropertyData, ExtractedFieldResult } from "~/types/textract-enhanced";
import { VoiceFieldValidationModal } from "~/components/forms/voice";

interface VoiceRecordingEnhancedProps {
  onProcessingComplete: (extractedData: EnhancedExtractedPropertyData) => void;
  onRetryRecording?: () => void;
  onManualEntry?: () => void;
  referenceNumber?: string;
  className?: string;
}

type ProcessingStep = "idle" | "uploading" | "transcribing" | "extracting" | "complete" | "error";

interface ProcessingState {
  step: ProcessingStep;
  progress: number;
  message: string;
  error?: string;
}

const PROCESSING_STEPS: Record<ProcessingStep, { icon: React.ElementType; color: string; label: string }> = {
  idle: { icon: Mic, color: "text-amber-600", label: "Listo para grabar" },
  uploading: { icon: Upload, color: "text-amber-600", label: "Subiendo audio" },
  transcribing: { icon: Headphones, color: "text-rose-500", label: "Transcribiendo" },
  extracting: { icon: Brain, color: "text-amber-500", label: "Extrayendo datos" },
  complete: { icon: CheckCircle2, color: "text-green-500", label: "Completado" },
  error: { icon: AlertCircle, color: "text-red-500", label: "Error" },
};

export function VoiceRecordingEnhanced({ 
  onProcessingComplete,
  onRetryRecording,
  onManualEntry, 
  referenceNumber = "temp",
  className 
}: VoiceRecordingEnhancedProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(40).fill(0));
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  
  const waveAnimationRef = useRef<NodeJS.Timeout | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    step: "idle",
    progress: 0,
    message: "",
  });
  const [, setExtractedData] = useState<EnhancedExtractedPropertyData | null>(null);
  const [extractedFields, setExtractedFields] = useState<ExtractedFieldResult[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const recordingSuggestions = [
    "Recuerda mencionar el precio y número de habitaciones",
    "Por favor, comparte la dirección completa",
    "Describe el estado de la propiedad",
    "Menciona los metros cuadrados si los conoces",
    "¿Tiene parking o trastero incluido?",
    "Habla sobre la orientación y luminosidad",
    "¿Qué tipo de calefacción tiene?",
    "Menciona si está amueblado o no",
    "Describe la zona y servicios cercanos",
    "¿Cuál es la disponibilidad para visitas?",
  ];

  // Simulated waveform animation that mimics natural speech patterns
  const simulateWaveform = () => {
    if (!isRecording || isPaused) return;

    const newFrequencyData = Array.from({ length: 40 }, (_, i) => {
      // Create natural speech-like patterns with varying intensities
      const baseIntensity = Math.sin(Date.now() * 0.001 + i * 0.3) * 30 + 40;
      const speechVariation = Math.sin(Date.now() * 0.003 + i * 0.1) * 20;
      const randomNoise = (Math.random() - 0.5) * 15;
      
      // Create occasional "speech bursts" for more realism
      const burstChance = Math.sin(Date.now() * 0.0008) > 0.7 ? 25 : 0;
      
      // Different frequency ranges have different intensities (like human speech)
      const frequencyMultiplier = i < 10 ? 0.8 : i < 25 ? 1.2 : 0.9;
      
      let height = (baseIntensity + speechVariation + randomNoise + burstChance) * frequencyMultiplier;
      
      // Ensure realistic bounds
      height = Math.max(8, Math.min(height, 85));
      
      return height;
    });

    setFrequencyData(newFrequencyData);
    
    // Calculate average for audio level and pulse effects
    const avgLevel = newFrequencyData.reduce((sum, val) => sum + val, 0) / newFrequencyData.length;
    setAudioLevel(avgLevel / 85); // Normalize to 0-1
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Start simulated waveform animation
      waveAnimationRef.current = setInterval(simulateWaveform, 50); // 20fps animation

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        
        // Stop animation
        if (waveAnimationRef.current) {
          clearInterval(waveAnimationRef.current);
        }
        setAudioLevel(0);
        setFrequencyData(new Array(40).fill(8)); // Set to minimum height
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setProcessingState({ step: "idle", progress: 0, message: "" });
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      setCurrentSuggestionIndex(0);
      suggestionTimerRef.current = setInterval(() => {
        setCurrentSuggestionIndex(prev => (prev + 1) % recordingSuggestions.length);
      }, 6000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('No se pudo acceder al micrófono. Por favor, verifica los permisos.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      // Stop animation
      if (waveAnimationRef.current) {
        clearInterval(waveAnimationRef.current);
      }
      setFrequencyData(new Array(40).fill(8)); // Set to minimum height
      setAudioLevel(0);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (suggestionTimerRef.current) {
        clearInterval(suggestionTimerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Restart animation
      waveAnimationRef.current = setInterval(simulateWaveform, 50);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      suggestionTimerRef.current = setInterval(() => {
        setCurrentSuggestionIndex(prev => (prev + 1) % recordingSuggestions.length);
      }, 4000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Stop animation
      if (waveAnimationRef.current) {
        clearInterval(waveAnimationRef.current);
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (suggestionTimerRef.current) {
        clearInterval(suggestionTimerRef.current);
        suggestionTimerRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
    setCurrentSuggestionIndex(0);
    setProcessingState({ step: "idle", progress: 0, message: "" });
    setExtractedData(null);
    setAudioLevel(0);
    setFrequencyData(new Array(40).fill(8)); // Set to minimum height
    
    // Clear all timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (suggestionTimerRef.current) {
      clearInterval(suggestionTimerRef.current);
      suggestionTimerRef.current = null;
    }
    if (waveAnimationRef.current) {
      clearInterval(waveAnimationRef.current);
      waveAnimationRef.current = null;
    }
  };

  const processRecording = async () => {
    if (!audioBlob) return;

    try {
      // Step 1: Upload audio
      setProcessingState({
        step: "uploading",
        progress: 25,
        message: "Subiendo grabación de audio...",
      });

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("referenceNumber", referenceNumber);

      const processResponse = await fetch("/api/voice-processing/process", {
        method: "POST",
        body: formData,
      });

      // Primero obtener el resultado JSON
      const result = await processResponse.json() as { 
        propertyData?: EnhancedExtractedPropertyData;
        extractedFields?: ExtractedFieldResult[];
        error?: string;
        errorStep?: string;
        details?: string;
      };

      // Verificar si la respuesta no es OK o si hay un error en el resultado
      if (!processResponse.ok || result.error) {
        const errorMessage = result.error || "Error al procesar el audio";
        const errorDetails = result.details || "";
        
        console.error("Error del servidor:", errorMessage, errorDetails);
        
        // Mostrar error específico según el paso donde falló
        let userMessage = errorMessage;
        if (result.errorStep === "transcription") {
          userMessage = "No se pudo transcribir el audio. " + errorMessage;
        } else if (result.errorStep === "upload") {
          userMessage = "Error al subir el archivo. " + errorMessage;
        } else if (result.errorStep === "extraction") {
          userMessage = "Error al extraer los datos. " + errorMessage;
        }
        
        setProcessingState({
          step: "error",
          progress: 0,
          message: userMessage,
          error: errorDetails || errorMessage,
        });
        
        // No lanzar error, simplemente retornar para que el usuario pueda reintentar
        return;
      }

      // Update states as we receive progress
      setProcessingState({
        step: "transcribing",
        progress: 50,
        message: "Transcribiendo audio a texto...",
      });

      // Simulate progress for UX
      await new Promise<void>(resolve => setTimeout(resolve, 2000));

      setProcessingState({
        step: "extracting",
        progress: 75,
        message: "Extrayendo información de la propiedad...",
      });

      setProcessingState({
        step: "complete",
        progress: 100,
        message: "¡Procesamiento completado!",
      });

      if (result.propertyData && result.extractedFields) {
        setExtractedData(result.propertyData);
        setExtractedFields(result.extractedFields);
        // Show validation modal instead of directly calling callback
        setShowValidationModal(true);
      }

      // Auto-reset after showing success
      setTimeout(() => {
        resetRecording();
      }, 3000);

    } catch (error) {
      console.error("Error processing recording:", error);
      setProcessingState({
        step: "error",
        progress: 0,
        message: "Error al procesar la grabación. Por favor, intenta de nuevo.",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Modal handlers
  const handleModalConfirm = (confirmedData: EnhancedExtractedPropertyData) => {
    setShowValidationModal(false);
    onProcessingComplete(confirmedData);
    
    // Auto-reset after confirmation
    setTimeout(() => {
      resetRecording();
    }, 1000);
  };

  const handleModalClose = () => {
    setShowValidationModal(false);
    resetRecording();
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (suggestionTimerRef.current) {
        clearInterval(suggestionTimerRef.current);
      }
      if (waveAnimationRef.current) {
        clearInterval(waveAnimationRef.current);
      }
    };
  }, []);

  const isProcessing = processingState.step !== "idle" && processingState.step !== "error" && processingState.step !== "complete";
  const StepIcon = PROCESSING_STEPS[processingState.step].icon;

  return (
    <div className={cn("w-full max-w-lg", className)}>
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center">
          <div className="mb-6">
            <div className={cn(
              "mx-auto w-32 h-32 rounded-full flex items-center justify-center transition-all relative",
              isProcessing 
                ? "bg-gradient-to-br from-amber-100 to-rose-100" 
                : isRecording 
                ? "bg-gradient-to-br from-red-100 to-red-200" 
                : audioBlob 
                ? "bg-gradient-to-br from-green-100 to-green-200"
                : "bg-gradient-to-br from-amber-100 to-rose-100"
            )}>
              {/* Pulse effect for high audio levels */}
              {isRecording && !isPaused && audioLevel > 0.6 && (
                <div className="absolute inset-0 rounded-full animate-ping bg-amber-400/30 pointer-events-none" />
              )}
              {isProcessing ? (
                <div className="relative">
                  <StepIcon className={cn(
                    "h-16 w-16 transition-all duration-500 z-10 relative",
                    PROCESSING_STEPS[processingState.step].color,
                    processingState.step !== "complete" && processingState.step !== "error" && "animate-pulse scale-110"
                  )} />
                  {processingState.step !== "complete" && processingState.step !== "error" && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/20 to-rose-300/20 animate-pulse" />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/30 to-rose-400/30 animate-ping" />
                      <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-amber-200/10 to-rose-200/10 animate-pulse" style={{ animationDelay: "0.5s" }} />
                    </>
                  )}
                </div>
              ) : (
                <Mic className={cn(
                  "h-16 w-16 transition-colors",
                  isRecording ? "text-red-600" : audioBlob ? "text-green-600" : "text-amber-600"
                )} />
              )}
            </div>
          </div>

          {/* Timer or Processing Status */}
          {(isProcessing || processingState.step === "error") ? (
            <div className="mb-6">
              <div className={cn(
                "text-2xl font-semibold mb-2",
                processingState.step === "error" ? "text-red-600" : "text-gray-900"
              )}>
                {PROCESSING_STEPS[processingState.step].label}
              </div>
              {processingState.step !== "error" && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-rose-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${processingState.progress}%` }}
                  />
                </div>
              )}
              <p className={cn(
                "text-sm",
                processingState.step === "error" ? "text-red-600 font-medium" : "text-gray-600"
              )}>{processingState.message}</p>
              {processingState.error && processingState.error !== processingState.message && (
                <p className="text-xs text-red-500 mt-2 italic">{processingState.error}</p>
              )}
            </div>
          ) : (
            <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
              {formatTime(recordingTime)}
            </div>
          )}

          {/* Enhanced Audio Visualization */}
          {isRecording && !isProcessing && (
            <div className="mb-4 h-20 flex items-end justify-center gap-0.5">
              {frequencyData.map((height, i) => {
                const isActive = isRecording && !isPaused;
                const barHeight = isActive ? height : 8;
                const delay = i * 20; // Stagger animation for wave effect
                
                return (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 rounded-t-sm transition-all duration-150 ease-out",
                      isActive
                        ? "bg-gradient-to-t from-rose-500 via-amber-400 to-yellow-300 shadow-sm"
                        : "bg-gradient-to-t from-gray-400 to-gray-300"
                    )}
                    style={{
                      height: `${Math.max(barHeight, 8)}%`,
                      transform: `scaleY(${isActive ? 1 : 0.4})`,
                      animationDelay: `${delay}ms`,
                      opacity: isActive ? 0.9 + (height / 500) : 0.6,
                      boxShadow: isActive && height > 30 
                        ? `0 0 ${height / 10}px rgba(251, 146, 60, 0.4)` 
                        : 'none',
                    }}
                  />
                );
              })}
            </div>
          )}


          {/* Status Message */}
          {!isProcessing && (
            <p className="text-sm text-gray-600 mb-6">
              {isRecording && !isPaused && "Grabando... Habla claramente sobre la propiedad"}
              {isPaused && "Grabación pausada"}
              {!isRecording && audioBlob && "Grabación completa - Lista para procesar"}
              {!isRecording && !audioBlob && "Presiona el botón para comenzar a grabar"}
            </p>
          )}

          {/* Control Buttons */}
          {!isProcessing && (
            <div className="flex items-center justify-center gap-3">
              {!isRecording && !audioBlob && (
                <button
                  onClick={startRecording}
                  className="p-4 bg-gradient-to-r from-amber-400 to-rose-400 text-white rounded-full hover:from-amber-500 hover:to-rose-500 transition-all hover:scale-105 shadow-lg"
                >
                  <Mic className="h-6 w-6" />
                </button>
              )}

              {isRecording && !isPaused && (
                <>
                  <button
                    onClick={pauseRecording}
                    className="p-4 bg-amber-100 text-amber-700 rounded-full hover:bg-amber-200 transition-all"
                  >
                    <Pause className="h-6 w-6" />
                  </button>
                  <button
                    onClick={stopRecording}
                    className="p-4 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-all"
                  >
                    <Square className="h-6 w-6" />
                  </button>
                </>
              )}

              {isRecording && isPaused && (
                <>
                  <button
                    onClick={resumeRecording}
                    className="p-4 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-all"
                  >
                    <Play className="h-6 w-6" />
                  </button>
                  <button
                    onClick={stopRecording}
                    className="p-4 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-all"
                  >
                    <Square className="h-6 w-6" />
                  </button>
                </>
              )}

              {audioBlob && !isRecording && (
                <>
                  <button
                    onClick={resetRecording}
                    className="p-4 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all"
                  >
                    <RotateCcw className="h-6 w-6" />
                  </button>
                  <button
                    onClick={processRecording}
                    className="p-4 bg-gradient-to-r from-amber-400 to-rose-400 text-white rounded-full hover:from-amber-500 hover:to-rose-500 transition-all hover:scale-105 shadow-lg"
                  >
                    <Send className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Recording Suggestions */}
          {isRecording && !isPaused && !isProcessing && (
            <div className="mt-8 p-4 bg-gradient-to-r from-amber-50 to-rose-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <p className="text-xs font-semibold text-amber-800">Sugerencia:</p>
              </div>
              <p 
                key={currentSuggestionIndex}
                className="text-sm text-amber-700 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {recordingSuggestions[currentSuggestionIndex]}
              </p>
            </div>
          )}

          {/* Retry button for errors */}
          {processingState.step === "error" && (
            <div className="mt-6 space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium mb-1">
                      No se pudo procesar la grabación
                    </p>
                    <p className="text-xs text-red-600">
                      Intenta grabar de nuevo con voz clara y asegúrate de mencionar los detalles de la propiedad
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={resetRecording}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-rose-400 text-white rounded-full font-medium hover:from-amber-500 hover:to-rose-500 transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Intentar de nuevo
                </button>
                {onManualEntry && (
                  <button
                    onClick={onManualEntry}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    Entrada manual
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Voice Field Validation Modal */}
      <VoiceFieldValidationModal
        isOpen={showValidationModal}
        onClose={handleModalClose}
        extractedFields={extractedFields}
        onConfirm={handleModalConfirm}
      />
    </div>
  );
}