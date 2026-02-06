/**
 * Phone number utilities for intelligent detection and transformation
 * Handles international phone number formats and converts them to E.164 format
 * Supports WhatsApp-compatible phone numbers from all countries
 */

import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

export interface PhoneTransformResult {
  formatted: string;
  isValid: boolean;
  originalFormat: string;
  detectedCountry: string;
}

/**
 * Transforms various phone number formats to E.164 international format
 * Supports formats from all countries, with special handling for Nigerian numbers:
 * - 09087654322 (11 digits starting with 0) - Nigerian format
 * - 7098765412 (10 digits starting with 7,8,9) - Nigerian format
 * - +2347098765412 (international format with country code)
 * - +1234567890 (any international format)
 * - +44 20 7946 0958 (international with spaces)
 */
export function transformPhoneNumber(input: string): PhoneTransformResult {
  // Remove all non-digit characters except +
  const cleaned = input.replace(/[^\d+]/g, '');
  
  // If empty after cleaning, return invalid
  if (!cleaned) {
    return {
      formatted: input,
      isValid: false,
      originalFormat: 'invalid',
      detectedCountry: 'unknown'
    };
  }

  // Try to parse as international number first
  if (cleaned.startsWith('+')) {
    try {
      const phoneNumber = parsePhoneNumber(cleaned);
      if (phoneNumber && isValidPhoneNumber(cleaned)) {
        return {
          formatted: phoneNumber.number,
          isValid: true,
          originalFormat: 'international_with_plus',
          detectedCountry: phoneNumber.country?.toLowerCase() || 'unknown'
        };
      }
    } catch (error) {
      // Continue to other checks if parsing fails
    }
  }

  // Try parsing with country code but without +
  if (cleaned.length > 10 && !cleaned.startsWith('0')) {
    try {
      const withPlus = `+${cleaned}`;
      const phoneNumber = parsePhoneNumber(withPlus);
      if (phoneNumber && isValidPhoneNumber(withPlus)) {
        return {
          formatted: phoneNumber.number,
          isValid: true,
          originalFormat: 'international_without_plus',
          detectedCountry: phoneNumber.country?.toLowerCase() || 'unknown'
        };
      }
    } catch (error) {
      // Continue to Nigerian-specific checks
    }
  }

  // Nigerian format starting with 0 (11 digits)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    const withoutZero = cleaned.substring(1);
    const formatted = `+234${withoutZero}`;
    try {
      const phoneNumber = parsePhoneNumber(formatted);
      const isValid = phoneNumber && isValidPhoneNumber(formatted) && isValidNigerianNumber(withoutZero);
      return {
        formatted,
        isValid,
        originalFormat: 'nigerian_with_zero',
        detectedCountry: 'nigeria'
      };
    } catch (error) {
      return {
        formatted,
        isValid: isValidNigerianNumber(withoutZero),
        originalFormat: 'nigerian_with_zero',
        detectedCountry: 'nigeria'
      };
    }
  }

  // Nigerian format without leading 0 (10 digits)
  if (cleaned.length === 10 && /^[789]/.test(cleaned)) {
    const formatted = `+234${cleaned}`;
    try {
      const phoneNumber = parsePhoneNumber(formatted);
      const isValid = phoneNumber && isValidPhoneNumber(formatted) && isValidNigerianNumber(cleaned);
      return {
        formatted,
        isValid,
        originalFormat: 'nigerian_without_zero',
        detectedCountry: 'nigeria'
      };
    } catch (error) {
      return {
        formatted,
        isValid: isValidNigerianNumber(cleaned),
        originalFormat: 'nigerian_without_zero',
        detectedCountry: 'nigeria'
      };
    }
  }

  // If it doesn't match any known pattern, return as invalid
  return {
    formatted: input,
    isValid: false,
    originalFormat: 'unknown',
    detectedCountry: 'unknown'
  };
}

/**
 * Validates if a 10-digit number is a valid Nigerian mobile number
 * Nigerian mobile numbers start with: 70x, 80x, 81x, 90x, 91x, etc.
 */
function isValidNigerianNumber(number: string): boolean {
  if (number.length !== 10) return false;
  
  // Common Nigerian mobile prefixes (without country code and leading zero)
  const validPrefixes = [
    '701', '702', '703', '704', '705', '706', '707', '708', '709',
    '801', '802', '803', '804', '805', '806', '807', '808', '809',
    '810', '811', '812', '813', '814', '815', '816', '817', '818', '819',
    '901', '902', '903', '904', '905', '906', '907', '908', '909',
    '910', '911', '912', '913', '914', '915', '916', '917', '918', '919'
  ];

  const prefix = number.substring(0, 3);
  return validPrefixes.includes(prefix);
}

/**
 * Formats phone number for display (adds spaces for readability)
 */
export function formatPhoneForDisplay(phoneNumber: string): string {
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    if (parsed) {
      return parsed.formatInternational();
    }
  } catch (error) {
    // Fallback to basic formatting
  }
  
  // Fallback for Nigerian numbers
  if (phoneNumber.startsWith('+234') && phoneNumber.length === 14) {
    // +234 XXX XXX XXXX
    return `${phoneNumber.substring(0, 4)} ${phoneNumber.substring(4, 7)} ${phoneNumber.substring(7, 10)} ${phoneNumber.substring(10)}`;
  }
  
  return phoneNumber;
}

/**
 * Gets user-friendly description of the detected format
 */
export function getFormatDescription(originalFormat: string): string {
  switch (originalFormat) {
    case 'international_with_plus':
      return 'International format (with +)';
    case 'international_without_plus':
      return 'International format (without +)';
    case 'nigerian_with_zero':
      return 'Nigerian format (0...)';
    case 'nigerian_without_zero':
      return 'Nigerian mobile format';
    case 'invalid':
      return 'Invalid format';
    case 'unknown':
      return 'Unknown format';
    default:
      return 'Detected format';
  }
}

/**
 * Gets the country name from a phone number
 */
export function getCountryFromPhone(phoneNumber: string): string | null {
  try {
    const parsed = parsePhoneNumber(phoneNumber);
    return parsed?.country || null;
  } catch (error) {
    return null;
  }
}