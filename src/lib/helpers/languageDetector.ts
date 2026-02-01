import type { LanguageCode } from '../../types';

/**
 * Simple heuristic-based language detector for MVP.
 * Detects Polish or English based on character patterns.
 *
 * @param text - Text to analyze
 * @returns Detected language code ('pl' or 'en')
 */
export function detectLanguage(text: string): LanguageCode {
  if (!text || text.trim().length === 0) {
    return 'en'; // Default to English
  }

  const normalizedText = text.toLowerCase();

  // Polish-specific characters and patterns
  const polishChars = /[ąćęłńóśźż]/g;
  const polishWords = /\b(jest|są|będzie|może|który|która|które|oraz|albo|aby|żeby)\b/gi;

  // Count Polish indicators
  const polishCharMatches = normalizedText.match(polishChars)?.length ?? 0;
  const polishWordMatches = normalizedText.match(polishWords)?.length ?? 0;

  // If we find Polish-specific characters or common Polish words, classify as Polish
  if (polishCharMatches > 0 || polishWordMatches > 2) {
    return 'pl';
  }

  // Default to English
  return 'en';
}
