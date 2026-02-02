import express from 'express';
import {
    getEntries,
    getEntryById,
    createEntry,
    updateEntry,
    deleteEntry,
    getStats,
} from '../controllers/entryController';

import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect); // Protect all routes

router.get('/stats', getStats); // Must be before /:id to avoid conflict

router.route('/')
    .get(getEntries)
    .post(createEntry);

router.route('/:id')
    .get(getEntryById)
    .put(updateEntry)
    .delete(deleteEntry);

export default router;
