
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

export const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  'DSA': <Terminal className="w-5 h-5" />,
  'Java': <Coffee className="w-5 h-5" />,
  'JavaScript': <Code2 className="w-5 h-5" />,
  'React': <Layout className="w-5 h-5" />,
  'Backend': <Layers className="w-5 h-5" />,
  'Frontend': <Globe className="w-5 h-5" />,
  'Database': <Database className="w-5 h-5" />,
  'System Design': <Cpu className="w-5 h-5" />,
  'AI/ML': <BrainCircuit className="w-5 h-5" />,
  'Other': <HelpCircle className="w-5 h-5" />
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
