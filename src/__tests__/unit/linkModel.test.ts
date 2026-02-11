import '@jest/globals';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock the database pool - this must be defined before the imports
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    query: jest.fn()
  }
}));

// Mock the shortcode generation
jest.mock('../../utils/urlGenerator', () => ({
  generateShortCode: jest.fn().mockReturnValue('ABC123')
}));

import { createLink, findByShortCode, recordClick, getLinkStats } from '../../models/linkModel';
import * as urlGenerator from '../../utils/urlGenerator';

// Access to mocked database
const mockPool = require('../../config/database').default;

// Helper to mock query responses
const mockQueryResult = (data: any) => {
  return {
    rows: Array.isArray(data) ? data : [data],
    rowCount: Array.isArray(data) ? data.length : 1
  };
};

describe('linkModel', () => {
  beforeEach(() => {
    mockPool.query.mockReset();
  });

  describe('createLink', () => {
    it('should return existing link if URL already exists', async () => {
      const existingLink = {
        id: 1,
        originalUrl: 'https://example.com',
        shortCode: 'ABC123',
        createdAt: new Date()
      };

      // Mock first query to find existing link
      mockPool.query
        .mockResolvedValueOnce({ rows: [existingLink], rowCount: 1 });

      const result = await createLink('https://example.com');

      expect(result).toEqual(existingLink);
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should create a new link if URL does not exist', async () => {
      const newLink = {
        id: 1,
        originalUrl: 'https://example.com',
        shortCode: 'ABC123',
        createdAt: new Date()
      };

      // Mock first query to find no existing link
      mockPool.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        // Mock second query to find no existing link with the short code
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        // Mock third query to insert the new link
        .mockResolvedValueOnce({ rows: [newLink], rowCount: 1 });

      const result = await createLink('https://example.com');

      expect(result).toEqual(newLink);
      expect(mockPool.query).toHaveBeenCalledTimes(3);
      expect(urlGenerator.generateShortCode).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByShortCode', () => {
    it('should return link if found', async () => {
      const link = {
        id: 1,
        originalUrl: 'https://example.com',
        shortCode: 'ABC123',
        createdAt: new Date()
      };

      mockPool.query.mockResolvedValueOnce({ rows: [link], rowCount: 1 });

      const result = await findByShortCode('ABC123');

      expect(result).toEqual(link);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('short_code = $1'),
        ['ABC123']
      );
    });

    it('should return null if link not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const result = await findByShortCode('NOTFOUND');

      expect(result).toBeNull();
    });
  });

  describe('recordClick', () => {
    it('should insert a click record', async () => {
      mockPool.query.mockResolvedValueOnce({});

      await recordClick(1, true);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO clicks'),
        [1, true]
      );
    });
  });

  describe('getLinkStats', () => {
    it('should return paginated stats with default parameters', async () => {
      const countResult = { count: '2' };
      const linksResult = [
        { id: 1, originalUrl: 'https://example1.com', shortCode: 'ABC123', totalValidClicks: '10' },
        { id: 2, originalUrl: 'https://example2.com', shortCode: 'DEF456', totalValidClicks: '5' }
      ];

      // Mock the count query
      mockPool.query.mockResolvedValueOnce({ rows: [countResult], rowCount: 1 });

      // Mock the links query
      mockPool.query.mockResolvedValueOnce({ rows: linksResult, rowCount: linksResult.length });

      // Mock monthly clicks queries
      mockPool.query.mockResolvedValueOnce({ rows: [
        { month: '2023-01', count: '5' },
        { month: '2023-02', count: '5' }
      ], rowCount: 2 });

      mockPool.query.mockResolvedValueOnce({ rows: [
        { month: '2023-01', count: '3' },
        { month: '2023-02', count: '2' }
      ], rowCount: 2 });

      const result = await getLinkStats();

      expect(result).toEqual({
        data: [
          {
            originalUrl: 'https://example1.com',
            shortCode: 'ABC123',
            totalValidClicks: 10,
            clicksByMonth: { '2023-01': 5, '2023-02': 5 }
          },
          {
            originalUrl: 'https://example2.com',
            shortCode: 'DEF456',
            totalValidClicks: 5,
            clicksByMonth: { '2023-01': 3, '2023-02': 2 }
          }
        ],
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      });

      expect(mockPool.query).toHaveBeenCalledTimes(4);
    });

    it('should use custom pagination parameters', async () => {
      const countResult = { count: '20' };

      // Mock the count query
      mockPool.query.mockResolvedValueOnce({ rows: [countResult], rowCount: 1 });

      // Mock the links query with empty results for simplicity
      mockPool.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const result = await getLinkStats(2, 5);

      expect(result.pagination).toEqual({
        total: 20,
        page: 2,
        limit: 5,
        totalPages: 4
      });

      // Verify that the LIMIT and OFFSET were set correctly in the query
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.anything(),
        [5, 5] // Limit = 5, Offset = (2-1)*5 = 5
      );
    });
  });
});