// Update src/routes/linkRoutes.ts to include the stats route
import { Router } from 'express';
import * as linkController from '../controllers/linkController';

const router = Router();

// Create a short URL
router.post('/links', linkController.createShortLink);

// Get stats for all links
router.get('/stats', linkController.getLinkStats);

// Redirect to original URL (this must be last to avoid conflicts with other routes)
router.get('/:shortCode', linkController.redirectToOriginalUrl);

export default router;
