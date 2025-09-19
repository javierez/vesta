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
  Loader2,
} from "lucide-react";
import type { EnhancedExtractedPropertyData } from "~/types/textract-enhanced";

interface VoiceRecordingEnhancedProps {
  onProcessingComplete: (extractedData: EnhancedExtractedPropertyData) => void;
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
  idle: { icon: Mic, color: "text-gray-500", label: "Listo para grabar" },
  uploading: { icon: Upload, color: "text-blue-500", label: "Subiendo audio" },
  transcribing: { icon: Headphones, color: "text-purple-500", label: "Transcribiendo" },
  extracting: { icon: Brain, color: "text-amber-500", label: "Extrayendo datos" },
  complete: { icon: CheckCircle2, color: "text-green-500", label: "Completado" },
  error: { icon: AlertCircle, color: "text-red-500", label: "Error" },
};

export function VoiceRecordingEnhanced({ 
  onProcessingComplete, 
  referenceNumber = "temp",
  className 
}: VoiceRecordingEnhancedProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    step: "idle",
    progress: 0,
    message: "",
  });
  const [, setExtractedData] = useState<EnhancedExtractedPropertyData | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const visualize = () => {
        if (!analyserRef.current) return;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        setAudioLevel(average / 255);
        
        animationFrameRef.current = requestAnimationFrame(visualize);
      };
      visualize();

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        setAudioLevel(0);
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
      }, 4000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('No se pudo acceder al micrófono. Por favor, verifica los permisos.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
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
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (suggestionTimerRef.current) {
      clearInterval(suggestionTimerRef.current);
      suggestionTimerRef.current = null;
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

      if (!processResponse.ok) {
        throw new Error("Error processing audio");
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

      const result = await processResponse.json() as { propertyData?: EnhancedExtractedPropertyData };

      setProcessingState({
        step: "complete",
        progress: 100,
        message: "¡Procesamiento completado!",
      });

      if (result.propertyData) {
        setExtractedData(result.propertyData);
        // Call the parent callback with extracted data
        onProcessingComplete(result.propertyData);
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

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (suggestionTimerRef.current) {
        clearInterval(suggestionTimerRef.current);
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
                ? "bg-gradient-to-br from-blue-100 to-purple-200" 
                : isRecording 
                ? "bg-gradient-to-br from-red-100 to-red-200 animate-pulse" 
                : audioBlob 
                ? "bg-gradient-to-br from-green-100 to-green-200"
                : "bg-gradient-to-br from-amber-100 to-rose-100"
            )}>
              {isProcessing ? (
                <>
                  <StepIcon className={cn(
                    "h-16 w-16 transition-colors",
                    PROCESSING_STEPS[processingState.step].color
                  )} />
                  {processingState.step !== "complete" && processingState.step !== "error" && (
                    <Loader2 className="absolute h-32 w-32 animate-spin text-gray-300" />
                  )}
                </>
              ) : (
                <Mic className={cn(
                  "h-16 w-16 transition-colors",
                  isRecording ? "text-red-600" : audioBlob ? "text-green-600" : "text-amber-600"
                )} />
              )}
            </div>
          </div>

          {/* Timer or Processing Status */}
          {isProcessing ? (
            <div className="mb-6">
              <div className="text-2xl font-semibold text-gray-900 mb-2">
                {PROCESSING_STEPS[processingState.step].label}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${processingState.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{processingState.message}</p>
              {processingState.error && (
                <p className="text-sm text-red-600 mt-2">{processingState.error}</p>
              )}
            </div>
          ) : (
            <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
              {formatTime(recordingTime)}
            </div>
          )}

          {/* Audio Visualization */}
          {isRecording && !isProcessing && (
            <div className="mb-4 h-20 flex items-center justify-center gap-1">
              {Array.from({ length: 40 }, (_, i) => {
                const barHeight = isRecording && !isPaused
                  ? Math.random() * audioLevel * 100 + 10
                  : 10;
                return (
                  <div
                    key={i}
                    className={cn(
                      "w-1 bg-gradient-to-t transition-all duration-100",
                      isRecording && !isPaused
                        ? "from-rose-400 to-amber-400"
                        : "from-gray-300 to-gray-400"
                    )}
                    style={{
                      height: `${barHeight}%`,
                      transform: `scaleY(${isRecording && !isPaused ? 1 : 0.3})`,
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
            <div className="mt-6">
              <button
                onClick={resetRecording}
                className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
              >
                Intentar de nuevo
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}