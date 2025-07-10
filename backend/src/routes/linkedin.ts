import express from 'express';
import { scrapeAndTailorResume } from '../controllers/linkedinController';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Route to scrape LinkedIn job and tailor resume
router.post('/scrape-and-tailor', requireAuth, scrapeAndTailorResume);

export default router; 