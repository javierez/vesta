import fs from "fs";
import path from "path";

interface FotocasaLogEntry {
  timestamp: string;
  listingId: number | string;
  operation: "BUILD_PAYLOAD" | "POST" | "PUT" | "DELETE";
  request?: unknown;
  response?: unknown;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Sanitizes sensitive data from objects before logging
 */
function sanitizeData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    // Don't log full API keys, just show first/last few chars
    if (data.length > 20) {
      return `${data.substring(0, 4)}...${data.substring(data.length - 4)}`;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize API keys and sensitive fields
      if (
        key.toLowerCase().includes("apikey") ||
        key.toLowerCase().includes("api-key") ||
        key.toLowerCase().includes("token") ||
        key.toLowerCase().includes("password")
      ) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeData(value);
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Writes a log entry to the Fotocasa logs directory
 */
export async function logFotocasaRequest(
  entry: Omit<FotocasaLogEntry, "timestamp">,
): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    const logEntry: FotocasaLogEntry = {
      timestamp,
      ...entry,
      // Sanitize sensitive data
      request: sanitizeData(entry.request),
      response: sanitizeData(entry.response),
    };

    // Create logs directory if it doesn't exist
    const logsDir = path.join(process.cwd(), "logs", "fotocasa");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create filename with date and operation
    const date = new Date().toISOString().split("T")[0];
    const filename = `${date}_${entry.operation.toLowerCase()}.log`;
    const filepath = path.join(logsDir, filename);

    // Append log entry as JSON line
    const logLine = JSON.stringify(logEntry, null, 2) + "\n\n";
    fs.appendFileSync(filepath, logLine, "utf-8");
  } catch (error) {
    // Don't throw errors from logging - just log to console
    console.error("Failed to write Fotocasa log:", error);
  }
}

/**
 * Logs the payload building process
 */
export async function logPayloadBuild(
  listingId: number,
  payload: unknown,
  watermarkedKeysCount: number,
): Promise<void> {
  await logFotocasaRequest({
    listingId,
    operation: "BUILD_PAYLOAD",
    request: { listingId },
    response: payload,
    success: true,
    metadata: {
      watermarkedImagesCount: watermarkedKeysCount,
    },
  });
}

/**
 * Logs API POST request (publish)
 */
export async function logPublishRequest(
  listingId: number,
  payload: unknown,
  response: unknown,
  success: boolean,
  error?: string,
): Promise<void> {
  await logFotocasaRequest({
    listingId,
    operation: "POST",
    request: payload,
    response,
    success,
    error,
  });
}

/**
 * Logs API PUT request (update)
 */
export async function logUpdateRequest(
  listingId: number,
  payload: unknown,
  response: unknown,
  success: boolean,
  error?: string,
): Promise<void> {
  await logFotocasaRequest({
    listingId,
    operation: "PUT",
    request: payload,
    response,
    success,
    error,
  });
}

/**
 * Logs API DELETE request
 */
export async function logDeleteRequest(
  listingId: number,
  base64ExternalId: string,
  response: unknown,
  success: boolean,
  error?: string,
): Promise<void> {
  await logFotocasaRequest({
    listingId,
    operation: "DELETE",
    request: { listingId, base64ExternalId },
    response,
    success,
    error,
  });
}
