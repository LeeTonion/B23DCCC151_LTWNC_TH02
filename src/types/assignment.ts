export type Priority = 'low' | 'medium' | 'high';

export type FilterStatus = 'all' | 'pending' | 'overdue' | 'completed';

export interface Assignment {
  id: string;
  subject: string;
  title: string;
  dueDate: string; // ISO string
  priority: Priority;
  completed: boolean;
  createdAt: string;
}

export interface AssignmentFormData {
  subject: string;
  title: string;
  dueDate: string;
  priority: Priority;
}

export interface AssignmentStats {
  total: number;
  completed: number;
  overdue: number;
  pending: number;
  bySubject: Record<string, { total: number; completed: number; overdue: number }>;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}