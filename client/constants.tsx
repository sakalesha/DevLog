
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
  HelpCircle,
  Folder,
  Server,
  Cloud,
  Shield,
  Smartphone,
  BookOpen
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, import('lucide-react').LucideIcon> = {
  'DSA': Terminal,
  'Java': Coffee,
  'JavaScript': Code2,
  'TypeScript': Code2,
  'React': Layout,
  'Backend': Layers,
  'Frontend': Globe,
  'Database': Database,
  'System Design': Cpu,
  'AI/ML': BrainCircuit,
  'DevOps': Cloud,
  'Cloud': Cloud,
  'Security': Shield,
  'Mobile': Smartphone,
  'General': BookOpen,
  'Other': HelpCircle
};

export const getCategoryIcon = (name?: string): import('lucide-react').LucideIcon => {
  if (!name) return Folder;
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }
  return Folder;
};

export const COLORS = {
  primary: '#92400E',
  secondary: '#A16207',
  accent: '#6366F1',
  danger: '#DC2626',
  textDark: '#0F172A',
  textLight: '#F8FAFC',
};

// Sanitize API_URL to remove trailing slash if present
export const API_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
