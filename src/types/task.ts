export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

export type TaskPriority = 'p1_critical' | 'p2_high' | 'p3_medium' | 'p4_low';

export type EisenhowerQuadrant = 'q1_do' | 'q2_schedule' | 'q3_delegate' | 'q4_eliminate';

export type Language = 'en' | 'es';

export type Theme = 'light' | 'dark';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
}

export interface Task {
  id: string;
  title: string;
  category: string;
  status: TaskStatus;
  priority: TaskPriority;
  quadrant: EisenhowerQuadrant;
  dueDate?: string;
  estimatedDuration?: string;
  notes?: string;
  subtasks: Subtask[];
  tags: string[];
  rationale?: string;
  nextImmediateStep?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  color: string;
  badgeBg?: string;
  description: string;
}

export interface AppBackupData {
  version: number;
  exportedAt: string;
  tasks: Task[];
  categories: CategoryInfo[];
}

