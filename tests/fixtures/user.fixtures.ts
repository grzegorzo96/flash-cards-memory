/**
 * Test fixtures for user-related data
 * Use these fixtures in your tests for consistent test data
 */

export const mockUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockAnonymousUser = {
  id: 'anonymous-user-id-456',
  email: '',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const mockUsers = [mockUser, mockAnonymousUser];
