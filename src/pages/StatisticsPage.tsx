import { useAppSelector } from '@/app/hooks';
import { selectAssignments, selectAssignmentsStats, selectAssignmentsBySubject } from '@/features/assignments/assignmentsSelectors';
import { Suspense, lazy } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { cn } from '@/lib/utils';

const StatisticsCharts = lazy(() => import('./StatisticsCharts').then(module => ({ default: module.StatisticsCharts })));

export function StatisticsPage() {
  const assignments = useAppSelector(selectAssignments);
  const stats = useAppSelector(selectAssignmentsStats);
  const bySubject = useAppSelector(selectAssignmentsBySubject);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Thống kê bài tập</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Tổng cộng: <span className="font-medium text-gray-900 dark:text-gray-100">{assignments.length}</span> bài tập
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng bài tập"
          value={stats.total}
          icon={<TotalIcon />}
          color="indigo"
        />
        <StatCard
          title="Đã hoàn thành"
          value={stats.completed}
          icon={<CompletedIcon />}
          color="green"
        />
        <StatCard
          title="Quá hạn"
          value={stats.overdue}
          icon={<OverdueIcon />}
          color="red"
        />
        <StatCard
          title="Đang chờ"
          value={stats.pending}
          icon={<PendingIcon />}
          color="yellow"
        />
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <StatisticsCharts assignments={assignments} bySubject={bySubject} />
      </Suspense>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'indigo' | 'green' | 'red' | 'yellow';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
        <div className={cn('p-3 rounded-xl', colorClasses[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function TotalIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function CompletedIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function OverdueIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}