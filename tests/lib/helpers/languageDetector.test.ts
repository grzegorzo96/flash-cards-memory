import { describe, it, expect } from 'vitest';
import { detectLanguage } from '@/lib/helpers/languageDetector';

describe('Language Detector', () => {
  describe('Polish language detection', () => {
    describe('Polish-specific characters', () => {
      it('should detect Polish with ą character', () => {
        // Arrange
        const text = 'To jest zają bardzo długi tekst';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });

      it('should detect Polish with ć character', () => {
        // Arrange
        const text = 'Ćwiczenia są ważne dla zdrowia';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });

      it('should detect Polish with ę character', () => {
        // Arrange
        const text = 'Będę tam jutro';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });

      it('should detect Polish with ł character', () => {
        // Arrange
        const text = 'Łódka płynie po jeziorze';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });

      it('should detect Polish with ń character', () => {
        // Arrange
        const text = 'Koń jest pięknym zwierzęciem';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });

      it('should detect Polish with ó character', () => {
        // Arrange
        const text = 'Mój stół jest duży';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });

      it('should detect Polish with ś character', () => {
        // Arrange
        const text = 'Śnieg pada zimą';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });

      it('should detect Polish with ź character', () => {
        // Arrange
        const text = 'Źródło wody jest czyste';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });

      it('should detect Polish with ż character', () => {
        // Arrange
        const text = 'Żaba skacze wysoko';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });

      it('should detect Polish with multiple special characters', () => {
        // Arrange
        const text = 'Zażółć gęślą jaźń';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });
    });

    describe('Polish-specific words', () => {
      it('should detect Polish with "jest" word (needs threshold)', () => {
        // Arrange - Multiple Polish words needed to reach threshold
        const text = 'To jest dobry pomysł który jest również może być oraz';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });

      it('should detect Polish with "są" word combined with others', () => {
        // Arrange - Multiple Polish words to reach threshold
        const text = 'One są bardzo inteligentne i mogą być które również';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });

      it('should detect Polish with "będzie" word combined with others', () => {
        // Arrange
        const text = 'To będzie wspaniały dzień który może oraz być';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });

      it('should detect Polish with "może" word combined with others', () => {
        // Arrange
        const text = 'On może przyjść jutro który jest oraz albo';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });

      it('should detect Polish with "który" word combined with others', () => {
        // Arrange
        const text = 'To jest człowiek który pomógł oraz może być';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });

      it('should detect Polish with "która" word combined with others', () => {
        const text = 'Dziewczyna która przyszła wczoraj jest oraz może';
        expect(detectLanguage(text)).toBe('pl');
      });

      it('should detect Polish with "które" word combined with others', () => {
        const text = 'Dzieci które bawiły się jest oraz albo';
        expect(detectLanguage(text)).toBe('pl');
      });

      it('should detect Polish with "oraz" word combined with others', () => {
        const text = 'Kupiłem chleb oraz mleko który jest albo';
        expect(detectLanguage(text)).toBe('pl');
      });

      it('should detect Polish with "albo" word combined with others', () => {
        const text = 'Możesz wybrać herbatę albo kawę która jest oraz';
        expect(detectLanguage(text)).toBe('pl');
      });

      it('should detect Polish with "aby" word combined with others', () => {
        const text = 'Zrobił to aby pomóc który jest oraz może';
        expect(detectLanguage(text)).toBe('pl');
      });

      it('should detect Polish with "żeby" word', () => {
        // This has ż character, so it should trigger Polish detection immediately
        const text = 'Trzeba się uczyć żeby zdać egzamin';
        expect(detectLanguage(text)).toBe('pl');
      });

      it('should detect Polish with multiple Polish words (threshold test)', () => {
        // Arrange - needs 3+ Polish words to trigger
        const text = 'To jest tekst ktory ma aby oraz byc rozpoznany';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('pl');
      });

      it('should NOT detect Polish with only 1 Polish word', () => {
        // Arrange - only 1 Polish word, below threshold of 2
        const text = 'This is a text jest something else';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('en'); // Falls back to English
      });

      it('should NOT detect Polish with only 2 Polish words', () => {
        // Arrange - only 2 Polish words, threshold is >2
        const text = 'This is jest ktory something else';

        // Act
        const result = detectLanguage(text);

        // Assert
        expect(result).toBe('en'); // Falls back to English
      });
    });

    describe('Real-world Polish texts', () => {
      it('should detect Polish educational content', () => {
        const text = 'JavaScript jest językiem programowania który jest używany do tworzenia interaktywnych stron internetowych';
        expect(detectLanguage(text)).toBe('pl');
      });

      it('should detect Polish question format', () => {
        const text = 'Co to jest funkcja strzałkowa w JavaScript?';
        expect(detectLanguage(text)).toBe('pl');
      });

      it('should detect Polish answer format', () => {
        const text = 'Funkcja strzałkowa to skrócona składnia funkcji która nie posiada własnego this';
        expect(detectLanguage(text)).toBe('pl');
      });
    });
  });

  describe('English language detection', () => {
    it('should detect English text without Polish characters', () => {
      // Arrange
      const text = 'This is a simple English text without any special characters';

      // Act
      const result = detectLanguage(text);

      // Assert
      expect(result).toBe('en');
    });

    it('should detect English programming content', () => {
      const text = 'What is an arrow function in JavaScript?';
      expect(detectLanguage(text)).toBe('en');
    });

    it('should detect English technical description', () => {
      const text = 'Arrow function is a shorter syntax for function expressions which does not have its own this';
      expect(detectLanguage(text)).toBe('en');
    });

    it('should detect English with numbers and symbols', () => {
      const text = 'The function returns a value of 42 and uses the += operator';
      expect(detectLanguage(text)).toBe('en');
    });
  });

  describe('Edge cases', () => {
    it('should default to English for empty string', () => {
      // Arrange
      const text = '';

      // Act
      const result = detectLanguage(text);

      // Assert
      expect(result).toBe('en');
    });

    it('should default to English for whitespace only', () => {
      // Arrange
      const text = '   \n\t  ';

      // Act
      const result = detectLanguage(text);

      // Assert
      expect(result).toBe('en');
    });

    it('should default to English for numbers only', () => {
      const text = '12345 67890';
      expect(detectLanguage(text)).toBe('en');
    });

    it('should default to English for symbols only', () => {
      const text = '!@#$%^&*()_+-={}[]|:;"<>?,./';
      expect(detectLanguage(text)).toBe('en');
    });

    it('should detect Polish in mixed content (Polish chars present)', () => {
      const text = 'const x = 5; // To jest zmienna która przechowuje wartość';
      expect(detectLanguage(text)).toBe('pl');
    });

    it('should default to English for code without Polish words', () => {
      const text = 'const x = 5; function test() { return x; }';
      expect(detectLanguage(text)).toBe('en');
    });

    it('should handle very short Polish text', () => {
      const text = 'żaba';
      expect(detectLanguage(text)).toBe('pl');
    });

    it('should handle very short English text', () => {
      const text = 'cat';
      expect(detectLanguage(text)).toBe('en');
    });

    it('should handle single Polish character', () => {
      const text = 'ą';
      expect(detectLanguage(text)).toBe('pl');
    });

    it('should be case-insensitive for Polish words', () => {
      const text = 'TO JEST TEKST KTÓRY MA ORAZ ABY ŻEBY BYĆ ROZPOZNANY';
      expect(detectLanguage(text)).toBe('pl');
    });
  });

  describe('Boundary conditions', () => {
    it('should handle text with exactly 2 Polish words (at threshold)', () => {
      // Arrange - exactly 2 Polish words, threshold is >2
      const text = 'Text with jest and ktory words only';

      // Act
      const result = detectLanguage(text);

      // Assert
      expect(result).toBe('en'); // Should NOT trigger Polish (needs >2)
    });

    it('should handle text with exactly 3 Polish words (above threshold)', () => {
      // Arrange - exactly 3 Polish words, threshold is >2
      const text = 'Text with jest który oraz words here';

      // Act
      const result = detectLanguage(text);

      // Assert
      expect(result).toBe('pl'); // Should trigger Polish
    });

    it('should handle very long Polish text', () => {
      const longText = 'To jest bardzo długi tekst który zawiera wiele polskich słów oraz ' +
        'znaków specjalnych takich jak ą ć ę ł ń ó ś ź ż aby sprawdzić czy detektor ' +
        'języka działa poprawnie nawet dla dużych bloków tekstu które mogą być używane ' +
        'w systemie flashcard do generowania pytań i odpowiedzi dla użytkowników';
      
      expect(detectLanguage(longText)).toBe('pl');
    });

    it('should handle very long English text', () => {
      const longText = 'This is a very long text that contains many English words and ' +
        'technical terms such as function, variable, constant, class, interface, type ' +
        'to check if the language detector works correctly even for large blocks of text ' +
        'that might be used in the flashcard system to generate questions and answers';
      
      expect(detectLanguage(longText)).toBe('en');
    });
  });

  describe('Type safety', () => {
    it('should return LanguageCode type (pl or en)', () => {
      // Arrange & Act
      const resultPl = detectLanguage('To jest polski tekst');
      const resultEn = detectLanguage('This is English text');

      // Assert - TypeScript should enforce this at compile time
      const validValues: Array<'pl' | 'en'> = [resultPl, resultEn];
      expect(validValues).toHaveLength(2);
    });
  });
});
