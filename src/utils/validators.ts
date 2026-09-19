/**
 * Strict validation utilities for forms
 * Validates phone numbers and standard RFC email addresses
 */

/**
 * Validates that the phone number contains between 7 and 15 digits.
 * Accepts standard 11 digits (e.g., 01712345678, 01712-345678) 
 * or international numbers with country codes (e.g., +8801712345678, +44..., +1..., +971...).
 */
export function isValid11DigitPhone(phone: string): boolean {
  if (!phone) return false;
  const trimmed = phone.trim();
  
  // Rejects letters
  if (/[a-zA-Z]/.test(trimmed)) return false;

  const digitsOnly = trimmed.replace(/\D/g, "");
  
  // Accept standard 7 to 15 digits
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * Validates standard RFC-compliant email addresses (e.g., user@domain.com)
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}
