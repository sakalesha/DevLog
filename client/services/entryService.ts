import { LearningEntry, UserStats } from '../types';
import { apiClient } from './apiClient';

export const entryService = {
  getEntries: (): Promise<LearningEntry[]> =>
    apiClient.get<LearningEntry[]>('/entries'),

  getEntryById: (id: string): Promise<LearningEntry | null> =>
    apiClient.get<LearningEntry>(`/entries/${id}`).catch(() => null),

  saveEntry: (entryData: Partial<LearningEntry>): Promise<LearningEntry> => {
    if (entryData._id) {
      return apiClient.put<LearningEntry>(`/entries/${entryData._id}`, entryData);
    }
    return apiClient.post<LearningEntry>('/entries', entryData);
  },

  deleteEntry: (id: string): Promise<void> =>
    apiClient.delete(`/entries/${id}`),

  getStats: (): Promise<UserStats> =>
    apiClient.get<UserStats>('/entries/stats'),
};
