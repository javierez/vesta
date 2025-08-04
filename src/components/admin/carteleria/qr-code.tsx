"use client";

import type { FC } from "react";
import QRCodeLibrary from "react-qr-code";
import { cn } from "~/lib/utils";

interface ContactInfo {
  phone?: string;
  email?: string;
}

interface QRCodeComponentProps {
  contactInfo: ContactInfo;
  size?: number;
  className?: string;
  level?: "L" | "M" | "Q" | "H";
}

export const QRCode: FC<QRCodeComponentProps> = ({
  contactInfo,
  size = 80,
  className,
  level = "M",
}) => {
  // Generate QR code value from contact information
  const generateQRValue = (contact: ContactInfo): string => {
    const parts: string[] = [];

    if (contact.phone) {
      parts.push(`Tel: ${contact.phone}`);
    }

    if (contact.email) {
      parts.push(`Email: ${contact.email}`);
    }

    if (parts.length === 0) {
      return "Contactar inmobiliaria";
    }

    return parts.join("\n");
  };

  // Handle cases where contact info is missing or invalid
  if (!contactInfo || (!contactInfo.phone && !contactInfo.email)) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded bg-gray-100 p-4",
          className,
        )}
        style={{ width: size + 32, height: size + 32 }}
      >
        <span className="text-xs text-gray-500">Sin contacto</span>
      </div>
    );
  }

  const qrValue = generateQRValue(contactInfo);

  try {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded bg-white p-4 shadow-sm",
          className,
        )}
        style={{ width: size + 32, height: size + 32 }}
      >
        <QRCodeLibrary
          value={qrValue}
          size={size}
          level={level}
          className="h-full w-full"
        />
      </div>
    );
  } catch (error) {
    console.error("Error generating QR code:", error);

    // Fallback UI in case QR generation fails
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded bg-gray-100 p-4",
          className,
        )}
        style={{ width: size + 32, height: size + 32 }}
      >
        <span className="text-xs text-gray-500">QR no disponible</span>
      </div>
    );
  }
};

// Convenience component for property templates
interface PropertyQRCodeProps {
  phone?: string;
  email?: string;
  size?: number;
  className?: string;
}

export const PropertyQRCode: FC<PropertyQRCodeProps> = ({
  phone,
  email,
  size,
  className,
}) => {
  return (
    <QRCode
      contactInfo={{ phone, email }}
      size={size}
      className={className}
      level="M"
    />
  );
};
