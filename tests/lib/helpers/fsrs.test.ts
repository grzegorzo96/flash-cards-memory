import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateNextReview,
  selectCardsForReview,
  type FSRSRating,
} from '@/lib/helpers/fsrs';

describe('FSRS - Free Spaced Repetition Scheduler', () => {
  beforeEach(() => {
    // Mock Date.now() to ensure consistent test results
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateNextReview()', () => {
    describe('New cards (null parameters)', () => {
      it('should initialize with default parameters for rating 3 (Good)', () => {
        // Arrange
        const rating: FSRSRating = 3;
        const now = new Date('2024-01-15T12:00:00.000Z');

        // Act
        const result = calculateNextReview(rating, null, null, null);

        // Assert
        expect(result.stability).toBe(2.5); // 1.0 * 2.5
        expect(result.difficulty).toBe(4.7); // 5.0 - 0.3
        expect(result.retrievability).toBe(0.9);
        expect(result.nextDueAt.getTime()).toBeGreaterThan(now.getTime());
      });

      it('should handle rating 1 (Again) for new card', () => {
        // Arrange
        const rating: FSRSRating = 1;

        // Act
        const result = calculateNextReview(rating, null, null, null);

        // Assert
        expect(result.stability).toBe(0.5); // max(0.1, 1.0 * 0.5)
        expect(result.difficulty).toBe(6); // min(10, 5.0 + 1)
        expect(result.retrievability).toBe(0.3);
        
        // Should review very soon (0.1 days = 2.4 hours, but Math.ceil rounds up to 1 day)
        const daysDifference = 
          (result.nextDueAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
        expect(daysDifference).toBeLessThanOrEqual(1);
      });

      it('should handle rating 2 (Hard) for new card', () => {
        // Arrange
        const rating: FSRSRating = 2;

        // Act
        const result = calculateNextReview(rating, null, null, null);

        // Assert
        expect(result.stability).toBe(0.85); // 1.0 * 0.85
        expect(result.difficulty).toBe(5.5); // min(10, 5.0 + 0.5)
        expect(result.retrievability).toBe(0.7);
      });

      it('should handle rating 4 (Easy) for new card', () => {
        // Arrange
        const rating: FSRSRating = 4;

        // Act
        const result = calculateNextReview(rating, null, null, null);

        // Assert
        expect(result.stability).toBe(4); // 1.0 * 4
        expect(result.difficulty).toBe(4.5); // max(1, 5.0 - 0.5)
        expect(result.retrievability).toBe(0.9);
      });
    });

    describe('Existing cards (with parameters)', () => {
      it('should increase stability for rating 3 (Good)', () => {
        // Arrange
        const rating: FSRSRating = 3;
        const currentStability = 5.0;
        const currentDifficulty = 4.0;
        const lastReviewedAt = new Date('2024-01-10T12:00:00.000Z');

        // Act
        const result = calculateNextReview(
          rating,
          currentStability,
          currentDifficulty,
          lastReviewedAt
        );

        // Assert
        expect(result.stability).toBe(12.5); // 5.0 * 2.5
        expect(result.difficulty).toBe(3.7); // max(1, 4.0 - 0.3)
        expect(result.retrievability).toBe(0.9);
      });

      it('should decrease stability for rating 1 (Again)', () => {
        // Arrange
        const rating: FSRSRating = 1;
        const currentStability = 10.0;
        const currentDifficulty = 3.0;

        // Act
        const result = calculateNextReview(rating, currentStability, currentDifficulty, null);

        // Assert
        expect(result.stability).toBe(5.0); // max(0.1, 10.0 * 0.5)
        expect(result.difficulty).toBe(4.0); // min(10, 3.0 + 1)
        expect(result.retrievability).toBe(0.3);
      });

      it('should respect stability minimum of 0.1', () => {
        // Arrange
        const rating: FSRSRating = 1;
        const currentStability = 0.15;

        // Act
        const result = calculateNextReview(rating, currentStability, 5.0, null);

        // Assert
        expect(result.stability).toBe(0.1); // max(0.1, 0.15 * 0.5)
      });

      it('should respect difficulty maximum of 10', () => {
        // Arrange
        const rating: FSRSRating = 1;
        const currentDifficulty = 9.8;

        // Act
        const result = calculateNextReview(rating, 5.0, currentDifficulty, null);

        // Assert
        expect(result.difficulty).toBe(10); // min(10, 9.8 + 1)
      });

      it('should respect difficulty minimum of 1', () => {
        // Arrange
        const rating: FSRSRating = 4;
        const currentDifficulty = 1.2;

        // Act
        const result = calculateNextReview(rating, 5.0, currentDifficulty, null);

        // Assert
        expect(result.difficulty).toBe(1); // max(1, 1.2 - 0.5)
      });
    });

    describe('Next due date calculation', () => {
      it('should calculate correct next due date for each rating', () => {
        // Arrange
        const baseStability = 5.0;
        const now = new Date('2024-01-15T12:00:00.000Z');

        // Act
        const result1 = calculateNextReview(1, baseStability, 5.0, null);
        const result2 = calculateNextReview(2, baseStability, 5.0, null);
        const result3 = calculateNextReview(3, baseStability, 5.0, null);
        const result4 = calculateNextReview(4, baseStability, 5.0, null);

        // Assert - Each rating should have progressively longer intervals
        const daysUntil1 = (result1.nextDueAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        const daysUntil2 = (result2.nextDueAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        const daysUntil3 = (result3.nextDueAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        const daysUntil4 = (result4.nextDueAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

        expect(daysUntil1).toBeLessThan(daysUntil2);
        expect(daysUntil2).toBeLessThan(daysUntil3);
        expect(daysUntil3).toBeLessThan(daysUntil4);
      });
    });

    describe('Edge cases and error handling', () => {
      it('should throw error for invalid rating', () => {
        // Arrange & Act & Assert
        expect(() => {
          calculateNextReview(5 as FSRSRating, null, null, null);
        }).toThrow('Invalid rating: 5');
      });

      it('should throw error for rating 0', () => {
        // Arrange & Act & Assert
        expect(() => {
          calculateNextReview(0 as FSRSRating, null, null, null);
        }).toThrow('Invalid rating: 0');
      });

      it('should handle very high stability values', () => {
        // Arrange
        const rating: FSRSRating = 4;
        const highStability = 1000;

        // Act
        const result = calculateNextReview(rating, highStability, 5.0, null);

        // Assert
        expect(result.stability).toBe(4000); // 1000 * 4
        expect(result.nextDueAt).toBeDefined();
      });

      it('should handle zero stability correctly', () => {
        // Arrange
        const rating: FSRSRating = 1;
        const zeroStability = 0.05;

        // Act
        const result = calculateNextReview(rating, zeroStability, 5.0, null);

        // Assert
        expect(result.stability).toBe(0.1); // max(0.1, 0.05 * 0.5)
      });
    });

    describe('Retrievability calculation', () => {
      it('should return correct retrievability for each rating', () => {
        // Arrange & Act
        const result1 = calculateNextReview(1, 5.0, 5.0, null);
        const result2 = calculateNextReview(2, 5.0, 5.0, null);
        const result3 = calculateNextReview(3, 5.0, 5.0, null);
        const result4 = calculateNextReview(4, 5.0, 5.0, null);

        // Assert
        expect(result1.retrievability).toBe(0.3); // Again
        expect(result2.retrievability).toBe(0.7); // Hard
        expect(result3.retrievability).toBe(0.9); // Good
        expect(result4.retrievability).toBe(0.9); // Easy
      });
    });
  });

  describe('selectCardsForReview()', () => {
    const createMockCard = (
      id: string,
      nextDueAt: string | null,
      lastReviewedAt: string | null
    ) => ({
      id,
      next_due_at: nextDueAt,
      last_reviewed_at: lastReviewedAt,
    });

    describe('Priority sorting', () => {
      it('should prioritize never-reviewed cards first', () => {
        // Arrange
        const cards = [
          createMockCard('1', '2024-01-10T12:00:00.000Z', '2024-01-05T12:00:00.000Z'), // Overdue
          createMockCard('2', null, null), // Never reviewed
          createMockCard('3', '2024-01-15T12:00:00.000Z', '2024-01-10T12:00:00.000Z'), // Due today
        ];

        // Act
        const result = selectCardsForReview(cards, 10);

        // Assert
        expect(result[0].id).toBe('2'); // Never reviewed first
      });

      it('should sort overdue cards by how overdue they are', () => {
        // Arrange
        const now = new Date('2024-01-15T12:00:00.000Z');
        const cards = [
          createMockCard('1', '2024-01-14T12:00:00.000Z', '2024-01-10T12:00:00.000Z'), // 1 day overdue
          createMockCard('2', '2024-01-10T12:00:00.000Z', '2024-01-05T12:00:00.000Z'), // 5 days overdue
          createMockCard('3', '2024-01-13T12:00:00.000Z', '2024-01-08T12:00:00.000Z'), // 2 days overdue
        ];

        // Act
        const result = selectCardsForReview(cards, 10);

        // Assert
        expect(result[0].id).toBe('2'); // Most overdue
        expect(result[1].id).toBe('3');
        expect(result[2].id).toBe('1');
      });

      it('should include cards due today', () => {
        // Arrange
        const now = new Date('2024-01-15T12:00:00.000Z');
        const cards = [
          createMockCard('1', '2024-01-15T12:00:00.000Z', '2024-01-10T12:00:00.000Z'),
          createMockCard('2', '2024-01-15T11:00:00.000Z', '2024-01-10T12:00:00.000Z'),
        ];

        // Act
        const result = selectCardsForReview(cards, 10);

        // Assert
        expect(result).toHaveLength(2);
      });
    });

    describe('Filtering and limits', () => {
      it('should respect the limit parameter', () => {
        // Arrange
        const cards = Array.from({ length: 50 }, (_, i) =>
          createMockCard(`${i}`, '2024-01-10T12:00:00.000Z', '2024-01-05T12:00:00.000Z')
        );

        // Act
        const result = selectCardsForReview(cards, 20);

        // Assert
        expect(result).toHaveLength(20);
      });

      it('should filter out future cards', () => {
        // Arrange
        const now = new Date('2024-01-15T12:00:00.000Z');
        const cards = [
          createMockCard('1', '2024-01-10T12:00:00.000Z', '2024-01-05T12:00:00.000Z'), // Overdue
          createMockCard('2', '2024-01-20T12:00:00.000Z', '2024-01-15T12:00:00.000Z'), // Future
          createMockCard('3', '2024-01-15T12:00:00.000Z', '2024-01-10T12:00:00.000Z'), // Due today
        ];

        // Act
        const result = selectCardsForReview(cards, 10);

        // Assert
        expect(result).toHaveLength(2);
        expect(result.find((c) => c.id === '2')).toBeUndefined();
      });

      it('should use default limit of 20 when not specified', () => {
        // Arrange
        const cards = Array.from({ length: 50 }, (_, i) =>
          createMockCard(`${i}`, '2024-01-10T12:00:00.000Z', '2024-01-05T12:00:00.000Z')
        );

        // Act
        const result = selectCardsForReview(cards);

        // Assert
        expect(result).toHaveLength(20);
      });
    });

    describe('Edge cases', () => {
      it('should handle empty array', () => {
        // Arrange
        const cards: any[] = [];

        // Act
        const result = selectCardsForReview(cards, 10);

        // Assert
        expect(result).toEqual([]);
      });

      it('should handle all future cards', () => {
        // Arrange
        const cards = [
          createMockCard('1', '2024-01-20T12:00:00.000Z', '2024-01-15T12:00:00.000Z'),
          createMockCard('2', '2024-01-25T12:00:00.000Z', '2024-01-15T12:00:00.000Z'),
        ];

        // Act
        const result = selectCardsForReview(cards, 10);

        // Assert
        expect(result).toEqual([]);
      });

      it('should handle cards with null next_due_at but with last_reviewed_at', () => {
        // Arrange - Cards with last_reviewed_at but null next_due_at are treated as needing review
        const cards = [
          createMockCard('1', null, '2024-01-10T12:00:00.000Z'),
        ];

        // Act
        const result = selectCardsForReview(cards, 10);

        // Assert - Should include the card as it needs review (null next_due_at = due)
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
      });

      it('should handle limit of 0', () => {
        // Arrange
        const cards = [
          createMockCard('1', '2024-01-10T12:00:00.000Z', '2024-01-05T12:00:00.000Z'),
        ];

        // Act
        const result = selectCardsForReview(cards, 0);

        // Assert
        expect(result).toEqual([]);
      });

      it('should handle multiple never-reviewed cards', () => {
        // Arrange
        const cards = [
          createMockCard('1', null, null),
          createMockCard('2', null, null),
          createMockCard('3', null, null),
        ];

        // Act
        const result = selectCardsForReview(cards, 2);

        // Assert
        expect(result).toHaveLength(2);
        expect(result.every((c) => !c.last_reviewed_at)).toBe(true);
      });
    });

    describe('Complex scenarios', () => {
      it('should handle mixed card types with correct priority', () => {
        // Arrange
        const now = new Date('2024-01-15T12:00:00.000Z');
        const cards = [
          createMockCard('overdue-1', '2024-01-10T12:00:00.000Z', '2024-01-05T12:00:00.000Z'),
          createMockCard('never-1', null, null),
          createMockCard('due-today', '2024-01-15T12:00:00.000Z', '2024-01-10T12:00:00.000Z'),
          createMockCard('future', '2024-01-20T12:00:00.000Z', '2024-01-15T12:00:00.000Z'),
          createMockCard('never-2', null, null),
          createMockCard('overdue-2', '2024-01-12T12:00:00.000Z', '2024-01-07T12:00:00.000Z'),
        ];

        // Act
        const result = selectCardsForReview(cards, 10);

        // Assert
        expect(result).toHaveLength(5); // All except future
        
        // First two should be never-reviewed
        expect(result[0].id).toMatch(/never-/);
        expect(result[1].id).toMatch(/never-/);
        
        // Should not include future card
        expect(result.find((c) => c.id === 'future')).toBeUndefined();
      });
    });
  });
});
