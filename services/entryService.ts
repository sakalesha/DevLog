
import { LearningEntry, UserStats, Category } from '../types';

const STORAGE_KEY = 'devlog_entries';

// Mock initial data
const INITIAL_ENTRIES: LearningEntry[] = [
  {
    _id: '1',
    userId: 'u1',
    date: new Date().toISOString(),
    topic: 'Binary Tree - Level Order Traversal',
    category: 'DSA',
    content: 'Today I learned about breadth-first search on binary trees. Using a queue is essential to keep track of nodes at each level. Time complexity is O(N).',
    keyTakeaway: 'Queues facilitate level-by-level processing in tree structures.',
    timeSpent: { amount: 45, unit: 'minutes' },
    challengeId: 'c1',
    dayNumber: 1,
    tags: ['trees', 'bfs', 'queue'],

    status: 'published',
    views: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const entryService = {
  getEntries: async (): Promise<LearningEntry[]> => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_ENTRIES;
  },

  getEntryById: async (id: string): Promise<LearningEntry | null> => {
    const entries = await entryService.getEntries();
    return entries.find(e => e._id === id) || null;
  },

  saveEntry: async (entryData: Partial<LearningEntry>): Promise<LearningEntry> => {
    const entries = await entryService.getEntries();

    let dayNumber = entryData.dayNumber;
    if (!dayNumber && entryData.challengeId) {
      const challengeEntries = entries.filter(e => e.challengeId === entryData.challengeId);
      dayNumber = challengeEntries.length + 1;
    }

    const newEntry: LearningEntry = {
      ...entryData,
      _id: entryData._id || Math.random().toString(36).substr(2, 9),
      userId: 'u1',
      date: entryData.date || new Date().toISOString(),
      challengeId: entryData.challengeId || 'none',
      dayNumber: dayNumber || 1,
      createdAt: entryData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: entryData.views || 0,
      status: entryData.status || 'published',
      tags: entryData.tags || [],
    } as LearningEntry;


    const index = entries.findIndex(e => e._id === newEntry._id);
    if (index > -1) {
      entries[index] = newEntry;
    } else {
      entries.unshift(newEntry);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return newEntry;
  },

  deleteEntry: async (id: string): Promise<void> => {
    const entries = await entryService.getEntries();
    const filtered = entries.filter(e => e._id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  getStats: async (): Promise<UserStats> => {
    const entries = await entryService.getEntries();
    const uniqueTopics = new Set(entries.map(e => e.topic)).size;
    const totalMinutes = entries.reduce((acc, e) => {
      return acc + (e.timeSpent.unit === 'hours' ? e.timeSpent.amount * 60 : e.timeSpent.amount);
    }, 0);

    return {
      currentStreak: entries.length > 0 ? 3 : 0, // Simplified streak logic
      longestStreak: 7,
      totalEntriesCreated: entries.length,
      totalHoursLearned: parseFloat((totalMinutes / 60).toFixed(1)),
      topicsCount: uniqueTopics,
      lastEntryDate: entries[0]?.date
    };
  }
};
