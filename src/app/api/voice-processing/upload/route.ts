import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { uploadAudioToS3, validateAudioBlob, getAudioInfo } from "~/lib/audio-upload";
import { getSecureSession } from "~/lib/dal";

export async function POST(request: NextRequest) {
  try {
    console.log("🎤 [UPLOAD-API] Starting audio upload...");

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

    console.log(`🎤 [UPLOAD-API] Audio file details:`, getAudioInfo(audioFile));

    // Validate audio file
    const validation = validateAudioBlob(audioFile);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Upload to S3
    const uploadResult = await uploadAudioToS3(audioFile, referenceNumber);

    console.log("✅ [UPLOAD-API] Audio upload completed successfully");

    return NextResponse.json({
      success: true,
      ...uploadResult,
      fileInfo: getAudioInfo(audioFile),
    });

  } catch (error) {
    console.error("❌ [UPLOAD-API] Audio upload error:", error);
    
    return NextResponse.json(
      { 
        error: "Error al subir el archivo de audio",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}