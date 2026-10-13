import { useMemo } from 'react';
import type { Assignment } from '@/types/assignment';
import { cn } from '@/lib/utils';

interface StatisticsChartsProps {
  assignments: Assignment[];
  bySubject: Record<string, Assignment[]>;
}

export function StatisticsCharts({ assignments, bySubject }: StatisticsChartsProps) {
  const subjectStats = useMemo(() => {
    return Object.entries(bySubject).map(([subject, subjectAssignments]) => {
      const total = subjectAssignments.length;
      const completed = subjectAssignments.filter((a) => a.completed).length;
      const overdue = subjectAssignments.filter(
        (a) => !a.completed && new Date(a.dueDate) < new Date()
      ).length;
      const pending = total - completed - overdue;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { subject, total, completed, overdue, pending, completionRate };
    });
  }, [bySubject]);

  const priorityStats = useMemo(() => {
    const stats = { high: 0, medium: 0, low: 0 };
    assignments.forEach((a) => {
      stats[a.priority]++;
    });
    return stats;
  }, [assignments]);

  const statusDistribution = useMemo(() => {
    return {
      completed: assignments.filter((a) => a.completed).length,
      overdue: assignments.filter((a) => !a.completed && new Date(a.dueDate) < new Date()).length,
      pending: assignments.filter((a) => !a.completed && new Date(a.dueDate) >= new Date()).length,
    };
  }, [assignments]);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Phân bố theo trạng thái</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <StatusBar
              label="Đã hoàn thành"
              value={statusDistribution.completed}
              total={assignments.length}
              color="green"
            />
            <StatusBar
              label="Quá hạn"
              value={statusDistribution.overdue}
              total={assignments.length}
              color="red"
            />
            <StatusBar
              label="Đang chờ"
              value={statusDistribution.pending}
              total={assignments.length}
              color="yellow"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Phân bố theo độ ưu tiên</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <PriorityStatCard
              label="Cao"
              value={priorityStats.high}
              total={assignments.length}
              color="red"
            />
            <PriorityStatCard
              label="Trung bình"
              value={priorityStats.medium}
              total={assignments.length}
              color="yellow"
            />
            <PriorityStatCard
              label="Thấp"
              value={priorityStats.low}
              total={assignments.length}
              color="green"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Thống kê theo môn học</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full" role="table">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Môn học</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Tổng</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Hoàn thành</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Quá hạn</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Đang chờ</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {subjectStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                subjectStats.map((stat) => (
                  <tr key={stat.subject} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">{stat.subject}</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">{stat.total}</td>
                    <td className="px-4 py-3 text-center text-sm text-green-600 dark:text-green-400 font-medium">{stat.completed}</td>
                    <td className="px-4 py-3 text-center text-sm text-red-600 dark:text-red-400 font-medium">{stat.overdue}</td>
                    <td className="px-4 py-3 text-center text-sm text-yellow-600 dark:text-yellow-400 font-medium">{stat.pending}</td>
                    <td className="px-4 py-3 text-center">
                      <ProgressBar value={stat.completionRate} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

interface StatusBarProps {
  label: string;
  value: number;
  total: number;
  color: 'green' | 'red' | 'yellow';
}

function StatusBar({ label, value, total, color }: StatusBarProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  };
  const textColorClasses = {
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className={cn('text-sm font-bold', textColorClasses[color])}>{value}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorClasses[color])}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={Math.round(percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${value} của ${total}`}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
        {total > 0 ? `${percentage.toFixed(1)}%` : '0%'}
      </p>
    </div>
  );
}

interface PriorityStatCardProps {
  label: string;
  value: number;
  total: number;
  color: 'red' | 'yellow' | 'green';
}

function PriorityStatCard({ label, value, total, color }: PriorityStatCardProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses = {
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
  };

  return (
    <div className={cn('rounded-xl border p-4 text-center', colorClasses[color])}>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="mt-2 text-xs font-medium">
        {total > 0 ? `${percentage.toFixed(1)}%` : '0%'} tổng số
      </p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const color = value >= 80 ? 'green' : value >= 50 ? 'yellow' : 'red';
  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', colorClasses[color])}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}