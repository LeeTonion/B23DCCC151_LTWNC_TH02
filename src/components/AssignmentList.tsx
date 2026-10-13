'use client';

import React, { useMemo, useCallback, Suspense, lazy } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import type { Assignment } from '@/types/assignment';
import AssignmentCard from './AssignmentCard';
import { filterAssignments } from '@/lib/utils';
import { usePinStore } from '@/features/pins/pinStore';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleComplete, deleteAssignment } from '@/features/assignments/assignmentsSlice';

// Virtualized Assignment Item
const VirtualizedAssignmentItem = React.memo(function VirtualizedAssignmentItem({
  index,
  style,
  data,
}: ListChildComponentProps<{ assignments: Assignment[]; onToggleComplete: (id: string) => void; onDelete: (id: string) => void; onTogglePin: (id: string) => void; pinnedIds: string[] }>) {
  const { assignments, onToggleComplete, onDelete, onTogglePin, pinnedIds } = data;
  const assignment = assignments[index];
  const isPinned = pinnedIds.includes(assignment.id);

  return (
    <div style={style}>
      <AssignmentCard
        assignment={assignment}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
        onTogglePin={onTogglePin}
        isPinned={isPinned}
      />
    </div>
  );
});

VirtualizedAssignmentItem.displayName = 'VirtualizedAssignmentItem';

interface AssignmentListProps {
  assignments: Assignment[];
  isLoading?: boolean;
  error?: string | null;
}

export default function AssignmentList({ assignments, isLoading, error }: AssignmentListProps) {
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.assignments.filter);
  const searchTerm = useAppSelector((state) => state.assignments.searchTerm);
  const { pinnedIds, togglePin } = usePinStore();

  const filteredAndSortedAssignments = useMemo(
    () => filterAssignments(assignments, filter, searchTerm, pinnedIds),
    [assignments, filter, searchTerm, pinnedIds]
  );

  const handleToggleComplete = useCallback((id: string) => {
    dispatch(toggleComplete(id));
  }, [dispatch]);

  const handleDelete = useCallback((id: string) => {
    dispatch(deleteAssignment(id));
  }, [dispatch]);

  const handleTogglePin = useCallback((id: string) => {
    togglePin(id);
  }, [togglePin]);

  if (isLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="Đang tải danh sách bài tập">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500" role="alert">
        <p>Lỗi: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-blue-600 hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (filteredAndSortedAssignments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400" role="status">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <p className="text-lg font-medium">Không có bài tập nào</p>
        <p className="text-sm mt-1">Thêm bài tập mới hoặc thay đổi bộ lọc</p>
      </div>
    );
  }

  const itemData = useMemo(
    () => ({
      assignments: filteredAndSortedAssignments,
      onToggleComplete: handleToggleComplete,
      onDelete: handleDelete,
      onTogglePin: handleTogglePin,
      pinnedIds,
    }),
    [filteredAndSortedAssignments, handleToggleComplete, handleDelete, handleTogglePin, pinnedIds]
  );

  const ItemRenderer = useCallback(
    ({ index, style }: ListChildComponentProps<typeof itemData>) => (
      <VirtualizedAssignmentItem index={index} style={style} data={itemData} />
    ),
    [itemData]
  );

  // Use virtualization for large lists (> 100 items)
  const useVirtualization = filteredAndSortedAssignments.length > 100;

  if (useVirtualization) {
    return (
      <div className="h-[600px] overflow-auto" role="list" aria-label="Danh sách bài tập">
        <List
          height={600}
          itemCount={filteredAndSortedAssignments.length}
          itemSize={140}
          itemData={itemData}
          width="100%"
          overscanCount={5}
        >
          {ItemRenderer}
        </List>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="list" aria-label="Danh sách bài tập">
      {filteredAndSortedAssignments.map((assignment, index) => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDelete}
          onTogglePin={handleTogglePin}
          isPinned={pinnedIds.includes(assignment.id)}
        />
      ))}
    </div>
  );
}