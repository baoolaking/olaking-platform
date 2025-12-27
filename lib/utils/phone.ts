/**
 * Phone number utilities for intelligent detection and transformation
 * Handles common Nigerian phone number formats and converts them to E.164 format
 */

export interface PhoneTransformResult {
  formatted: string;
  isValid: boolean;
  originalFormat: string;
  detectedCountry: string;
}

/**
 * Transforms various Nigerian phone number formats to E.164 international format
 * Supports formats like:
 * - 09087654322 (11 digits starting with 0)
 * - 7098765412 (10 digits starting with 7,8,9)
 * - 23456789098 (11 digits starting with 234)
 * - +2347098765412 (already in international format)
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

  // Already in international format with +
  if (cleaned.startsWith('+234') && cleaned.length === 14) {
    return {
      formatted: cleaned,
      isValid: true,
      originalFormat: 'international_with_plus',
      detectedCountry: 'nigeria'
    };
  }

  // International format without +
  if (cleaned.startsWith('234') && cleaned.length === 13) {
    return {
      formatted: `+${cleaned}`,
      isValid: true,
      originalFormat: 'international_without_plus',
      detectedCountry: 'nigeria'
    };
  }

  // Nigerian format starting with 0 (11 digits)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    // Remove leading 0 and add +234
    const withoutZero = cleaned.substring(1);
    return {
      formatted: `+234${withoutZero}`,
      isValid: isValidNigerianNumber(withoutZero),
      originalFormat: 'nigerian_with_zero',
      detectedCountry: 'nigeria'
    };
  }

  // Nigerian format without leading 0 (10 digits)
  if (cleaned.length === 10 && /^[789]/.test(cleaned)) {
    return {
      formatted: `+234${cleaned}`,
      isValid: isValidNigerianNumber(cleaned),
      originalFormat: 'nigerian_without_zero',
      detectedCountry: 'nigeria'
    };
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
      return 'International format (+234...)';
    case 'international_without_plus':
      return 'International format (234...)';
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