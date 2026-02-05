
import React from 'react';
import {
  Code2,
  Database,
  Cpu,
  Globe,
  BrainCircuit,
  Coffee,
  Terminal,
  Layers,
  Layout,
  HelpCircle
} from 'lucide-react';
import { Category } from './types';

export const CATEGORIES: Category[] = [
  'DSA', 'Java', 'JavaScript', 'React', 'Backend', 'Frontend', 'Database', 'System Design', 'AI/ML', 'Other'
];

export const CATEGORY_ICONS: Record<Category, import('lucide-react').LucideIcon> = {
  'DSA': Terminal,
  'Java': Coffee,
  'JavaScript': Code2,
  'React': Layout,
  'Backend': Layers,
  'Frontend': Globe,
  'Database': Database,
  'System Design': Cpu,
  'AI/ML': BrainCircuit,
  'Other': HelpCircle
};

export const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  textDark: '#1F2937',
  textLight: '#F5F5F5',
};

// Sanitize API_URL to remove trailing slash if present
export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
