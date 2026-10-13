import assignmentsReducer, {
  addAssignment,
  deleteAssignment,
  toggleComplete,
  setFilter,
  setSearchTerm,
  addSampleAssignments,
  clearAll,
} from '@/features/assignments/assignmentsSlice';
import type { AssignmentFormData } from '@/types/assignment';

describe('assignmentsSlice reducer', () => {
  const initialState = {
    items: [],
    stats: {
      total: 0,
      completed: 0,
      overdue: 0,
      pending: 0,
      bySubject: {},
    },
    status: 'idle' as const,
    error: null,
    filter: 'all' as const,
    searchTerm: '',
  };

  const sampleAssignment: AssignmentFormData = {
    subject: 'Toán',
    title: 'Bài tập 1',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    priority: 'high',
  };

  describe('addAssignment', () => {
    it('should add assignment to empty state', () => {
      const state = assignmentsReducer(initialState, addAssignment(sampleAssignment));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].subject).toBe('Toán');
      expect(state.items[0].completed).toBe(false);
      expect(state.stats.total).toBe(1);
    });

    it('should add assignment to existing state', () => {
      const stateWithOne = assignmentsReducer(initialState, addAssignment(sampleAssignment));
      const secondAssignment: AssignmentFormData = {
        ...sampleAssignment,
        subject: 'Lý',
        title: 'Bài tập 2',
      };
      const state = assignmentsReducer(stateWithOne, addAssignment(secondAssignment));
      expect(state.items).toHaveLength(2);
      expect(state.stats.total).toBe(2);
    });

    it('should generate unique IDs', () => {
      const state1 = assignmentsReducer(initialState, addAssignment(sampleAssignment));
      const state2 = assignmentsReducer(state1, addAssignment({ ...sampleAssignment, title: 'Bài 2' }));
      expect(state2.items[0].id).not.toBe(state2.items[1].id);
    });
  });

  describe('deleteAssignment', () => {
    it('should remove assignment by id', () => {
      const stateWithOne = assignmentsReducer(initialState, addAssignment(sampleAssignment));
      const id = stateWithOne.items[0].id;
      const state = assignmentsReducer(stateWithOne, deleteAssignment(id));
      expect(state.items).toHaveLength(0);
      expect(state.stats.total).toBe(0);
    });

    it('should not affect other assignments', () => {
      const state1 = assignmentsReducer(initialState, addAssignment(sampleAssignment));
      const id1 = state1.items[0].id;
      const state2 = assignmentsReducer(state1, addAssignment({ ...sampleAssignment, subject: 'Lý', title: 'Bài 2' }));
      const state = assignmentsReducer(state2, deleteAssignment(id1));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].subject).toBe('Lý');
    });

    it('should handle deleting non-existent id', () => {
      const stateWithOne = assignmentsReducer(initialState, addAssignment(sampleAssignment));
      const state = assignmentsReducer(stateWithOne, deleteAssignment('non-existent-id'));
      expect(state.items).toHaveLength(1);
    });
  });

  describe('toggleComplete', () => {
    it('should toggle completed from false to true', () => {
      const stateWithOne = assignmentsReducer(initialState, addAssignment(sampleAssignment));
      const id = stateWithOne.items[0].id;
      const state = assignmentsReducer(stateWithOne, toggleComplete(id));
      expect(state.items[0].completed).toBe(true);
      expect(state.stats.completed).toBe(1);
      expect(state.stats.pending).toBe(0);
    });

    it('should toggle completed from true to false', () => {
      const stateWithOne = assignmentsReducer(initialState, addAssignment(sampleAssignment));
      const id = stateWithOne.items[0].id;
      let state = assignmentsReducer(stateWithOne, toggleComplete(id));
      expect(state.items[0].completed).toBe(true);
      state = assignmentsReducer(state, toggleComplete(id));
      expect(state.items[0].completed).toBe(false);
      expect(state.stats.completed).toBe(0);
      expect(state.stats.pending).toBe(1);
    });

    it('should not affect other assignments', () => {
      const state1 = assignmentsReducer(initialState, addAssignment(sampleAssignment));
      const id1 = state1.items[0].id;
      const state2 = assignmentsReducer(state1, addAssignment({ ...sampleAssignment, subject: 'Lý', title: 'Bài 2' }));
      const state = assignmentsReducer(state2, toggleComplete(id1));
      expect(state.items[0].completed).toBe(true);
      expect(state.items[1].completed).toBe(false);
    });
  });

  describe('setFilter', () => {
    it('should set filter to pending', () => {
      const state = assignmentsReducer(initialState, setFilter('pending'));
      expect(state.filter).toBe('pending');
    });

    it('should set filter to overdue', () => {
      const state = assignmentsReducer(initialState, setFilter('overdue'));
      expect(state.filter).toBe('overdue');
    });

    it('should set filter to completed', () => {
      const state = assignmentsReducer(initialState, setFilter('completed'));
      expect(state.filter).toBe('completed');
    });

    it('should set filter to all', () => {
      const state = assignmentsReducer(initialState, setFilter('all'));
      expect(state.filter).toBe('all');
    });
  });

  describe('setSearchTerm', () => {
    it('should set search term', () => {
      const state = assignmentsReducer(initialState, setSearchTerm('Toán'));
      expect(state.searchTerm).toBe('Toán');
    });

    it('should clear search term', () => {
      const stateWithSearch = assignmentsReducer(initialState, setSearchTerm('Toán'));
      const state = assignmentsReducer(stateWithSearch, setSearchTerm(''));
      expect(state.searchTerm).toBe('');
    });
  });

  describe('addSampleAssignments', () => {
    it('should add multiple assignments at once', () => {
      const assignments = [
        { ...sampleAssignment, id: '1', completed: false, createdAt: new Date().toISOString() },
        { ...sampleAssignment, id: '2', subject: 'Lý', title: 'Bài 2', completed: true, createdAt: new Date().toISOString() },
      ];
      const state = assignmentsReducer(initialState, addSampleAssignments(assignments));
      expect(state.items).toHaveLength(2);
      expect(state.stats.total).toBe(2);
      expect(state.stats.completed).toBe(1);
    });
  });

  describe('clearAll', () => {
    it('should clear all assignments', () => {
      const state1 = assignmentsReducer(initialState, addAssignment(sampleAssignment));
      const state = assignmentsReducer(state1, clearAll());
      expect(state.items).toHaveLength(0);
      expect(state.stats.total).toBe(0);
      expect(state.stats.completed).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple rapid toggles', () => {
      const state1 = assignmentsReducer(initialState, addAssignment(sampleAssignment));
      const id = state1.items[0].id;
      
      // Toggle 10 times rapidly
      let state = state1;
      for (let i = 0; i < 10; i++) {
        state = assignmentsReducer(state, toggleComplete(id));
      }
      
      // Should end up as original (false) since 10 is even
      expect(state.items[0].completed).toBe(false);
    });

    it('should maintain correct stats after complex operations', () => {
      let state = initialState;
      
      // Add 3 assignments
      state = assignmentsReducer(state, addAssignment({ ...sampleAssignment, title: 'Bài 1' }));
      state = assignmentsReducer(state, addAssignment({ ...sampleAssignment, subject: 'Lý', title: 'Bài 2' }));
      state = assignmentsReducer(state, addAssignment({ ...sampleAssignment, subject: 'Hóa', title: 'Bài 3' }));
      
      expect(state.stats.total).toBe(3);
      expect(state.stats.pending).toBe(3);
      
      // Complete one
      const id1 = state.items[0].id;
      state = assignmentsReducer(state, toggleComplete(id1));
      expect(state.stats.completed).toBe(1);
      expect(state.stats.pending).toBe(2);
      
      // Delete one pending
      const id2 = state.items[1].id;
      state = assignmentsReducer(state, deleteAssignment(id2));
      expect(state.stats.total).toBe(2);
      expect(state.stats.completed).toBe(1);
      expect(state.stats.pending).toBe(1);
    });
  });
});