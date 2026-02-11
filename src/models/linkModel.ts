import pool from '../config/database';
import { Link } from '../types';
import { generateShortCode } from '../utils/urlGenerator';

export const createLink = async (originalUrl: string): Promise<Link> => {
  // Check if the URL already exists in the database
  const existingLink = await findByOriginalUrl(originalUrl);
  if (existingLink) {
    return existingLink;
  }

  // Generate a unique short code
  const shortCode = await generateUniqueShortCode();
  
  // Insert the new link into the database
  const query = `
    INSERT INTO links (original_url, short_code)
    VALUES ($1, $2)
    RETURNING id, original_url as "originalUrl", short_code as "shortCode", created_at as "createdAt"
  `;
  
  const result = await pool.query(query, [originalUrl, shortCode]);
  return result.rows[0];
};

const findByOriginalUrl = async (originalUrl: string): Promise<Link | null> => {
  const query = `
    SELECT id, original_url as "originalUrl", short_code as "shortCode", created_at as "createdAt"
    FROM links
    WHERE original_url = $1
  `;
  
  const result = await pool.query(query, [originalUrl]);
  return result.rows[0] || null;
};

export const findByShortCode = async (shortCode: string): Promise<Link | null> => {
  const query = `
    SELECT id, original_url as "originalUrl", short_code as "shortCode", created_at as "createdAt"
    FROM links
    WHERE short_code = $1
  `;
  
  const result = await pool.query(query, [shortCode]);
  return result.rows[0] || null;
};

// Helper function to generate a unique short code
const generateUniqueShortCode = async (): Promise<string> => {
  let shortCode: string;
  let exists: boolean;
  
  // Keep generating codes until we find a unique one
  do {
    shortCode = generateShortCode();
    const link = await findByShortCode(shortCode);
    exists = !!link;
  } while (exists);
  
  return shortCode;
};

export const recordClick = async (linkId: number, validClick: boolean): Promise<void> => {
  const query = `
    INSERT INTO clicks (link_id, valid_click)
    VALUES ($1, $2)
  `;
  
  await pool.query(query, [linkId, validClick]);
};

