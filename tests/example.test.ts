import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Example unit test using Vitest
 * This is a template showing best practices:
 * - Descriptive test names
 * - Arrange-Act-Assert pattern
 * - Proper use of mocks and spies
 */

describe('Example Test Suite', () => {
  beforeEach(() => {
    // Setup before each test
    vi.clearAllMocks();
  });

  describe('Basic Assertions', () => {
    it('should pass a simple equality check', () => {
      // Arrange
      const expected = 'hello world';
      
      // Act
      const actual = 'hello world';
      
      // Assert
      expect(actual).toBe(expected);
    });

    it('should work with numbers', () => {
      expect(2 + 2).toBe(4);
    });

    it('should work with arrays', () => {
      const arr = [1, 2, 3];
      expect(arr).toHaveLength(3);
      expect(arr).toContain(2);
    });
  });

  describe('Mocking Functions', () => {
    it('should mock a function call', () => {
      // Arrange
      const mockFn = vi.fn().mockReturnValue('mocked value');
      
      // Act
      const result = mockFn('test');
      
      // Assert
      expect(mockFn).toHaveBeenCalledWith('test');
      expect(result).toBe('mocked value');
    });

    it('should spy on an object method', () => {
      // Arrange
      const obj = {
        method: (x: number) => x * 2,
      };
      const spy = vi.spyOn(obj, 'method');
      
      // Act
      obj.method(5);
      
      // Assert
      expect(spy).toHaveBeenCalledWith(5);
      expect(spy).toHaveReturnedWith(10);
    });
  });

  describe('Async Operations', () => {
    it('should handle promises', async () => {
      // Arrange
      const asyncFn = async () => 'async result';
      
      // Act
      const result = await asyncFn();
      
      // Assert
      expect(result).toBe('async result');
    });

    it('should handle rejected promises', async () => {
      // Arrange
      const failingFn = async () => {
        throw new Error('Failed');
      };
      
      // Act & Assert
      await expect(failingFn()).rejects.toThrow('Failed');
    });
  });
});
