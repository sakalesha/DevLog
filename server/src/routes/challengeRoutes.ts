import express from 'express';
import {
    getChallenges,
    getChallengeById,
    createChallenge,
    updateChallenge,
    deleteChallenge,
} from '../controllers/challengeController';

import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect); // Protect all routes

router.route('/')
    .get(getChallenges)
    .post(createChallenge);

router.route('/:id')
    .get(getChallengeById)
    .put(updateChallenge) // or patch
    .delete(deleteChallenge);

export default router;
