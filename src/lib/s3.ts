import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

// Validate required environment variables
const requiredEnvVars = {
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
};

// Check if any required environment variables are missing
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required AWS environment variables: ${missingEnvVars.join(", ")}`
  );
}

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadImageToS3(
  file: File,
  referenceNumber: string,
  imageOrder: number
): Promise<{ imageUrl: string; s3key: string; imageKey: string }> {
  try {
    if (!file) {
      throw new Error("No file provided");
    }

    if (!referenceNumber) {
      throw new Error("No reference number provided");
    }

    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    if (!fileExtension) {
      throw new Error("Could not determine file extension");
    }

    // Create the S3 key following the existing structure:
    // bucket/referenceNumber/images/image_filename
    const imageKey = `${referenceNumber}/images/image_${imageOrder}_${nanoid(6)}.${fileExtension}`;
    const s3key = `s3://${process.env.AWS_S3_BUCKET}/${imageKey}`;

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: imageKey,
        Body: buffer,
        ContentType: file.type,
      })
    );

    // Return the image URL and keys
    const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;
    return {
      imageUrl,
      s3key,
      imageKey,
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
} 