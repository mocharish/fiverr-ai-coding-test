import { Request, Response } from 'express';
import { createLink, findByShortCode, recordClick, getLinkStats as getLinksStatsModel } from '../models/linkModel';
import { validateClick } from '../utils/urlGenerator';

// POST /links - Create a new short link
export const createShortLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;
    
    // Validate the URL
    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }
    
    try {
      // Try to parse the URL to ensure it's valid
      new URL(url);
    } catch (error) {
      res.status(400).json({ error: 'Invalid URL format' });
      return;
    }
    
    // Create the short link
    const link = await createLink(url);
    
    // Hard-coded approach
    const baseUrl = "http://localhost:3000";
    const shortUrl = `${baseUrl}/${link.shortCode}`;
    
    res.status(201).json({
      originalUrl: link.originalUrl,
      shortUrl,
      shortCode: link.shortCode,
      createdAt: link.createdAt
    });
  } catch (error) {
    console.error('Error creating short link:', error);
    res.status(500).json({ error: 'Failed to create short link' });
  }
};

// GET /:shortCode - Redirect to the original URL
export const redirectToOriginalUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    // Explicitly type everything
    const shortCode: string = req.params.shortCode as string;
    
    // Find the link in the database
    const link = await findByShortCode(shortCode);
    
    if (!link) {
      res.status(404).json({ error: 'Short link not found' });
      return;
    }
    
    // Perform fraud validation (this takes 100ms as per requirements)
    const isValid = await validateClick();
    
    // Record the click regardless of validity (for tracking purposes)
    await recordClick(link.id, isValid);
    
    // Make sure originalUrl is a string
    const originalUrl: string = link.originalUrl;
    
    // Redirect to the original URL
    res.redirect(originalUrl);
  } catch (error) {
    console.error('Error redirecting to original URL:', error);
    res.status(500).json({ error: 'Failed to redirect to original URL' });
  }
};


// GET /stats - Get analytics for all links
export const getLinkStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse query parameters for pagination
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      res.status(400).json({ error: 'Invalid page parameter' });
      return;
    }
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      res.status(400).json({ error: 'Invalid limit parameter. Must be between 1 and 100' });
      return;
    }
    
    // Get stats with pagination
    const stats = await getLinksStatsModel(page, limit);
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error retrieving link stats:', error);
    res.status(500).json({ error: 'Failed to retrieve link stats' });
  }
};
