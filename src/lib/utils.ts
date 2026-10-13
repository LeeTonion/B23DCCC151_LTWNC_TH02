import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Assignment, FilterStatus } from '@/types/assignment';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calcDaysLeft(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: string, completed: boolean): boolean {
  if (completed) return false;
  return calcDaysLeft(dueDate) < 0;
}

export function getDaysLeftText(dueDate: string, completed: boolean): { text: string; className: string } {
  if (completed) {
    return { text: 'Đã hoàn thành', className: 'text-green-600 dark:text-green-400' };
  }
  const days = calcDaysLeft(dueDate);
  if (days < 0) {
    return { text: `Quá hạn ${Math.abs(days)} ngày`, className: 'text-red-600 dark:text-red-400 font-medium' };
  }
  if (days === 0) {
    return { text: 'Hôm nay', className: 'text-orange-600 dark:text-orange-400 font-medium' };
  }
  return { text: `Còn ${days} ngày`, className: 'text-blue-600 dark:text-blue-400' };
}

export function getPriorityClass(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'low':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  }
}

export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'high':
      return 'Cao';
    case 'medium':
      return 'Trung bình';
    case 'low':
      return 'Thấp';
    default:
      return priority;
  }
}

export function calcStats(assignments: Assignment[]): {
  total: number;
  completed: number;
  overdue: number;
  pending: number;
  bySubject: Record<string, { total: number; completed: number; overdue: number }>;
} {
  const stats = {
    total: assignments.length,
    completed: 0,
    overdue: 0,
    pending: 0,
    bySubject: {} as Record<string, { total: number; completed: number; overdue: number }>,
  };

  assignments.forEach((assignment) => {
    if (assignment.completed) {
      stats.completed++;
    } else if (isOverdue(assignment.dueDate, false)) {
      stats.overdue++;
    } else {
      stats.pending++;
    }

    if (!stats.bySubject[assignment.subject]) {
      stats.bySubject[assignment.subject] = { total: 0, completed: 0, overdue: 0 };
    }
    stats.bySubject[assignment.subject].total++;
    if (assignment.completed) {
      stats.bySubject[assignment.subject].completed++;
    } else if (isOverdue(assignment.dueDate, false)) {
      stats.bySubject[assignment.subject].overdue++;
    }
  });

  return stats;
}

export function filterAssignments(
  assignments: Assignment[],
  filter: FilterStatus,
  searchTerm: string,
  pinnedIds: string[] = []
): Assignment[] {
  let filtered = [...assignments];

  // Apply status filter
  switch (filter) {
    case 'pending':
      filtered = filtered.filter((a) => !a.completed && !isOverdue(a.dueDate, false));
      break;
    case 'overdue':
      filtered = filtered.filter((a) => !a.completed && isOverdue(a.dueDate, false));
      break;
    case 'completed':
      filtered = filtered.filter((a) => a.completed);
      break;
    default:
      break;
  }

  // Apply search
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(
      (a) =>
        a.subject.toLowerCase().includes(term) ||
        a.title.toLowerCase().includes(term)
    );
  }

  // Sort: pinned first, then by due date
  filtered.sort((a, b) => {
    const aPinned = pinnedIds.includes(a.id);
    const bPinned = pinnedIds.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return filtered;
}