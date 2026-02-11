import '@jest/globals';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { generateShortCode, validateClick } from '../../utils/urlGenerator';

describe('urlGenerator', () => {
  describe('generateShortCode', () => {
    it('should generate a string with default length of 7', () => {
      const shortCode = generateShortCode();
      expect(shortCode).toHaveLength(7);
    });

    it('should generate a string with specified length', () => {
      const shortCode = generateShortCode(10);
      expect(shortCode).toHaveLength(10);
    });

    it('should contain only alphanumeric characters', () => {
      const shortCode = generateShortCode();
      expect(shortCode).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate different codes on consecutive calls', () => {
      const code1 = generateShortCode();
      const code2 = generateShortCode();
      expect(code1).not.toEqual(code2);
    });
  });

  describe('validateClick', () => {
    beforeEach(() => {
      // Mock Math.random to return a controlled value
      jest.spyOn(global.Math, 'random');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return true when random value is less than 0.8', async () => {
      (Math.random as jest.Mock).mockReturnValue(0.7);
      const result = await validateClick();
      expect(result).toBe(true);
    });

    it('should return false when random value is greater than or equal to 0.8', async () => {
      (Math.random as jest.Mock).mockReturnValue(0.8);
      const result = await validateClick();
      expect(result).toBe(false);
    });

    it('should resolve after approximately 100ms', async () => {
      const start = Date.now();
      await validateClick();
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(90);  // Allow small variation
      expect(duration).toBeLessThanOrEqual(150);    // Allow small variation
    });
  });
});