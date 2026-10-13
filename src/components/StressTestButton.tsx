import { useState } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { addSampleAssignments } from '@/features/assignments/assignmentsSlice';
import type { Assignment } from '@/types/assignment';
import { generateId, cn } from '@/lib/utils';

const SUBJECTS = [
  'Toán rời rạc',
  'Cấu trúc dữ liệu',
  'Lập trình web',
  'Cơ sở dữ liệu',
  'Mạng máy tính',
  'Hệ điều hành',
  'Trí tuệ nhân tạo',
  'An toàn thông tin',
  'Phân tích thiết kế hệ thống',
  'Kiến trúc máy tính',
];

const TITLES = [
  'Bài tập chương 1',
  'Bài tập thực hành',
  'Project nhóm',
  'Bài tập lớn',
  'Bài tập nhỏ',
  'Lab assignment',
  'Homework',
  'Quiz',
  'Midterm preparation',
  'Final project',
];

const PRIORITIES: Assignment['priority'][] = ['low', 'medium', 'high'];

function getRandomDate(): string {
  const now = new Date();
  const daysOffset = Math.floor(Math.random() * 60) - 10; // -10 to +50 days
  const date = new Date(now);
  date.setDate(date.getDate() + daysOffset);
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
  return date.toISOString();
}

function generateSampleAssignments(count: number): Assignment[] {
  const assignments: Assignment[] = [];
  for (let i = 0; i < count; i++) {
    const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
    const title = `${TITLES[Math.floor(Math.random() * TITLES.length)]} #${i + 1}`;
    const dueDate = getRandomDate();
    const priority = PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)];
    const completed = Math.random() < 0.2; // 20% completed

    assignments.push({
      id: generateId(),
      subject,
      title,
      dueDate,
      priority,
      completed,
      createdAt: new Date().toISOString(),
    });
  }
  return assignments;
}

export function StressTestButton() {
  const dispatch = useAppDispatch();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    const batchSize = 1000;
    const totalCount = 10000;
    let generated = 0;

    for (let i = 0; i < totalCount; i += batchSize) {
      const currentBatch = Math.min(batchSize, totalCount - i);
      const assignments = generateSampleAssignments(currentBatch);
      dispatch(addSampleAssignments(assignments));
      generated += currentBatch;
      setGeneratedCount(generated);
      // Yield to main thread to prevent blocking
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    setIsGenerating(false);
    setGeneratedCount(0);
  };

  const handleClear = () => {
    dispatch({ type: 'assignments/clearAll' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={cn(
              'px-4 py-2.5 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed',
              'bg-orange-600 hover:bg-orange-700'
            )}
          >
            {isGenerating ? `Đang tạo... ${generatedCount}/10000` : '🧪 Tạo 10.000 bài tập mẫu'}
          </button>

          <button
            onClick={handleClear}
            disabled={isGenerating}
            className={cn(
              'px-4 py-2.5 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed',
              'bg-red-600 hover:bg-red-700'
            )}
          >
            🗑️ Xóa tất cả
          </button>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          Dùng để stress test hiệu năng với danh sách lớn
        </div>
      </div>

      {isGenerating && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(generatedCount / 10000) * 100}%` }}
              role="progressbar"
              aria-valuenow={generatedCount}
              aria-valuemin={0}
              aria-valuemax={10000}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
            Đã tạo {generatedCount.toLocaleString()} / 10.000 bài tập
          </p>
        </div>
      )}
    </div>
  );
}