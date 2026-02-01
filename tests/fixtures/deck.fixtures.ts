/**
 * Test fixtures for deck-related data
 */

export const mockDeck = {
  id: 'deck-123',
  name: 'Test Deck',
  description: 'A test deck for unit tests',
  user_id: 'test-user-id-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockDecks = [
  mockDeck,
  {
    id: 'deck-456',
    name: 'Second Test Deck',
    description: 'Another test deck',
    user_id: 'test-user-id-123',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];
