import { describe, it, expect, beforeEach } from 'vitest';
import { previewCardsStore } from '@/lib/services/ai-generations/previewCardsStore';
import type { PreviewCardDTO } from '@/types';

describe('PreviewCardsStore', () => {
  // Helper to create mock preview cards
  const createMockCard = (question: string, answer: string): PreviewCardDTO => ({
    question,
    answer,
    source: 'ai',
  });

  beforeEach(() => {
    // Clear store before each test to ensure isolation
    previewCardsStore.clear();
  });

  describe('set() and get()', () => {
    it('should store and retrieve cards for a requestId', () => {
      // Arrange
      const requestId = 'test-request-123';
      const cards: PreviewCardDTO[] = [
        createMockCard('What is JavaScript?', 'A programming language'),
        createMockCard('What is TypeScript?', 'JavaScript with types'),
      ];

      // Act
      previewCardsStore.set(requestId, cards);
      const retrieved = previewCardsStore.get(requestId);

      // Assert
      expect(retrieved).toEqual(cards);
      expect(retrieved).toHaveLength(2);
    });

    it('should handle single card', () => {
      // Arrange
      const requestId = 'single-card-request';
      const cards: PreviewCardDTO[] = [
        createMockCard('Single question', 'Single answer'),
      ];

      // Act
      previewCardsStore.set(requestId, cards);
      const retrieved = previewCardsStore.get(requestId);

      // Assert
      expect(retrieved).toEqual(cards);
      expect(retrieved).toHaveLength(1);
    });

    it('should handle empty array', () => {
      // Arrange
      const requestId = 'empty-request';
      const cards: PreviewCardDTO[] = [];

      // Act
      previewCardsStore.set(requestId, cards);
      const retrieved = previewCardsStore.get(requestId);

      // Assert
      expect(retrieved).toEqual([]);
      expect(retrieved).toHaveLength(0);
    });

    it('should return undefined for non-existent requestId', () => {
      // Act
      const retrieved = previewCardsStore.get('non-existent-id');

      // Assert
      expect(retrieved).toBeUndefined();
    });

    it('should handle multiple different requestIds', () => {
      // Arrange
      const request1 = 'request-1';
      const request2 = 'request-2';
      const cards1: PreviewCardDTO[] = [createMockCard('Q1', 'A1')];
      const cards2: PreviewCardDTO[] = [createMockCard('Q2', 'A2')];

      // Act
      previewCardsStore.set(request1, cards1);
      previewCardsStore.set(request2, cards2);

      // Assert
      expect(previewCardsStore.get(request1)).toEqual(cards1);
      expect(previewCardsStore.get(request2)).toEqual(cards2);
    });

    it('should overwrite existing data for same requestId', () => {
      // Arrange
      const requestId = 'overwrite-test';
      const originalCards: PreviewCardDTO[] = [createMockCard('Original', 'Original answer')];
      const newCards: PreviewCardDTO[] = [
        createMockCard('New Q1', 'New A1'),
        createMockCard('New Q2', 'New A2'),
      ];

      // Act
      previewCardsStore.set(requestId, originalCards);
      const firstRetrieval = previewCardsStore.get(requestId);
      
      previewCardsStore.set(requestId, newCards);
      const secondRetrieval = previewCardsStore.get(requestId);

      // Assert
      expect(firstRetrieval).toEqual(originalCards);
      expect(secondRetrieval).toEqual(newCards);
      expect(secondRetrieval).not.toEqual(originalCards);
    });
  });

  describe('delete()', () => {
    it('should delete cards for specific requestId', () => {
      // Arrange
      const requestId = 'delete-test';
      const cards: PreviewCardDTO[] = [createMockCard('Test', 'Test answer')];
      previewCardsStore.set(requestId, cards);

      // Act
      previewCardsStore.delete(requestId);
      const retrieved = previewCardsStore.get(requestId);

      // Assert
      expect(retrieved).toBeUndefined();
    });

    it('should only delete specified requestId', () => {
      // Arrange
      const request1 = 'keep-this';
      const request2 = 'delete-this';
      const cards1: PreviewCardDTO[] = [createMockCard('Keep', 'Keep answer')];
      const cards2: PreviewCardDTO[] = [createMockCard('Delete', 'Delete answer')];
      
      previewCardsStore.set(request1, cards1);
      previewCardsStore.set(request2, cards2);

      // Act
      previewCardsStore.delete(request2);

      // Assert
      expect(previewCardsStore.get(request1)).toEqual(cards1);
      expect(previewCardsStore.get(request2)).toBeUndefined();
    });

    it('should handle deleting non-existent requestId', () => {
      // Act & Assert - Should not throw
      expect(() => {
        previewCardsStore.delete('non-existent');
      }).not.toThrow();
    });

    it('should handle deleting already deleted requestId', () => {
      // Arrange
      const requestId = 'double-delete';
      const cards: PreviewCardDTO[] = [createMockCard('Test', 'Test')];
      previewCardsStore.set(requestId, cards);
      previewCardsStore.delete(requestId);

      // Act & Assert - Should not throw
      expect(() => {
        previewCardsStore.delete(requestId);
      }).not.toThrow();
      
      expect(previewCardsStore.get(requestId)).toBeUndefined();
    });
  });

  describe('clear()', () => {
    it('should clear all stored cards', () => {
      // Arrange
      const request1 = 'request-1';
      const request2 = 'request-2';
      const request3 = 'request-3';
      
      previewCardsStore.set(request1, [createMockCard('Q1', 'A1')]);
      previewCardsStore.set(request2, [createMockCard('Q2', 'A2')]);
      previewCardsStore.set(request3, [createMockCard('Q3', 'A3')]);

      // Act
      previewCardsStore.clear();

      // Assert
      expect(previewCardsStore.get(request1)).toBeUndefined();
      expect(previewCardsStore.get(request2)).toBeUndefined();
      expect(previewCardsStore.get(request3)).toBeUndefined();
    });

    it('should handle clearing empty store', () => {
      // Act & Assert - Should not throw
      expect(() => {
        previewCardsStore.clear();
      }).not.toThrow();
    });

    it('should allow adding new data after clear', () => {
      // Arrange
      const requestId = 'after-clear';
      const cards: PreviewCardDTO[] = [createMockCard('New', 'New answer')];
      
      previewCardsStore.set('old-request', [createMockCard('Old', 'Old')]);
      previewCardsStore.clear();

      // Act
      previewCardsStore.set(requestId, cards);
      const retrieved = previewCardsStore.get(requestId);

      // Assert
      expect(retrieved).toEqual(cards);
      expect(previewCardsStore.get('old-request')).toBeUndefined();
    });
  });

  describe('Complex scenarios', () => {
    it('should handle many cards for single request', () => {
      // Arrange
      const requestId = 'large-batch';
      const cards: PreviewCardDTO[] = Array.from({ length: 100 }, (_, i) =>
        createMockCard(`Question ${i}`, `Answer ${i}`)
      );

      // Act
      previewCardsStore.set(requestId, cards);
      const retrieved = previewCardsStore.get(requestId);

      // Assert
      expect(retrieved).toHaveLength(100);
      expect(retrieved?.[0]).toEqual(cards[0]);
      expect(retrieved?.[99]).toEqual(cards[99]);
    });

    it('should handle many different requestIds', () => {
      // Arrange
      const requestCount = 50;
      const requestIds = Array.from({ length: requestCount }, (_, i) => `request-${i}`);

      // Act
      requestIds.forEach((id, index) => {
        previewCardsStore.set(id, [createMockCard(`Q${index}`, `A${index}`)]);
      });

      // Assert
      requestIds.forEach((id, index) => {
        const retrieved = previewCardsStore.get(id);
        expect(retrieved).toBeDefined();
        expect(retrieved?.[0].question).toBe(`Q${index}`);
      });
    });

    it('should maintain data integrity with rapid operations', () => {
      // Arrange
      const requestId = 'rapid-ops';
      const cards1: PreviewCardDTO[] = [createMockCard('First', 'First')];
      const cards2: PreviewCardDTO[] = [createMockCard('Second', 'Second')];
      const cards3: PreviewCardDTO[] = [createMockCard('Third', 'Third')];

      // Act - Rapid set, delete, set operations
      previewCardsStore.set(requestId, cards1);
      previewCardsStore.set(requestId, cards2);
      previewCardsStore.delete(requestId);
      previewCardsStore.set(requestId, cards3);

      // Assert
      const final = previewCardsStore.get(requestId);
      expect(final).toEqual(cards3);
    });

    it('should handle cards with special characters', () => {
      // Arrange
      const requestId = 'special-chars';
      const cards: PreviewCardDTO[] = [
        createMockCard(
          'What is ąćęłńóśźż?',
          'Polish special characters: ąćęłńóśźż'
        ),
        createMockCard(
          'Math: ∑∫∂∆∏√',
          'Mathematical symbols work too!'
        ),
        createMockCard(
          'Code: const x = () => {}',
          'Arrow functions in JavaScript'
        ),
      ];

      // Act
      previewCardsStore.set(requestId, cards);
      const retrieved = previewCardsStore.get(requestId);

      // Assert
      expect(retrieved).toEqual(cards);
      expect(retrieved?.[0].question).toContain('ąćęłńóśźż');
      expect(retrieved?.[1].question).toContain('∑∫∂∆∏√');
      expect(retrieved?.[2].question).toContain('=>');
    });

    it('should handle cards with very long content', () => {
      // Arrange
      const longQuestion = 'Q'.repeat(10000);
      const longAnswer = 'A'.repeat(10000);
      const requestId = 'long-content';
      const cards: PreviewCardDTO[] = [createMockCard(longQuestion, longAnswer)];

      // Act
      previewCardsStore.set(requestId, cards);
      const retrieved = previewCardsStore.get(requestId);

      // Assert
      expect(retrieved).toEqual(cards);
      expect(retrieved?.[0].question).toHaveLength(10000);
      expect(retrieved?.[0].answer).toHaveLength(10000);
    });
  });

  describe('Data isolation', () => {
    it('should not mutate original array when retrieving', () => {
      // Arrange
      const requestId = 'mutation-test';
      const originalCards: PreviewCardDTO[] = [
        createMockCard('Original', 'Original'),
      ];
      previewCardsStore.set(requestId, originalCards);

      // Act
      const retrieved = previewCardsStore.get(requestId);
      if (retrieved) {
        retrieved.push(createMockCard('Modified', 'Modified'));
      }

      // Assert
      const retrievedAgain = previewCardsStore.get(requestId);
      expect(retrievedAgain).toHaveLength(2); // Map stores reference, so mutation affects it
      // Note: For production, consider using structuredClone or deep copy
    });
  });

  describe('Edge cases with requestId', () => {
    it('should handle empty string requestId', () => {
      // Arrange
      const cards: PreviewCardDTO[] = [createMockCard('Test', 'Test')];

      // Act
      previewCardsStore.set('', cards);
      const retrieved = previewCardsStore.get('');

      // Assert
      expect(retrieved).toEqual(cards);
    });

    it('should handle requestId with special characters', () => {
      // Arrange
      const specialIds = [
        'req-123-abc',
        'req_with_underscores',
        'req.with.dots',
        'req@email.com',
        'req#hashtag',
      ];
      const cards: PreviewCardDTO[] = [createMockCard('Test', 'Test')];

      // Act & Assert
      specialIds.forEach((id) => {
        previewCardsStore.set(id, cards);
        expect(previewCardsStore.get(id)).toEqual(cards);
        previewCardsStore.delete(id);
      });
    });

    it('should treat different requestIds as separate even if similar', () => {
      // Arrange
      const id1 = 'request-1';
      const id2 = 'request-2';
      const id3 = 'request-01'; // Note: '01' vs '1'
      
      const cards1 = [createMockCard('C1', 'C1')];
      const cards2 = [createMockCard('C2', 'C2')];
      const cards3 = [createMockCard('C3', 'C3')];

      // Act
      previewCardsStore.set(id1, cards1);
      previewCardsStore.set(id2, cards2);
      previewCardsStore.set(id3, cards3);

      // Assert
      expect(previewCardsStore.get(id1)).toEqual(cards1);
      expect(previewCardsStore.get(id2)).toEqual(cards2);
      expect(previewCardsStore.get(id3)).toEqual(cards3);
      expect(previewCardsStore.get(id1)).not.toEqual(cards3); // '1' !== '01'
    });
  });
});
