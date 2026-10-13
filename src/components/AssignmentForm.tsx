import { useState, FormEvent, ChangeEvent } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { addAssignment } from '@/features/assignments/assignmentsSlice';
import type { AssignmentFormData, Priority } from '@/types/assignment';
import { cn } from '@/lib/utils';

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'high', label: 'Cao' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'low', label: 'Thấp' },
];

interface FormErrors {
  subject?: string;
  title?: string;
  dueDate?: string;
  priority?: string;
}

export function AssignmentForm() {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<AssignmentFormData>({
    subject: '',
    title: '',
    dueDate: '',
    priority: 'medium',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Môn học là bắt buộc';
    } else if (formData.subject.trim().length < 2) {
      newErrors.subject = 'Môn học phải có ít nhất 2 ký tự';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Tên bài tập là bắt buộc';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Tên bài tập phải có ít nhất 3 ký tự';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Hạn nộp là bắt buộc';
    } else {
      const dueDate = new Date(formData.dueDate);
      const now = new Date();
      // Compare full datetime since input is datetime-local
      if (dueDate < now) {
        newErrors.dueDate = 'Hạn nộp không thể là quá khứ';
      }
    }

    if (!formData.priority) {
      newErrors.priority = 'Độ ưu tiên là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    dispatch(addAssignment(formData));
    setFormData({ subject: '', title: '', dueDate: '', priority: 'medium' });
    setIsSubmitting(false);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-5">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Thêm bài tập mới</h2>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Môn học <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Ví dụ: Lập trình web"
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              errors.subject && 'border-red-500 focus:ring-red-500',
              !errors.subject && 'border-gray-300 dark:border-gray-600'
            )}
            aria-invalid={errors.subject ? 'true' : 'false'}
            aria-describedby={errors.subject ? 'subject-error' : undefined}
          />
          {errors.subject && (
            <p id="subject-error" className="mt-1 text-sm text-red-500" role="alert">
              {errors.subject}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tên bài tập <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ví dụ: Project React: Todo App"
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              errors.title && 'border-red-500 focus:ring-red-500',
              !errors.title && 'border-gray-300 dark:border-gray-600'
            )}
            aria-invalid={errors.title ? 'true' : 'false'}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
          {errors.title && (
            <p id="title-error" className="mt-1 text-sm text-red-500" role="alert">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Hạn nộp <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            min={today}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              errors.dueDate && 'border-red-500 focus:ring-red-500',
              !errors.dueDate && 'border-gray-300 dark:border-gray-600'
            )}
            aria-invalid={errors.dueDate ? 'true' : 'false'}
            aria-describedby={errors.dueDate ? 'dueDate-error' : undefined}
          />
          {errors.dueDate && (
            <p id="dueDate-error" className="mt-1 text-sm text-red-500" role="alert">
              {errors.dueDate}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Độ ưu tiên <span className="text-red-500">*</span>
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              errors.priority && 'border-red-500 focus:ring-red-500',
              !errors.priority && 'border-gray-300 dark:border-gray-600'
            )}
            aria-invalid={errors.priority ? 'true' : 'false'}
            aria-describedby={errors.priority ? 'priority-error' : undefined}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          {errors.priority && (
            <p id="priority-error" className="mt-1 text-sm text-red-500" role="alert">
              {errors.priority}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'px-6 py-2.5 rounded-lg font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-indigo-600 hover:bg-indigo-700'
          )}
        >
          {isSubmitting ? 'Đang thêm...' : 'Thêm bài tập'}
        </button>
      </div>
    </form>
  );
}