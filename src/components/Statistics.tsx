'use client';

import React, { useMemo } from 'react';
import type { Assignment } from '@/types/assignment';
import { calcStats, isOverdue, getPriorityLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface StatisticsProps {
  assignments: Assignment[];
}

export default function Statistics({ assignments }: StatisticsProps) {
  const stats = useMemo(() => calcStats(assignments), [assignments]);

  const priorityStats = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    assignments.forEach((a) => {
      if (!a.completed) counts[a.priority]++;
    });
    return counts;
  }, [assignments]);

  const subjectStats = useMemo(() => {
    const map: Record<string, { total: number; completed: number; overdue: number; pending: number }> = {};
    assignments.forEach((a) => {
      if (!map[a.subject]) {
        map[a.subject] = { total: 0, completed: 0, overdue: 0, pending: 0 };
      }
      map[a.subject].total++;
      if (a.completed) {
        map[a.subject].completed++;
      } else if (isOverdue(a.dueDate, false)) {
        map[a.subject].overdue++;
      } else {
        map[a.subject].pending++;
      }
    });
    return map;
  }, [assignments]);

  const upcomingDeadlines = useMemo(() => {
    return assignments
      .filter((a) => !a.completed && !isOverdue(a.dueDate, false))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [assignments]);

  const overdueAssignments = useMemo(() => {
    return assignments
      .filter((a) => !a.completed && isOverdue(a.dueDate, false))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [assignments]);

  const totalAssignments = assignments.length;
  const completionRate = totalAssignments > 0 ? Math.round((stats.completed / totalAssignments) * 100) : 0;

  return (
    <div className="space-y-6" data-testid="statistics-page">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng bài tập"
          value={stats.total}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Đã hoàn thành"
          value={stats.completed}
          subtitle={`${completionRate}%`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Quá hạn"
          value={stats.overdue}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          color="red"
        />
        <StatCard
          title="Đang làm"
          value={stats.pending}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="yellow"
        />
      </div>

      {/* Priority Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Phân bố độ ưu tiên (chưa hoàn thành)</h3>
        <div className="space-y-3">
          {(['high', 'medium', 'low'] as const).map((priority) => {
            const count = priorityStats[priority];
            const percentage = stats.pending > 0 ? Math.round((count / stats.pending) * 100) : 0;
            const color = priority === 'high' ? 'red' : priority === 'medium' ? 'yellow' : 'green';
            return (
              <div key={priority} className="flex items-center gap-4">
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium w-24 text-center', getPriorityColor(priority))}>
                  {getPriorityLabel(priority)}
                </span>
                <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', getProgressColor(priority))}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16 text-right">
                  {count} ({percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Thống kê theo môn học</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Môn học</th>
                <th className="text-center py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Tổng</th>
                <th className="text-center py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Hoàn thành</th>
                <th className="text-center py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Đang làm</th>
                <th className="text-center py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Quá hạn</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(subjectStats).map(([subject, stat]) => (
                <tr key={subject} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-gray-100">{subject}</td>
                  <td className="text-center py-2 px-3 text-gray-700 dark:text-gray-300">{stat.total}</td>
                  <td className="text-center py-2 px-3 text-green-600 dark:text-green-400">{stat.completed}</td>
                  <td className="text-center py-2 px-3 text-blue-600 dark:text-blue-400">{stat.pending}</td>
                  <td className="text-center py-2 px-3 text-red-600 dark:text-red-400">{stat.overdue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sắp đến hạn (Top 5)</h3>
        {upcomingDeadlines.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">Không có bài tập sắp đến hạn</p>
        ) : (
          <ul className="space-y-2">
            {upcomingDeadlines.map((assignment) => (
              <li key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{assignment.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{assignment.subject}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', getPriorityBadgeColor(assignment.priority))}>
                    {getPriorityLabel(assignment.priority)}
                  </span>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium whitespace-nowrap">
                    Còn {Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} ngày
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Overdue Assignments */}
      {overdueAssignments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 text-red-600 dark:text-red-400">
            Bài tập quá hạn ({overdueAssignments.length})
          </h3>
          <ul className="space-y-2">
            {overdueAssignments.map((assignment) => (
              <li key={assignment.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{assignment.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{assignment.subject}</p>
                </div>
                <span className="text-sm text-red-600 dark:text-red-400 font-medium whitespace-nowrap ml-4">
                  Quá hạn {Math.abs(Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} ngày
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color }: { title: string; value: number; subtitle?: string; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
          </div>
        </div>
        <div className={cn('p-3 rounded-full', colorClasses[color as keyof typeof colorClasses])}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'low':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  }
}

function getProgressColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}

function getPriorityBadgeColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'low':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  }
}