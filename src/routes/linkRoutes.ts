import { Router } from 'express';
import * as linkController from '../controllers/linkController';

const router = Router();

// Create a short URL
router.post('/links', linkController.createShortLink);

export default router;
