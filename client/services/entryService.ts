import { LearningEntry, UserStats } from '../types';
import { API_URL } from '../constants';

export const entryService = {
  getEntries: async (): Promise<LearningEntry[]> => {
    const response = await fetch(`${API_URL}/entries`);
    if (!response.ok) throw new Error('Failed to fetch entries');
    return response.json();
  },

  getEntryById: async (id: string): Promise<LearningEntry | null> => {
    const response = await fetch(`${API_URL}/entries/${id}`);
    if (!response.ok) return null;
    return response.json();
  },

  saveEntry: async (entryData: Partial<LearningEntry>): Promise<LearningEntry> => {
    // Client-side auto-increment logic for dayNumber
    if (!entryData._id && !entryData.dayNumber && entryData.challengeId && entryData.challengeId !== 'none') {
      const allEntries = await entryService.getEntries();
      const challengeEntries = allEntries.filter(e => e.challengeId === entryData.challengeId);
      entryData.dayNumber = challengeEntries.length + 1;
    }

    const method = entryData._id ? 'PUT' : 'POST';
    const url = entryData._id
      ? `${API_URL}/entries/${entryData._id}`
      : `${API_URL}/entries`;

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entryData),
    });

    if (!response.ok) throw new Error('Failed to save entry');
    return response.json();
  },

  deleteEntry: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/entries/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete entry');
  },

  getStats: async (): Promise<UserStats> => {
    const response = await fetch(`${API_URL}/entries/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  }
};
