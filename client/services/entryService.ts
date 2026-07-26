import { LearningEntry, UserStats } from '../types';
import { API_URL } from '../constants';

const getHeaders = () => {
  const userStr = localStorage.getItem('user');
  let token = '';
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      token = user.token;
    } catch (e) {
      console.error('Error parsing user token', e);
    }
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const entryService = {
  getEntries: async (): Promise<LearningEntry[]> => {
    const response = await fetch(`${API_URL}/entries`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch entries');
    return response.json();
  },

  getEntryById: async (id: string): Promise<LearningEntry | null> => {
    const response = await fetch(`${API_URL}/entries/${id}`, {
      headers: getHeaders()
    });
    if (!response.ok) return null;
    return response.json();
  },

  saveEntry: async (entryData: Partial<LearningEntry>): Promise<LearningEntry> => {
    const method = entryData._id ? 'PUT' : 'POST';
    const url = entryData._id
      ? `${API_URL}/entries/${entryData._id}`
      : `${API_URL}/entries`;

    const response = await fetch(url, {
      method,
      headers: getHeaders(),
      body: JSON.stringify(entryData),
    });

    if (!response.ok) throw new Error('Failed to save entry');
    return response.json();
  },

  deleteEntry: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/entries/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete entry');
  },

  getStats: async (): Promise<UserStats> => {
    const response = await fetch(`${API_URL}/entries/stats`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  }
};
