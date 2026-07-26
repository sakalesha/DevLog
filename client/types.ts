
export interface Category {
  _id: string;
  userId: string;
  name: string;
  parentId: string | null;
  color?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryTreeNode extends Category {
  children?: CategoryTreeNode[];
}

export interface TimeSpent {
  amount: number;
  unit: 'minutes' | 'hours';
}

export interface LearningEntry {
  _id: string;
  userId: string;
  date: string;
  topic: string;
  category: string;
  categoryId?: string;
  categoryPath?: string[];
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
  name: string;
  email: string;
  avatar?: string;
  token?: string;
}

export interface AppState {
  user: User | null;
  entries: LearningEntry[];
  isLoading: boolean;
  error: string | null;
}
