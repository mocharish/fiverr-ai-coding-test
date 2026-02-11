import '@jest/globals';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../index';
import * as linkModel from '../../models/linkModel';
import * as urlGenerator from '../../utils/urlGenerator';

// Mock the link model to avoid actual database calls
jest.mock('../../models/linkModel');
jest.mock('../../utils/urlGenerator');

describe('Link Controller Integration Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /links', () => {
    it('should create a new short link', async () => {
      const mockLink = {
        id: 1,
        originalUrl: 'https://example.com',
        shortCode: 'ABC123',
        createdAt: new Date().toISOString()
      };

      // Mock the createLink function
      (linkModel.createLink as jest.Mock).mockResolvedValue(mockLink);

      const response = await request(app)
        .post('/links')
        .send({ url: 'https://example.com' })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toEqual({
        originalUrl: mockLink.originalUrl,
        shortUrl: `http://localhost:3000/${mockLink.shortCode}`,
        shortCode: mockLink.shortCode,
        createdAt: mockLink.createdAt
      });

      expect(linkModel.createLink).toHaveBeenCalledWith('https://example.com');
    });

    it('should return 400 if URL is missing', async () => {
      const response = await request(app)
        .post('/links')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({ error: 'URL is required' });
      expect(linkModel.createLink).not.toHaveBeenCalled();
    });

    it('should return 400 if URL is invalid', async () => {
      const response = await request(app)
        .post('/links')
        .send({ url: 'invalid-url' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({ error: 'Invalid URL format' });
      expect(linkModel.createLink).not.toHaveBeenCalled();
    });
  });

  describe('GET /:shortCode', () => {
    it('should redirect to original URL', async () => {
      const mockLink = {
        id: 1,
        originalUrl: 'https://example.com',
        shortCode: 'ABC123',
        createdAt: new Date().toISOString()
      };

      // Mock the findByShortCode function
      (linkModel.findByShortCode as jest.Mock).mockResolvedValue(mockLink);

      // Mock validateClick to return true
      (urlGenerator.validateClick as jest.Mock).mockResolvedValue(true);

      // Mock recordClick to do nothing
      (linkModel.recordClick as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .get('/ABC123')
        .expect(302); // 302 is redirect status code

      expect(response.header.location).toBe('https://example.com');
      expect(linkModel.findByShortCode).toHaveBeenCalledWith('ABC123');
      expect(urlGenerator.validateClick).toHaveBeenCalled();
      expect(linkModel.recordClick).toHaveBeenCalledWith(1, true);
    });

    it('should handle non-existent short code', async () => {
      // Mock the findByShortCode function to return null (not found)
      (linkModel.findByShortCode as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/NOTFOUND')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toEqual({ error: 'Short link not found' });
      expect(linkModel.findByShortCode).toHaveBeenCalledWith('NOTFOUND');
      expect(urlGenerator.validateClick).not.toHaveBeenCalled();
      expect(linkModel.recordClick).not.toHaveBeenCalled();
    });
  });

  describe('GET /stats', () => {
    it('should return paginated stats', async () => {
      const mockStats = {
        data: [
          {
            originalUrl: 'https://example.com',
            shortCode: 'ABC123',
            totalValidClicks: 10,
            clicksByMonth: { '2023-01': 5, '2023-02': 5 }
          }
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      };

      // Mock the getLinkStats function
      (linkModel.getLinkStats as jest.Mock).mockResolvedValue(mockStats);

      const response = await request(app)
        .get('/stats')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(mockStats);
      expect(linkModel.getLinkStats).toHaveBeenCalledWith(1, 10);
    });

    it('should accept custom pagination parameters', async () => {
      const mockStats = {
        data: [],
        pagination: {
          total: 0,
          page: 2,
          limit: 5,
          totalPages: 0
        }
      };

      // Mock the getLinkStats function
      (linkModel.getLinkStats as jest.Mock).mockResolvedValue(mockStats);

      await request(app)
        .get('/stats?page=2&limit=5')
        .expect(200);

      expect(linkModel.getLinkStats).toHaveBeenCalledWith(2, 5);
    });

    it('should return 400 for invalid page parameter', async () => {
      const response = await request(app)
        .get('/stats?page=invalid')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({ error: 'Invalid page parameter' });
      expect(linkModel.getLinkStats).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid limit parameter', async () => {
      const response = await request(app)
        .get('/stats?limit=0')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({ error: 'Invalid limit parameter. Must be between 1 and 100' });
      expect(linkModel.getLinkStats).not.toHaveBeenCalled();
    });
  });
});