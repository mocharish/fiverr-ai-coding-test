import pool from '../config/database';
import { Link, LinkStats, PaginatedResponse } from '../types';
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


export interface MonthlyClicks {
  [key: string]: number;
}

export const getLinkStats = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<LinkStats>> => {
  // Get total count for pagination
  const countResult = await pool.query('SELECT COUNT(*) FROM links');
  const total = parseInt(countResult.rows[0].count);
  
  // Calculate pagination values
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);
  
  // Get links with their total valid clicks
  const query = `
    SELECT 
      l.id,
      l.original_url as "originalUrl",
      l.short_code as "shortCode",
      COUNT(CASE WHEN c.valid_click = true THEN 1 END) as "totalValidClicks"
    FROM 
      links l
    LEFT JOIN 
      clicks c ON l.id = c.link_id
    GROUP BY 
      l.id, l.original_url, l.short_code
    ORDER BY 
      l.created_at DESC
    LIMIT $1 OFFSET $2
  `;
  
  const result = await pool.query(query, [limit, offset]);
  
  // For each link, get clicks grouped by month
  const links = await Promise.all(result.rows.map(async (row) => {
    const monthlyQuery = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) FILTER (WHERE valid_click = true) as count
      FROM 
        clicks
      WHERE 
        link_id = $1 AND valid_click = true
      GROUP BY 
        TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY 
        month
    `;
    
    const monthlyResult = await pool.query(monthlyQuery, [row.id]);
    
    const clicksByMonth: MonthlyClicks = {};
    monthlyResult.rows.forEach((monthData) => {
      clicksByMonth[monthData.month] = parseInt(monthData.count);
    });
    
    return {
      originalUrl: row.originalUrl,
      shortCode: row.shortCode,
      totalValidClicks: parseInt(row.totalValidClicks) || 0,
      clicksByMonth
    };
  }));
  
  return {
    data: links,
    pagination: {
      total,
      page,
      limit,
      totalPages
    }
  };
};



