/**
 * Simplified FSRS (Free Spaced Repetition Scheduler) implementation for MVP.
 * This is a basic version - a production implementation would use the full FSRS algorithm.
 */

export type FSRSRating = 1 | 2 | 3 | 4;

export interface FSRSParameters {
  stability: number;
  difficulty: number;
  retrievability: number;
}

export interface FSRSResult extends FSRSParameters {
  nextDueAt: Date;
}

/**
 * Default initial parameters for new cards
 */
const DEFAULT_STABILITY = 1.0;
const DEFAULT_DIFFICULTY = 5.0;
const DEFAULT_RETRIEVABILITY = 0.9;

/**
 * Calculates the next review parameters based on the rating.
 * This is a simplified version of FSRS for MVP purposes.
 *
 * @param rating - User rating (1=Again, 2=Hard, 3=Good, 4=Easy)
 * @param currentStability - Current stability value (or null for new cards)
 * @param currentDifficulty - Current difficulty value (or null for new cards)
 * @param lastReviewedAt - Last review date (or null for new cards)
 * @returns New FSRS parameters and next due date
 */
export function calculateNextReview(
  rating: FSRSRating,
  currentStability: number | null,
  currentDifficulty: number | null,
  lastReviewedAt: Date | null
): FSRSResult {
  const now = new Date();

  // Initialize for new cards
  const stability = currentStability ?? DEFAULT_STABILITY;
  const difficulty = currentDifficulty ?? DEFAULT_DIFFICULTY;

  // Calculate new parameters based on rating
  let newStability: number;
  let newDifficulty: number;
  let intervalDays: number;

  switch (rating) {
    case 1: // Again - card was forgotten
      newStability = Math.max(0.1, stability * 0.5);
      newDifficulty = Math.min(10, difficulty + 1);
      intervalDays = 0.1; // Review again very soon (2.4 hours)
      break;

    case 2: // Hard - card was difficult
      newStability = stability * 0.85;
      newDifficulty = Math.min(10, difficulty + 0.5);
      intervalDays = stability * 1.2;
      break;

    case 3: // Good - card was recalled correctly
      newStability = stability * 2.5;
      newDifficulty = Math.max(1, difficulty - 0.3);
      intervalDays = stability * 2.5;
      break;

    case 4: // Easy - card was very easy
      newStability = stability * 4;
      newDifficulty = Math.max(1, difficulty - 0.5);
      intervalDays = stability * 4;
      break;

    default:
      throw new Error(`Invalid rating: ${rating}`);
  }

  // Calculate retrievability (simplified)
  // In real FSRS, this is calculated based on time elapsed and stability
  const retrievability = rating >= 3 ? 0.9 : rating === 2 ? 0.7 : 0.3;

  // Calculate next due date
  const nextDueAt = new Date(now);
  nextDueAt.setDate(nextDueAt.getDate() + Math.ceil(intervalDays));

  return {
    stability: newStability,
    difficulty: newDifficulty,
    retrievability,
    nextDueAt,
  };
}

/**
 * Selects cards that are due for review.
 * Returns cards sorted by priority (most overdue first).
 *
 * @param cards - Array of cards with their review data
 * @param limit - Maximum number of cards to return
 * @returns Array of card IDs sorted by priority
 */
export function selectCardsForReview<
  T extends {
    id: string;
    next_due_at: string | null;
    last_reviewed_at: string | null;
  },
>(cards: T[], limit: number = 20): T[] {
  const now = new Date();

  // Sort cards by priority:
  // 1. Never reviewed cards first
  // 2. Overdue cards (sorted by how overdue they are)
  // 3. Due today cards
  const sortedCards = [...cards].sort((a, b) => {
    const aNextDue = a.next_due_at ? new Date(a.next_due_at) : null;
    const bNextDue = b.next_due_at ? new Date(b.next_due_at) : null;
    const aLastReviewed = a.last_reviewed_at ? new Date(a.last_reviewed_at) : null;
    const bLastReviewed = b.last_reviewed_at ? new Date(b.last_reviewed_at) : null;

    // Never reviewed cards have highest priority
    if (!aLastReviewed && bLastReviewed) return -1;
    if (aLastReviewed && !bLastReviewed) return 1;
    if (!aLastReviewed && !bLastReviewed) return 0;

    // Both have been reviewed - sort by next_due_at
    if (!aNextDue && !bNextDue) return 0;
    if (!aNextDue) return 1;
    if (!bNextDue) return -1;

    // Sort by how overdue they are (most overdue first)
    return aNextDue.getTime() - bNextDue.getTime();
  });

  // Return up to limit cards that are due
  return sortedCards
    .filter((card) => {
      if (!card.next_due_at) return true; // Never reviewed
      const nextDue = new Date(card.next_due_at);
      return nextDue <= now; // Due or overdue
    })
    .slice(0, limit);
}
