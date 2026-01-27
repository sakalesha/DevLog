import { Request, Response } from 'express';
import LearningEntry from '../models/LearningEntry';

export const getEntries = async (req: Request, res: Response) => {
    try {
        const entries = await LearningEntry.find().sort({ date: -1 });
        res.json(entries);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getEntryById = async (req: Request, res: Response) => {
    try {
        const entry = await LearningEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }
        res.json(entry);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createEntry = async (req: Request, res: Response) => {
    try {
        const entry = new LearningEntry({
            ...req.body,
            userId: 'u1' // Placeholder
        });
        const createdEntry = await entry.save();
        res.status(201).json(createdEntry);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateEntry = async (req: Request, res: Response) => {
    try {
        const entry = await LearningEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        Object.assign(entry, req.body);
        const updatedEntry = await entry.save();
        res.json(updatedEntry);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteEntry = async (req: Request, res: Response) => {
    try {
        const entry = await LearningEntry.findById(req.params.id);
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        await entry.deleteOne();
        res.json({ message: 'Entry removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getStats = async (req: Request, res: Response) => {
    try {
        const entries = await LearningEntry.find({ userId: 'u1' }); // Filter by user later

        const uniqueTopics = new Set(entries.map(e => e.topic)).size;
        const totalMinutes = entries.reduce((acc, e) => {
            return acc + (e.timeSpent.unit === 'hours' ? e.timeSpent.amount * 60 : e.timeSpent.amount);
        }, 0);

        const stats = {
            currentStreak: entries.length > 0 ? 3 : 0, // Simplified streak logic for MVP
            longestStreak: 7,
            totalEntriesCreated: entries.length,
            totalHoursLearned: parseFloat((totalMinutes / 60).toFixed(1)),
            topicsCount: uniqueTopics,
            lastEntryDate: entries[0]?.date
        };

        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
