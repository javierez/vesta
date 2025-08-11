import { nanoid } from "nanoid";

/**
 * Convert signature data URL to File object for document upload
 * @param signatureDataUrl - Base64 data URL from signature canvas
 * @param appointmentId - Appointment ID for folder organization
 * @param signatureType - Type of signature (agent or visitor)
 * @returns File object ready for document upload
 */
export async function convertSignatureToFile(
  signatureDataUrl: string,
  appointmentId: bigint,
  signatureType: 'agent' | 'visitor'
): Promise<File> {
  try {
    // Convert data URL to File object
    const response = await fetch(signatureDataUrl);
    const blob = await response.blob();
    const filename = `firma-${signatureType}-${appointmentId}-${nanoid(8)}.png`;
    const file = new File([blob], filename, { type: 'image/png' });
    
    return file;
  } catch (error) {
    console.error("Error converting signature to file:", error);
    throw new Error(`Failed to convert ${signatureType} signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}