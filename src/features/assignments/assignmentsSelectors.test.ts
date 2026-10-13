import type { RootState } from '@/app/store';
import type { Assignment } from '@/types/assignment';
import {
  selectAssignments,
  selectFilter,
  selectSearchTerm,
  selectAssignmentsStatus,
  selectAssignmentsError,
  selectAssignmentsStats,
  selectFilteredAssignments,
  selectOverdueAssignments,
  selectPendingAssignments,
  selectCompletedAssignments,
  selectAssignmentsBySubject,
} from '@/features/assignments/assignmentsSelectors';

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
    subject: 'Lý',
    title: 'Bài 2',
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    priority: 'medium',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    subject: 'Hóa',
    title: 'Bài 3',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    priority: 'low',
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

const createMockState = (overrides: Partial<RootState> = {}): RootState => ({
  assignments: {
    items: mockAssignments,
    stats: {
      total: 3,
      completed: 1,
      overdue: 1,
      pending: 1,
      bySubject: {
        Toán: { total: 1, completed: 0, overdue: 0 },
        Lý: { total: 1, completed: 0, overdue: 1 },
        Hóa: { total: 1, completed: 1, overdue: 0 },
      },
    },
    status: 'succeeded',
    error: null,
    filter: 'all',
    searchTerm: '',
    ...overrides.assignments,
  },
  ...overrides,
} as RootState);

describe('assignmentsSelectors', () => {
  describe('Base selectors', () => {
    it('selectAssignments should return assignments array', () => {
      const state = createMockState();
      expect(selectAssignments(state)).toEqual(mockAssignments);
    });

    it('selectFilter should return current filter', () => {
      const state = createMockState();
      expect(selectFilter(state)).toBe('all');
    });

    it('selectSearchTerm should return search term', () => {
      const state = createMockState();
      expect(selectSearchTerm(state)).toBe('');
    });

    it('selectAssignmentsStatus should return status', () => {
      const state = createMockState();
      expect(selectAssignmentsStatus(state)).toBe('succeeded');
    });

    it('selectAssignmentsError should return error', () => {
      const state = createMockState();
      expect(selectAssignmentsError(state)).toBeNull();
    });

    it('selectAssignmentsStats should return stats', () => {
      const state = createMockState();
      const stats = selectAssignmentsStats(state);
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(1);
      expect(stats.overdue).toBe(1);
      expect(stats.pending).toBe(1);
    });
  });

  describe('selectFilteredAssignments', () => {
    it('should return all assignments when filter is all and search is empty', () => {
      const state = createMockState();
      const result = selectFilteredAssignments(state);
      expect(result).toHaveLength(3);
    });

    it('should filter by pending status', () => {
      const state = createMockState({
        assignments: { ...createMockState().assignments, filter: 'pending' },
      });
      const result = selectFilteredAssignments(state);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should filter by overdue status', () => {
      const state = createMockState({
        assignments: { ...createMockState().assignments, filter: 'overdue' },
      });
      const result = selectFilteredAssignments(state);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should filter by completed status', () => {
      const state = createMockState({
        assignments: { ...createMockState().assignments, filter: 'completed' },
      });
      const result = selectFilteredAssignments(state);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });

    it('should filter by search term in subject', () => {
      const state = createMockState({
        assignments: { ...createMockState().assignments, searchTerm: 'Toán' },
      });
      const result = selectFilteredAssignments(state);
      expect(result).toHaveLength(1);
      expect(result[0].subject).toBe('Toán');
    });

    it('should filter by search term in title', () => {
      const state = createMockState({
        assignments: { ...createMockState().assignments, searchTerm: 'Bài 2' },
      });
      const result = selectFilteredAssignments(state);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Bài 2');
    });

    it('should return empty array when no matches', () => {
      const state = createMockState({
        assignments: { ...createMockState().assignments, searchTerm: 'Không tồn tại' },
      });
      const result = selectFilteredAssignments(state);
      expect(result).toHaveLength(0);
    });

    it('should combine filter and search', () => {
      const state = createMockState({
        assignments: { 
          ...createMockState().assignments, 
          filter: 'pending',
          searchTerm: 'Toán',
        },
      });
      const result = selectFilteredAssignments(state);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });

  describe('selectOverdueAssignments', () => {
    it('should return overdue assignments', () => {
      const state = createMockState();
      const result = selectOverdueAssignments(state);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should not return completed assignments even if overdue', () => {
      const overdueCompleted: Assignment = {
        id: '4',
        subject: 'Sinh',
        title: 'Bài 4',
        dueDate: new Date(Date.now() - 86400000).toISOString(),
        priority: 'high',
        completed: true,
        createdAt: new Date().toISOString(),
      };
      const state = createMockState({
        assignments: { ...createMockState().assignments, items: [...mockAssignments, overdueCompleted] },
      });
      const result = selectOverdueAssignments(state);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });
  });

  describe('selectPendingAssignments', () => {
    it('should return pending assignments', () => {
      const state = createMockState();
      const result = selectPendingAssignments(state);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should not return completed assignments', () => {
      const state = createMockState();
      const result = selectPendingAssignments(state);
      expect(result.find(a => a.completed)).toBeUndefined();
    });

    it('should not return overdue assignments', () => {
      const state = createMockState();
      const result = selectPendingAssignments(state);
      expect(result.find(a => new Date(a.dueDate) < new Date())).toBeUndefined();
    });
  });

  describe('selectCompletedAssignments', () => {
    it('should return completed assignments', () => {
      const state = createMockState();
      const result = selectCompletedAssignments(state);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
    });
  });

  describe('selectAssignmentsBySubject', () => {
    it('should group assignments by subject', () => {
      const state = createMockState();
      const result = selectAssignmentsBySubject(state);
      
      expect(result['Toán']).toHaveLength(1);
      expect(result['Lý']).toHaveLength(1);
      expect(result['Hóa']).toHaveLength(1);
    });

    it('should handle empty assignments', () => {
      const state = createMockState({
        assignments: { ...createMockState().assignments, items: [] },
      });
      const result = selectAssignmentsBySubject(state);
      expect(result).toEqual({});
    });

    it('should group multiple assignments for same subject', () => {
      const extraAssignment = {
        id: '4',
        subject: 'Toán',
        title: 'Bài 4',
        dueDate: new Date().toISOString(),
        priority: 'medium',
        completed: false,
        createdAt: new Date().toISOString(),
      };
      const state = createMockState({
        assignments: { ...createMockState().assignments, items: [...mockAssignments, extraAssignment] },
      });
      const result = selectAssignmentsBySubject(state);
      expect(result['Toán']).toHaveLength(2);
    });
  });
});