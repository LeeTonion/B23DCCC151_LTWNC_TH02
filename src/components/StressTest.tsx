'use client';

import React, { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addSampleAssignments, selectAssignments } from '@/features/assignments/assignmentsSlice';
import type { Assignment, Priority } from '@/types/assignment';
import { generateId } from '@/lib/utils';

const subjects = [
  'Toán rời rạc',
  'Cấu trúc dữ liệu',
  'Lập trình web',
  'Cơ sở dữ liệu',
  'Mạng máy tính',
  'Hệ điều hành',
  'Trí tuệ nhân tạo',
  'An toàn thông tin',
  'Công nghệ phần mềm',
  'Kiến trúc máy tính',
  'Lập trình hướng đối tượng',
  'Phân tích thiết kế thuật toán',
  'Hệ quản trị cơ sở dữ liệu',
  'Lập trình di động',
  'Điện toán đám mây',
];

const titles = [
  'Bài tập chương 1',
  'Bài tập chương 2',
  'Bài tập chương 3',
  'Bài tập chương 4',
  'Bài tập chương 5',
  'Project giữa kỳ',
  'Project cuối kỳ',
  'Bài tập lớn',
  'Thực hành lab',
  'Bài tập về nhà',
  'Bài tập nhóm',
  'Case study',
  'Research paper',
  'Presentation',
  'Quiz',
];

const priorities: Priority[] = ['low', 'medium', 'high'];

function generateRandomDate(): string {
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
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const title = `${titles[Math.floor(Math.random() * titles.length)]} ${i + 1}`;
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const dueDate = generateRandomDate();
    const completed = Math.random() < 0.3; // 30% completed
    
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

export default function StressTest() {
  const dispatch = useAppDispatch();
  const assignments = useAppSelector(selectAssignments);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);

  const handleGenerate = useCallback(async (count: number) => {
    setIsGenerating(true);
    setGeneratedCount(0);
    
    // Generate in batches to avoid blocking the main thread
    const batchSize = 1000;
    const batches = Math.ceil(count / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const currentBatchSize = Math.min(batchSize, count - i * batchSize);
      const batch = generateSampleAssignments(currentBatchSize);
      
      // Use setTimeout to yield to the main thread
      await new Promise((resolve) => setTimeout(resolve, 0));
      
      dispatch(addSampleAssignments(batch));
      setGeneratedCount((i + 1) * batchSize);
    }
    
    setIsGenerating(false);
  }, [dispatch]);

  const handleClear = useCallback(() => {
    dispatch({ type: 'assignments/clearAll' });
    setGeneratedCount(0);
  }, [dispatch]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6" data-testid="stress-test">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Chế độ Stress Test
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Tạo dữ liệu mẫu để kiểm tra hiệu năng ứng dụng. Hiện tại: <strong>{assignments.length}</strong> bài tập.
      </p>

      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => handleGenerate(1000)}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-testid="generate-1k"
        >
          Tạo 1.000 bài tập
        </button>
        <button
          onClick={() => handleGenerate(5000)}
          disabled={isGenerating}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-testid="generate-5k"
        >
          Tạo 5.000 bài tập
        </button>
        <button
          onClick={() => handleGenerate(10000)}
          disabled={isGenerating}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          data-testid="generate-10k"
        >
          Tạo 10.000 bài tập
        </button>
        <button
          onClick={handleClear}
          disabled={isGenerating || assignments.length === 0}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-testid="clear-all"
        >
          Xóa tất cả
        </button>
      </div>

      {isGenerating && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((generatedCount / 10000) * 100, 100)}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 w-20 text-right">
              {generatedCount}/10,000
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Đang tạo dữ liệu mẫu... Vui lòng đợi.
          </p>
        </div>
      )}

      {generatedCount > 0 && !isGenerating && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-green-700 dark:text-green-400 text-sm">
            ✓ Đã tạo thành công <strong>{generatedCount}</strong> bài tập mẫu.
          </p>
        </div>
      )}

      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Hướng dẫn đo hiệu năng:</h4>
        <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
          <li>Mở React DevTools Profiler</li>
          <li>Bấm "Tạo 10.000 bài tập" và đợi hoàn tất</li>
          <li>Bắt đầu ghi hình (Record) trong Profiler</li>
          <li>Gõ vào ô tìm kiếm và quan sát số lần render của AssignmentCard</li>
          <li>Chạy Lighthouse để đo điểm Performance</li>
          <li>Áp dụng tối ưu hóa và đo lại để so sánh</li>
        </ol>
      </div>
    </div>
  );
}