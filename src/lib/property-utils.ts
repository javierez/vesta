/**
 * Utility functions for property reference number formatting
 */

/**
 * Formats a property reference number with leading zeros
 * @param referenceNumber - The numeric reference number
 * @param digits - Number of digits to pad to (default: 8)
 * @returns Formatted reference number like "#00000001"
 */
export function formatPropertyReference(referenceNumber: number, digits: number = 8): string {
  return `#${referenceNumber.toString().padStart(digits, '0')}`
}

/**
 * Parses a formatted reference number back to a number
 * @param formattedReference - The formatted reference like "#00000001"
 * @returns The numeric reference number
 */
export function parsePropertyReference(formattedReference: string): number {
  // Remove the # and convert to number
  const numericPart = formattedReference.replace('#', '')
  return parseInt(numericPart, 10)
}

/**
 * Generates a display-friendly reference number for UI
 * @param referenceNumber - The numeric reference number
 * @returns Formatted reference number for display
 */
export function getDisplayReference(referenceNumber: number): string {
  return formatPropertyReference(referenceNumber)
}

/**
 * Validates if a reference number is in the correct format
 * @param reference - The reference to validate
 * @returns True if valid, false otherwise
 */
export function isValidReferenceFormat(reference: string): boolean {
  const regex = /^#[0-9]{8}$/
  return regex.test(reference)
} 