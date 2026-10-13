'use client';

import React, { useState, useCallback, Suspense, lazy } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchAssignments, addAssignment, setFilter, setSearchTerm } from '@/features/assignments/assignmentsSlice';
import Header from './Header';
import AssignmentForm from './AssignmentForm';
import Filter from './Filter';
import AssignmentList from './AssignmentList';
import StressTest from './StressTest';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

// Lazy load Statistics page
const Statistics = lazy(() => import('./Statistics').then((module) => ({ default: module.default })));

export default function MainContent() {
  const dispatch = useAppDispatch();
  const assignments = useAppSelector((state) => state.assignments.items);
  const status = useAppSelector((state) => state.assignments.status);
  const error = useAppSelector((state) => state.assignments.error);
  const filter = useAppSelector((state) => state.assignments.filter);
  const searchTerm = useAppSelector((state) => state.assignments.searchTerm);
  
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showStressTest, setShowStressTest] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch assignments on mount
  React.useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAssignments());
    }
  }, [dispatch, status]);

  const handleAddAssignment = useCallback(
    (data: { subject: string; title: string; dueDate: string; priority: string }) => {
      dispatch(addAssignment(data));
      setShowForm(false);
    },
    [dispatch]
  );

  const handleFilterChange = useCallback(
    (newFilter: 'all' | 'pending' | 'overdue' | 'completed') => {
      dispatch(setFilter(newFilter));
    },
    [dispatch]
  );

  const handleSearchChange = useCallback(
    (term: string) => {
      dispatch(setSearchTerm(term));
    },
    [dispatch]
  );

  const stats = React.useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter((a) => a.completed).length;
    const overdue = assignments.filter((a) => !a.completed && new Date(a.dueDate) < new Date()).length;
    const pending = total - completed - overdue;
    return { total, completed, overdue, pending };
  }, [assignments]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6" role="region" aria-label="Thống kê nhanh">
          <StatCard title="Tổng số" value={stats.total} color="blue" />
          <StatCard title="Đang làm" value={stats.pending} color="yellow" />
          <StatCard title="Quá hạn" value={stats.overdue} color="red" />
          <StatCard title="Hoàn thành" value={stats.completed} color="green" />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6" role="group" aria-label="Thao tác chính">
          <button
            onClick={() => setShowForm(!showForm)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              showForm
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
            data-testid="toggle-form"
          >
            {showForm ? 'Ẩn form' : 'Thêm bài tập mới'}
          </button>
          
          <button
            onClick={() => setShowStats(!showStats)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              showStats
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
            data-testid="toggle-stats"
          >
            {showStats ? 'Ẩn thống kê' : 'Xem thống kê'}
          </button>

          <button
            onClick={() => setShowStressTest(!showStressTest)}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              showStressTest
                ? 'bg-red-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
            data-testid="toggle-stress-test"
          >
            {showStressTest ? 'Ẩn stress test' : 'Stress test'}
          </button>
        </div>

        {/* Add Assignment Form */}
        {showForm && (
          <div className="mb-6 animate-slide-down" role="region" aria-label="Form thêm bài tập">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Thêm bài tập mới</h2>
              <AssignmentForm onSubmit={handleAddAssignment} onCancel={() => setShowForm(false)} />
            </div>
          </div>
        )}

        {/* Statistics Page */}
        {showStats && (
          <div className="mb-6 animate-slide-down" role="region" aria-label="Trang thống kê">
            <Suspense fallback={
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                  ))}
                </div>
              </div>
            }>
              <Statistics assignments={assignments} />
            </Suspense>
          </div>
        )}

        {/* Stress Test */}
        {showStressTest && (
          <div className="mb-6 animate-slide-down" role="region" aria-label="Chế độ stress test">
            <StressTest />
          </div>
        )}

        {/* Filter & Search */}
        <div className="mb-6" role="region" aria-label="Bộ lọc và tìm kiếm">
          <Filter
            currentFilter={filter}
            onFilterChange={handleFilterChange}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            debouncedSearchTerm={debouncedSearchTerm}
          />
        </div>

        {/* Assignment List */}
        <div role="region" aria-label="Danh sách bài tập">
          <AssignmentList
            assignments={assignments}
            isLoading={status === 'loading'}
            error={error}
          />
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  };

  return (
    <div className={cn('rounded-xl border p-4', colorClasses[color as keyof typeof colorClasses])}>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}