import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useEffect } from 'react';
import { fetchAssignments, toggleComplete, deleteAssignment } from '@/features/assignments/assignmentsSlice';
import { selectFilteredAssignments } from '@/features/assignments/assignmentsSelectors';
import { AssignmentForm } from '@/components/AssignmentForm';
import { FilterBar } from '@/components/FilterBar';
import { StressTestButton } from '@/components/StressTestButton';
import { VirtualizedAssignmentList } from '@/components/VirtualizedAssignmentList';
import { usePinStore } from '@/features/pins/pinStore';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function AssignmentListPage() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.assignments.status);
  const error = useAppSelector((state) => state.assignments.error);
  const assignments = useAppSelector(selectFilteredAssignments);
  const { togglePin } = usePinStore();

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAssignments());
    }
  }, [dispatch, status]);

  const handleToggleComplete = (id: string) => {
    dispatch(toggleComplete(id));
  };

  const handleDelete = (id: string) => {
    dispatch(deleteAssignment(id));
  };

  const handleTogglePin = (id: string) => {
    togglePin(id);
  };

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (status === 'failed') {
    return (
      <div className="text-center py-12 text-red-500">
        <p className="text-lg font-medium">Không thể tải danh sách bài tập</p>
        <p className="mt-1 text-sm">{error}</p>
        <button
          onClick={() => dispatch(fetchAssignments())}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Danh sách bài tập</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Tổng cộng: <span className="font-medium text-gray-900 dark:text-gray-100">{assignments.length}</span> bài tập
        </div>
      </div>

      <AssignmentForm />
      <FilterBar />
      <StressTestButton />
      <VirtualizedAssignmentList
        assignments={assignments}
        onToggleComplete={handleToggleComplete}
        onDelete={handleDelete}
        onTogglePin={handleTogglePin}
      />
    </div>
  );
}