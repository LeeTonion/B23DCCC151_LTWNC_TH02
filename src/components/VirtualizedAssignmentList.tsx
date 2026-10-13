import { useMemo } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { AssignmentCard } from './AssignmentCard';
import type { Assignment } from '@/types/assignment';
import { usePinStore } from '@/features/pins/pinStore';
import { filterAssignments } from '@/lib/utils';

interface VirtualizedAssignmentListProps {
  assignments: Assignment[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
}

const ITEM_HEIGHT = 160;

function AssignmentCardWrapper({
  index,
  style,
  data,
}: ListChildComponentProps<{
  assignments: Assignment[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  pinnedIds: string[];
}>) {
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
}

export function VirtualizedAssignmentList({
  assignments,
  onToggleComplete,
  onDelete,
  onTogglePin,
}: VirtualizedAssignmentListProps) {
  const { pinnedIds } = usePinStore();

  const sortedAssignments = useMemo(() => {
    return filterAssignments(assignments, 'all', '', pinnedIds);
  }, [assignments, pinnedIds]);

  if (sortedAssignments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <p className="text-lg font-medium">Không có bài tập nào</p>
        <p className="mt-1">Thêm bài tập mới hoặc thay đổi bộ lọc</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <AutoSizer disableHeight>
        {({ width }) => (
          <List
            height={600}
            itemCount={sortedAssignments.length}
            itemSize={ITEM_HEIGHT}
            width={width}
            itemData={{
              assignments: sortedAssignments,
              onToggleComplete,
              onDelete,
              onTogglePin,
              pinnedIds,
            }}
            overscanCount={5}
          >
            {AssignmentCardWrapper}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}