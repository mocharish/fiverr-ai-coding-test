import { Request, Response } from 'express';
import { createLink } from '../models/linkModel';

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
    
    // Construct the full short URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
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
