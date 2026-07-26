import { Request, Response } from 'express';
import LearningEntry from '../models/LearningEntry';

// Fields that are safe for a user to update on their own entry
const UPDATABLE_FIELDS = [
    'date', 'topic', 'category', 'categoryId', 'categoryPath',
    'content', 'keyTakeaway', 'doubts', 'timeSpent', 'tags', 'status',
] as const;

export const getEntries = async (req: Request, res: Response) => {
    try {
        const entries = await LearningEntry.find({ userId: (req as any).user._id }).sort({ date: -1 });
        res.json(entries);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getEntryById = async (req: Request, res: Response) => {
    try {
        const entry = await LearningEntry.findOne({ _id: req.params.id, userId: (req as any).user._id });
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }
        // Increment view count on read
        entry.views = (entry.views || 0) + 1;
        await entry.save();
        res.json(entry);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createEntry = async (req: Request, res: Response) => {
    try {
        const entry = new LearningEntry({
            ...req.body,
            userId: (req as any).user._id, // always override userId from auth
        });
        const createdEntry = await entry.save();
        res.status(201).json(createdEntry);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const updateEntry = async (req: Request, res: Response) => {
    try {
        const entry = await LearningEntry.findOne({ _id: req.params.id, userId: (req as any).user._id });
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        // Security: only update explicitly allowed fields, never touch userId/_id
        for (const field of UPDATABLE_FIELDS) {
            if (req.body[field] !== undefined) {
                (entry as any)[field] = req.body[field];
            }
        }

        const updatedEntry = await entry.save();
        res.json(updatedEntry);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteEntry = async (req: Request, res: Response) => {
    try {
        const entry = await LearningEntry.findOne({ _id: req.params.id, userId: (req as any).user._id });
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }

        await entry.deleteOne();
        res.json({ message: 'Entry removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/** Computes the current consecutive-day streak from an array of ISO date strings. */
function computeStreak(dates: string[]): { currentStreak: number; longestStreak: number } {
    if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Normalize to YYYY-MM-DD and deduplicate
    const uniqueDays = Array.from(
        new Set(dates.map(d => new Date(d).toISOString().split('T')[0]))
    ).sort((a, b) => (a > b ? -1 : 1)); // descending

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Streak must start from today or yesterday
    if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) {
        return { currentStreak: 0, longestStreak: computeLongestStreak(uniqueDays) };
    }

    let streak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
        const prev = new Date(uniqueDays[i - 1]);
        const curr = new Date(uniqueDays[i]);
        const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }

    return { currentStreak: streak, longestStreak: Math.max(streak, computeLongestStreak(uniqueDays)) };
}

function computeLongestStreak(sortedDescDays: string[]): number {
    if (sortedDescDays.length === 0) return 0;
    let longest = 1;
    let current = 1;
    for (let i = 1; i < sortedDescDays.length; i++) {
        const prev = new Date(sortedDescDays[i - 1]);
        const curr = new Date(sortedDescDays[i]);
        const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
        if (diffDays === 1) {
            current++;
            longest = Math.max(longest, current);
        } else {
            current = 1;
        }
    }
    return longest;
}

export const getStats = async (req: Request, res: Response) => {
    try {
        const entries = await LearningEntry.find({ userId: (req as any).user._id });

        const uniqueTopics = new Set(entries.map(e => e.topic)).size;
        const totalMinutes = entries.reduce((acc, e) => {
            return acc + (e.timeSpent.unit === 'hours' ? e.timeSpent.amount * 60 : e.timeSpent.amount);
        }, 0);

        const entryDates = entries.map(e => e.date.toString());
        const { currentStreak, longestStreak } = computeStreak(entryDates);

        const stats = {
            currentStreak,
            longestStreak,
            totalEntriesCreated: entries.length,
            totalHoursLearned: parseFloat((totalMinutes / 60).toFixed(1)),
            topicsCount: uniqueTopics,
            lastEntryDate: entries[0]?.date,
        };

        res.json(stats);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
