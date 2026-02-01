import type { PreviewCardDTO } from '../../../types';

/**
 * In-memory store for preview cards.
 * This is a simple MVP implementation. In production, you would use:
 * - Redis for distributed caching
 * - Database temporary table
 * - Cloud storage (S3, etc.)
 */
class PreviewCardsStore {
  private store: Map<string, PreviewCardDTO[]> = new Map();

  /**
   * Store preview cards for a generation request
   */
  set(requestId: string, cards: PreviewCardDTO[]): void {
    this.store.set(requestId, cards);
  }

  /**
   * Retrieve preview cards for a generation request
   */
  get(requestId: string): PreviewCardDTO[] | undefined {
    return this.store.get(requestId);
  }

  /**
   * Delete preview cards for a generation request
   */
  delete(requestId: string): void {
    this.store.delete(requestId);
  }

  /**
   * Clear all preview cards (useful for cleanup)
   */
  clear(): void {
    this.store.clear();
  }
}

// Export singleton instance
export const previewCardsStore = new PreviewCardsStore();
