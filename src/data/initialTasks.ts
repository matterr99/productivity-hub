import { Task, CategoryInfo } from '../types/task';

export const INITIAL_CATEGORIES: CategoryInfo[] = [
  {
    id: 'GENERAL',
    name: 'General & Operations',
    color: '#2563EB', // Blue
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Corporate filings, registrations, logistics, communications & administrative tasks',
  },
  {
    id: 'WEB DEVELOPMENT',
    name: 'Web & Tech',
    color: '#7C3AED', // Indigo/Purple
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Website redesign, AI Studio features, client portal & tech projects',
  },
  {
    id: 'PERSONAL',
    name: 'Personal & Errands',
    color: '#D97706', // Amber/Orange
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    description: 'Personal errands, appointments, vehicle maintenance & planning',
  },
  {
    id: 'MARKETING',
    name: 'Marketing & Sales',
    color: '#DB2777', // Pink/Rose
    badgeBg: 'bg-pink-50 text-pink-700 border-pink-200',
    description: 'Social presence, campaigns, client showcase & direct outreach',
  },
];

export const INITIAL_TASKS: Task[] = [];
