import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setFilter, setSearchTerm } from '@/features/assignments/assignmentsSlice';
import type { FilterStatus } from '@/types/assignment';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

const FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Chưa hoàn thành' },
  { value: 'overdue', label: 'Quá hạn' },
  { value: 'completed', label: 'Đã hoàn thành' },
];

export function FilterBar() {
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.assignments.filter);
  const searchTerm = useAppSelector((state) => state.assignments.searchTerm);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleFilterChange = (newFilter: FilterStatus) => {
    dispatch(setFilter(newFilter));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <label htmlFor="search" className="sr-only">
            Tìm kiếm bài tập
          </label>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm theo môn học, tên bài tập..."
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                'border-gray-300 dark:border-gray-600'
              )}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterChange(option.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
                filter === option.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
              aria-pressed={filter === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {debouncedSearchTerm !== searchTerm && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Đang tìm kiếm: <span className="font-medium">"{debouncedSearchTerm}"</span>
        </div>
      )}
    </div>
  );
}