import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import type { FilterStatus } from '@/types/assignment';
import { filterAssignments } from '@/lib/utils';

// Base selectors
export const selectAssignments = (state: RootState) => state.assignments.items;
export const selectFilter = (state: RootState) => state.assignments.filter;
export const selectSearchTerm = (state: RootState) => state.assignments.searchTerm;
export const selectAssignmentsStatus = (state: RootState) => state.assignments.status;
export const selectAssignmentsError = (state: RootState) => state.assignments.error;
export const selectAssignmentsStats = (state: RootState) => state.assignments.stats;

// Memoized filtered assignments selector
export const selectFilteredAssignments = createSelector(
  [selectAssignments, selectFilter, selectSearchTerm],
  (assignments, filter, searchTerm) => {
    return filterAssignments(assignments, filter, searchTerm);
  }
);

// Selectors for statistics
export const selectOverdueAssignments = createSelector(
  [selectAssignments],
  (assignments) => assignments.filter((a) => !a.completed && new Date(a.dueDate) < new Date())
);

export const selectPendingAssignments = createSelector(
  [selectAssignments],
  (assignments) => assignments.filter((a) => !a.completed && new Date(a.dueDate) >= new Date())
);

export const selectCompletedAssignments = createSelector(
  [selectAssignments],
  (assignments) => assignments.filter((a) => a.completed)
);

export const selectAssignmentsBySubject = createSelector(
  [selectAssignments],
  (assignments) => {
    const bySubject: Record<string, typeof assignments> = {};
    assignments.forEach((assignment) => {
      if (!bySubject[assignment.subject]) {
        bySubject[assignment.subject] = [];
      }
      bySubject[assignment.subject].push(assignment);
    });
    return bySubject;
  }
);