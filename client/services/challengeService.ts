import { Challenge } from '../types';
import { API_URL } from '../constants';

export const challengeService = {
    getChallenges: async (): Promise<Challenge[]> => {
        const response = await fetch(`${API_URL}/challenges`);
        if (!response.ok) throw new Error('Failed to fetch challenges');
        return response.json();
    },

    getChallengeById: async (id: string): Promise<Challenge | null> => {
        const response = await fetch(`${API_URL}/challenges/${id}`);
        if (!response.ok) return null;
        return response.json();
    },

    saveChallenge: async (challengeData: Partial<Challenge>): Promise<Challenge> => {
        const method = challengeData._id ? 'PUT' : 'POST';
        const url = challengeData._id
            ? `${API_URL}/challenges/${challengeData._id}`
            : `${API_URL}/challenges`;

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(challengeData),
        });

        if (!response.ok) throw new Error('Failed to save challenge');
        return response.json();
    },

    deleteChallenge: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/challenges/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete challenge');
    }
};
