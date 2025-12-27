import { transformPhoneNumber, formatPhoneForDisplay, getFormatDescription } from '../phone';

describe('Phone Number Transformation', () => {
  describe('transformPhoneNumber', () => {
    test('handles Nigerian format with leading zero (11 digits)', () => {
      const result = transformPhoneNumber('09087654322');
      expect(result.formatted).toBe('+2349087654322');
      expect(result.isValid).toBe(true);
      expect(result.originalFormat).toBe('nigerian_with_zero');
      expect(result.detectedCountry).toBe('nigeria');
    });

    test('handles Nigerian format without leading zero (10 digits)', () => {
      const result = transformPhoneNumber('7098765412');
      expect(result.formatted).toBe('+2347098765412');
      expect(result.isValid).toBe(true);
      expect(result.originalFormat).toBe('nigerian_without_zero');
      expect(result.detectedCountry).toBe('nigeria');
    });

    test('handles international format with country code (13 digits)', () => {
      const result = transformPhoneNumber('2347098765412');
      expect(result.formatted).toBe('+2347098765412');
      expect(result.isValid).toBe(true);
      expect(result.originalFormat).toBe('international_without_plus');
      expect(result.detectedCountry).toBe('nigeria');
    });

    test('handles international format with plus sign (14 characters)', () => {
      const result = transformPhoneNumber('+2347098765412');
      expect(result.formatted).toBe('+2347098765412');
      expect(result.isValid).toBe(true);
      expect(result.originalFormat).toBe('international_with_plus');
      expect(result.detectedCountry).toBe('nigeria');
    });

    test('handles numbers with spaces and dashes', () => {
      const result = transformPhoneNumber('090-8765-4322');
      expect(result.formatted).toBe('+2349087654322');
      expect(result.isValid).toBe(true);
      expect(result.originalFormat).toBe('nigerian_with_zero');
    });

    test('rejects invalid formats', () => {
      const invalidNumbers = [
        '12345',           // too short
        '123456789012345', // too long
        '5087654322',      // doesn't start with valid Nigerian prefix
        '0123456789',      // invalid Nigerian prefix
        'abcd1234567',     // contains letters
        '',                // empty string
      ];

      invalidNumbers.forEach(number => {
        const result = transformPhoneNumber(number);
        expect(result.isValid).toBe(false);
      });
    });

    test('validates Nigerian mobile prefixes correctly', () => {
      const validPrefixes = ['701', '802', '813', '904', '915'];
      const invalidPrefixes = ['601', '502', '123', '000'];

      validPrefixes.forEach(prefix => {
        const result = transformPhoneNumber(`0${prefix}1234567`);
        expect(result.isValid).toBe(true);
      });

      invalidPrefixes.forEach(prefix => {
        const result = transformPhoneNumber(`0${prefix}1234567`);
        expect(result.isValid).toBe(false);
      });
    });
  });

  describe('formatPhoneForDisplay', () => {
    test('formats international numbers with spaces', () => {
      const formatted = formatPhoneForDisplay('+2347098765412');
      expect(formatted).toBe('+234 709 876 5412');
    });

    test('returns original format for non-standard numbers', () => {
      const formatted = formatPhoneForDisplay('1234567890');
      expect(formatted).toBe('1234567890');
    });
  });

  describe('getFormatDescription', () => {
    test('returns correct descriptions for each format', () => {
      expect(getFormatDescription('international_with_plus')).toBe('International format (+234...)');
      expect(getFormatDescription('nigerian_with_zero')).toBe('Nigerian format (0...)');
      expect(getFormatDescription('unknown')).toBe('Unknown format');
    });
  });
});