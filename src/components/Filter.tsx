'use client';

import React, { useCallback } from 'react';
import type { FilterStatus } from '@/types/assignment';
import { cn } from '@/lib/utils';

interface FilterProps {
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  debouncedSearchTerm: string;
}

const filters: { value: FilterStatus; label: string; icon: React.ReactNode }[] = [
  {
    value: 'all',
    label: 'Tất cả',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    value: 'pending',
    label: 'Chưa hoàn thành',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    value: 'overdue',
    label: 'Quá hạn',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    value: 'completed',
    label: 'Đã hoàn thành',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function Filter({
  currentFilter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  debouncedSearchTerm,
}: FilterProps) {
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  const handleFilterChange = useCallback(
    (filter: FilterStatus) => {
      onFilterChange(filter);
    },
    [onFilterChange]
  );

  return (
    <div className="space-y-4" data-testid="filter-component">
      <div className="relative">
        <label htmlFor="search" className="sr-only">
          Tìm kiếm bài tập
        </label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm theo môn học, tên bài tập..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            data-testid="search-input"
          />
          {debouncedSearchTerm && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              Đang lọc: "{debouncedSearchTerm}"
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Bộ lọc trạng thái">
        {filters.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => handleFilterChange(filter.value)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              currentFilter === filter.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
            data-testid={`filter-${filter.value}`}
          >
            {filter.icon}
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}