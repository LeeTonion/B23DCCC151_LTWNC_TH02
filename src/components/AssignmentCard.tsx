import { memo, useCallback } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { usePinStore } from '@/features/pins/pinStore';
import { toggleComplete, deleteAssignment } from '@/features/assignments/assignmentsSlice';
import type { Assignment } from '@/types/assignment';
import { formatDate, getDaysLeftText, getPriorityClass, getPriorityLabel, cn } from '@/lib/utils';

interface AssignmentCardProps {
  assignment: Assignment;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  isPinned: boolean;
}

export const AssignmentCard = memo(function AssignmentCard({
  assignment,
  onToggleComplete,
  onDelete,
  onTogglePin,
  isPinned,
}: AssignmentCardProps) {
  const dispatch = useAppDispatch();
  const { text: daysLeftText, className: daysLeftClass } = getDaysLeftText(assignment.dueDate, assignment.completed);
  const isOverdue = daysLeftText.startsWith('Quá hạn');

  const handleToggleComplete = useCallback(() => {
    onToggleComplete(assignment.id);
  }, [onToggleComplete, assignment.id]);

  const handleDelete = useCallback(() => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài tập này?')) {
      onDelete(assignment.id);
    }
  }, [onDelete, assignment.id]);

  const handleTogglePin = useCallback(() => {
    onTogglePin(assignment.id);
  }, [onTogglePin, assignment.id]);

  return (
    <article
      className={cn(
        'relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 transition-all duration-200',
        'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600',
        isPinned && 'ring-2 ring-yellow-400 dark:ring-yellow-500 border-yellow-300 dark:border-yellow-600',
        assignment.completed && 'opacity-60 bg-gray-50 dark:bg-gray-800/50'
      )}
      style={{ borderLeft: isPinned ? '4px solid #fbbf24' : 'none' }}
    >
      {isPinned && (
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
          📌 Ghim
        </span>
      )}

      <div className="flex items-start gap-4">
        <button
          onClick={handleToggleComplete}
          className={cn(
            'mt-1 w-5 h-5 rounded border-2 flex-shrink-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
            assignment.completed
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-400'
          )}
          aria-label={assignment.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
          aria-pressed={assignment.completed}
        >
          {assignment.completed && (
            <svg className="w-4 h-4 mx-auto my-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={cn(
                'text-xs font-medium px-2 py-1 rounded-full',
                getPriorityClass(assignment.priority)
              )}
            >
              {getPriorityLabel(assignment.priority)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {formatDate(assignment.dueDate)}
            </span>
          </div>

          <h3 className={cn('font-medium text-gray-900 dark:text-gray-100 truncate', assignment.completed && 'line-through text-gray-500 dark:text-gray-400')}>
            {assignment.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{assignment.subject}</p>

          <div className="mt-3 flex items-center gap-3">
            <span className={cn('text-sm font-medium', daysLeftClass)}>{daysLeftText}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleTogglePin}
            className={cn(
              'p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
              isPinned
                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            aria-label={isPinned ? 'Bỏ ghim bài tập' : 'Ghim bài tập'}
            aria-pressed={isPinned}
          >
            <svg className={cn('w-5 h-5', isPinned ? 'fill-current' : '')} stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            aria-label="Xóa bài tập"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
});

AssignmentCard.displayName = 'AssignmentCard';