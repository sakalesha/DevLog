import { Request, Response } from 'express';
import Challenge from '../models/Challenge';

export const getChallenges = async (req: Request, res: Response) => {
    try {
        const challenges = await Challenge.find({ userId: (req as any).user._id }).sort({ createdAt: -1 });
        res.json(challenges);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getChallengeById = async (req: Request, res: Response) => {
    try {
        const challenge = await Challenge.findOne({ _id: req.params.id, userId: (req as any).user._id });
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        res.json(challenge);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createChallenge = async (req: Request, res: Response) => {
    try {
        const challenge = new Challenge({
            ...req.body,
            userId: (req as any).user._id,
        });
        const createdChallenge = await challenge.save();
        res.status(201).json(createdChallenge);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateChallenge = async (req: Request, res: Response) => {
    try {
        const challenge = await Challenge.findOne({ _id: req.params.id, userId: (req as any).user._id });
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        Object.assign(challenge, req.body);
        const updatedChallenge = await challenge.save();
        res.json(updatedChallenge);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteChallenge = async (req: Request, res: Response) => {
    try {
        const challenge = await Challenge.findOne({ _id: req.params.id, userId: (req as any).user._id });
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        await challenge.deleteOne();
        res.json({ message: 'Challenge removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
