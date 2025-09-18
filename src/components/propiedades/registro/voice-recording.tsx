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
  Check,
} from "lucide-react";

interface VoiceRecordingProps {
  className?: string;
}

export function VoiceRecording({ className }: VoiceRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  
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
      const mediaRecorder = new MediaRecorder(stream);
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
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
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (suggestionTimerRef.current) {
      clearInterval(suggestionTimerRef.current);
      suggestionTimerRef.current = null;
    }
  };

  const sendRecording = () => {
    if (audioBlob) {
      console.log('Sending audio for processing...', audioBlob);
      alert('Grabación enviada para procesamiento');
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

  return (
    <div className={cn("w-full max-w-lg", className)}>
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="text-center">
          <div className="mb-6">
            <div className={cn(
              "mx-auto w-32 h-32 rounded-full flex items-center justify-center transition-all",
              isRecording 
                ? "bg-gradient-to-br from-red-100 to-red-200 animate-pulse" 
                : audioBlob 
                ? "bg-gradient-to-br from-green-100 to-green-200"
                : "bg-gradient-to-br from-amber-100 to-rose-100"
            )}>
              <Mic className={cn(
                "h-16 w-16 transition-colors",
                isRecording ? "text-red-600" : audioBlob ? "text-green-600" : "text-amber-600"
              )} />
            </div>
          </div>

          <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
            {formatTime(recordingTime)}
          </div>

          {isRecording && (
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

          <p className="text-sm text-gray-600 mb-6">
            {isRecording && !isPaused && "Grabando... Habla claramente sobre la propiedad"}
            {isPaused && "Grabación pausada"}
            {!isRecording && audioBlob && "Grabación completa - Lista para procesar"}
            {!isRecording && !audioBlob && "Presiona el botón para comenzar a grabar"}
          </p>

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
                  onClick={sendRecording}
                  className="p-4 bg-gradient-to-r from-amber-400 to-rose-400 text-white rounded-full hover:from-amber-500 hover:to-rose-500 transition-all hover:scale-105 shadow-lg"
                >
                  <Send className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {isRecording && !isPaused && (
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

        </div>
      </div>
    </div>
  );
}