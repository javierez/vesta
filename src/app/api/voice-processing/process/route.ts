import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { uploadAudioToS3, validateAudioBlob, getAudioInfo } from "~/lib/audio-upload";
import { transcribeRealEstateAudio } from "~/server/transcription/transcription-service";
import { extractPropertyDataFromVoice } from "~/server/transcription/voice-field-extractor";
import { getSecureSession } from "~/lib/dal";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 [PROCESS-API] Starting complete voice processing pipeline...");

    // Check authentication
    const session = await getSecureSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const referenceNumber = formData.get("referenceNumber") as string | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No se encontró archivo de audio" },
        { status: 400 }
      );
    }

    if (!referenceNumber) {
      return NextResponse.json(
        { error: "Número de referencia requerido" },
        { status: 400 }
      );
    }

    const audioInfo = getAudioInfo(audioFile);
    console.log(`🚀 [PROCESS-API] Processing audio file:`, audioInfo);

    // Step 1: Validate audio file
    const validation = validateAudioBlob(audioFile);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    console.log("✅ [PROCESS-API] Step 1/4: Audio validation passed");

    // Step 2: Upload to S3
    console.log("📤 [PROCESS-API] Step 2/4: Uploading audio to S3...");
    const uploadResult = await uploadAudioToS3(audioFile, referenceNumber);
    console.log("✅ [PROCESS-API] Step 2/4: Audio uploaded successfully");

    // Step 3: Transcribe audio
    console.log("🎤 [PROCESS-API] Step 3/4: Transcribing audio...");
    const transcriptionResult = await transcribeRealEstateAudio(
      uploadResult.audioUrl,
      referenceNumber
    );
    console.log("✅ [PROCESS-API] Step 3/4: Transcription completed");
    console.log(`📝 [PROCESS-API] Transcript: "${transcriptionResult.transcript.substring(0, 100)}..."`);

    // Step 4: Extract property data
    console.log("🧠 [PROCESS-API] Step 4/4: Extracting property data...");
    const extractionResult = await extractPropertyDataFromVoice(
      transcriptionResult,
      referenceNumber
    );
    console.log("✅ [PROCESS-API] Step 4/4: Data extraction completed");

    // Calculate processing statistics
    const stats = {
      audioInfo,
      transcription: {
        length: transcriptionResult.transcript.length,
        confidence: transcriptionResult.confidence,
        language: transcriptionResult.language,
        duration: transcriptionResult.duration,
      },
      extraction: {
        totalFields: extractionResult.extractedFields.length,
        propertyFields: extractionResult.extractedFields.filter(f => f.dbTable === "properties").length,
        listingFields: extractionResult.extractedFields.filter(f => f.dbTable === "listings").length,
        averageConfidence: extractionResult.extractedFields.length > 0
          ? Math.round(extractionResult.extractedFields.reduce((sum, f) => sum + f.confidence, 0) / extractionResult.extractedFields.length)
          : 0,
        sources: {
          gpt4: extractionResult.extractedFields.filter(f => f.extractionSource === "gpt4").length,
          voicePattern: extractionResult.extractedFields.filter(f => f.extractionSource === "voice_pattern").length,
          regex: extractionResult.extractedFields.filter(f => f.extractionSource === "regex").length,
        }
      },
      processing: {
        referenceNumber,
        userId: session.user.id,
        timestamp: new Date().toISOString(),
      }
    };

    console.log("🎉 [PROCESS-API] Complete pipeline finished successfully!");
    console.log(`📊 [PROCESS-API] Final stats:`, {
      transcriptLength: stats.transcription.length,
      fieldsExtracted: stats.extraction.totalFields,
      avgConfidence: stats.extraction.averageConfidence,
    });

    return NextResponse.json({
      success: true,
      // Main results
      propertyData: extractionResult.propertyData,
      listingData: extractionResult.listingData,
      completeData: extractionResult.completeData,
      extractedFields: extractionResult.extractedFields,
      
      // Processing details
      upload: uploadResult,
      transcription: transcriptionResult,
      extraction: extractionResult,
      
      // Statistics
      stats,
    });

  } catch (error) {
    console.error("❌ [PROCESS-API] Complete pipeline error:", error);
    
    let errorMessage = "Error al procesar la grabación de voz";
    let errorStep = "unknown";
    
    if (error instanceof Error) {
      if (error.message.includes("upload") || error.message.includes("S3")) {
        errorMessage = "Error al subir el archivo de audio";
        errorStep = "upload";
      } else if (error.message.includes("transcrib") || error.message.includes("Whisper")) {
        errorMessage = "Error al transcribir el audio";
        errorStep = "transcription";
      } else if (error.message.includes("extract") || error.message.includes("GPT")) {
        errorMessage = "Error al extraer los datos de la propiedad";
        errorStep = "extraction";
      } else if (error.message.includes("validat")) {
        errorMessage = "El archivo de audio no es válido";
        errorStep = "validation";
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        errorStep,
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}