
import { Challenge, Category } from '../types';

const STORAGE_KEY = 'devlog_challenges';

export const challengeService = {
    getChallenges: async (): Promise<Challenge[]> => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    getChallengeById: async (id: string): Promise<Challenge | null> => {
        const challenges = await challengeService.getChallenges();
        return challenges.find(c => c._id === id) || null;
    },

    saveChallenge: async (challengeData: Partial<Challenge>): Promise<Challenge> => {
        const challenges = await challengeService.getChallenges();
        const newChallenge: Challenge = {
            ...challengeData,
            _id: challengeData._id || Math.random().toString(36).substr(2, 9),
            userId: 'u1',
            createdAt: challengeData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: challengeData.status || 'active',
        } as Challenge;

        const index = challenges.findIndex(c => c._id === newChallenge._id);
        if (index > -1) {
            challenges[index] = newChallenge;
        } else {
            challenges.unshift(newChallenge);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
        return newChallenge;
    },

    deleteChallenge: async (id: string): Promise<void> => {
        const challenges = await challengeService.getChallenges();
        const filtered = challenges.filter(c => c._id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

        // Cascading delete of entries is handled in entryService or here?
        // Let's implement a helper in entryService and call it here if possible, 
        // or just do it here since both use localStorage.
        const entriesData = localStorage.getItem('devlog_entries');
        if (entriesData) {
            const entries = JSON.parse(entriesData);
            const filteredEntries = entries.filter((e: any) => e.challengeId !== id);
            localStorage.setItem('devlog_entries', JSON.stringify(filteredEntries));
        }
    }
};
