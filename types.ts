
export type Category = 
  | 'DSA' 
  | 'Java' 
  | 'JavaScript' 
  | 'React' 
  | 'Backend' 
  | 'Frontend' 
  | 'Database' 
  | 'System Design' 
  | 'AI/ML' 
  | 'Other';

export interface TimeSpent {
  amount: number;
  unit: 'minutes' | 'hours';
}

export interface LearningEntry {
  _id: string;
  userId: string;
  date: string;
  topic: string;
  category: Category;
  content: string;
  keyTakeaway: string;
  doubts?: string;
  timeSpent: TimeSpent;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalEntriesCreated: number;
  totalHoursLearned: number;
  topicsCount: number;
  lastEntryDate?: string;
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  stats: UserStats;
}

export interface AppState {
  user: User | null;
  entries: LearningEntry[];
  isLoading: boolean;
  error: string | null;
}
