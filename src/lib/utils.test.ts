import { isOverdue, calcDaysLeft, calcStats, filterAssignments } from '@/lib/utils';
import type { Assignment } from '@/types/assignment';

describe('Utility Functions', () => {
  describe('isOverdue', () => {
    it('should return true for past due date and not completed', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString(); // 1 day ago
      expect(isOverdue(pastDate, false)).toBe(true);
    });

    it('should return false for future due date', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // 1 day from now
      expect(isOverdue(futureDate, false)).toBe(false);
    });

    it('should return false for completed assignment regardless of due date', () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString();
      expect(isOverdue(pastDate, true)).toBe(false);
    });

    it('should return false for today due date', () => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      expect(isOverdue(today.toISOString(), false)).toBe(false);
    });
  });

  describe('calcDaysLeft', () => {
    it('should return positive number for future date', () => {
      const futureDate = new Date(Date.now() + 3 * 86400000).toISOString(); // 3 days from now
      expect(calcDaysLeft(futureDate)).toBe(3);
    });

    it('return negative number for past date', () => {
      const pastDate = new Date(Date.now() - 2 * 86400000).toISOString(); // 2 days ago
      expect(calcDaysLeft(pastDate)).toBe(-2);
    });

    it('should return 0 for today', () => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      expect(calcDaysLeft(today.toISOString())).toBe(0);
    });
  });

  describe('calcStats', () => {
    const mockAssignments: Assignment[] = [
      {
        id: '1',
        subject: 'Toán',
        title: 'Bài 1',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: 'high',
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        subject: 'Toán',
        title: 'Bài 2',
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        priority: 'medium',
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        subject: 'Lý',
        title: 'Bài 3',
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        priority: 'low',
        completed: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        subject: 'Lý',
        title: 'Bài 4',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: 'high',
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];

    it('should calculate correct stats', () => {
      const stats = calcStats(mockAssignments);
      expect(stats.total).toBe(4);
      expect(stats.completed).toBe(1);
      expect(stats.overdue).toBe(1);
      expect(stats.pending).toBe(2);
    });

    it('should calculate correct bySubject stats', () => {
      const stats = calcStats(mockAssignments);
      expect(stats.bySubject['Toán'].total).toBe(2);
      expect(stats.bySubject['Toán'].completed).toBe(0);
      expect(stats.bySubject['Toán'].overdue).toBe(1);
      expect(stats.bySubject['Lý'].total).toBe(2);
      expect(stats.bySubject['Lý'].completed).toBe(1);
      expect(stats.bySubject['Lý'].overdue).toBe(0);
    });

    it('should handle empty array', () => {
      const stats = calcStats([]);
      expect(stats.total).toBe(0);
      expect(stats.completed).toBe(0);
      expect(stats.overdue).toBe(0);
      expect(stats.pending).toBe(0);
      expect(stats.bySubject).toEqual({});
    });
  });

  describe('filterAssignments', () => {
    const mockAssignments: Assignment[] = [
      {
        id: '1',
        subject: 'Toán',
        title: 'Bài tập Toán',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        priority: 'high',
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        subject: 'Lý',
        title: 'Bài tập Lý',
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        priority: 'medium',
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        subject: 'Hóa',
        title: 'Bài tập Hóa',
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        priority: 'low',
        completed: true,
        createdAt: new Date().toISOString(),
      },
    ];

    it('should return all assignments for "all" filter', () => {
      const result = filterAssignments(mockAssignments, 'all', '');
      expect(result).toHaveLength(3);
    });

    it('should filter pending assignments', () => {
      const result = filterAssignments(mockAssignments, 'pending', '');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should filter overdue assignments', () => {
      const result = filterAssignments(mockAssignments, 'overdue', '');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should filter completed assignments', () => {
      const result = filterAssignments(mockAssignments, 'completed', '');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('should filter by search term', () => {
      const result = filterAssignments(mockAssignments, 'all', 'Toán');
      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('Toán');
    });

    it('should filter by search term in title', () => {
      const result = filterAssignments(mockAssignments, 'all', 'Lý');
      expect(result).toHaveLength(1);
      expect(result[0].title).toContain('Lý');
    });

    it('should combine filter and search', () => {
      const result = filterAssignments(mockAssignments, 'pending', 'Toán');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return empty array when no matches', () => {
      const result = filterAssignments(mockAssignments, 'completed', 'Không tồn tại');
      expect(result).toHaveLength(0);
    });
  });
});