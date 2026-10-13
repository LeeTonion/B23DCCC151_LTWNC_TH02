import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@/features/theme/ThemeContext';
import { store } from '@/app/store';
import { AssignmentCard } from '@/components/AssignmentCard';
import type { Assignment } from '@/types/assignment';

// Mock matchMedia for ThemeContext - must be before ThemeProvider import
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const mockAssignment: Assignment = {
  id: 'test-1',
  subject: 'Toán rời rạc',
  title: 'Bài tập chương 1: Logic mệnh đề',
  dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
  priority: 'high',
  completed: false,
  createdAt: new Date().toISOString(),
};

const mockCompletedAssignment: Assignment = {
  ...mockAssignment,
  id: 'test-2',
  completed: true,
};

const mockOverdueAssignment: Assignment = {
  ...mockAssignment,
  id: 'test-3',
  dueDate: new Date(Date.now() - 86400000).toISOString(),
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </Provider>
  );
};

describe('AssignmentCard', () => {
  const defaultProps = {
    assignment: mockAssignment,
    onToggleComplete: jest.fn(),
    onDelete: jest.fn(),
    onTogglePin: jest.fn(),
    isPinned: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Display', () => {
    it('should render assignment title', () => {
      renderWithProviders(<AssignmentCard {...defaultProps} />);
      expect(screen.getByText('Bài tập chương 1: Logic mệnh đề')).toBeInTheDocument();
    });

    it('should render subject name', () => {
      renderWithProviders(<AssignmentCard {...defaultProps} />);
      expect(screen.getByText('Toán rời rạc')).toBeInTheDocument();
    });

    it('should render priority badge', () => {
      renderWithProviders(<AssignmentCard {...defaultProps} />);
      expect(screen.getByText('Cao')).toBeInTheDocument();
    });

    it('should render due date', () => {
      renderWithProviders(<AssignmentCard {...defaultProps} />);
      const dueDateText = screen.getByText(/(\d{2}\/\d{2}\/\d{4})/);
      expect(dueDateText).toBeInTheDocument();
    });

    it('should show days left for pending assignment', () => {
      renderWithProviders(<AssignmentCard {...defaultProps} />);
      expect(screen.getByText(/Còn \d+ ngày/)).toBeInTheDocument();
    });

    it('should show overdue text for overdue assignment', () => {
      renderWithProviders(<AssignmentCard {...{ ...defaultProps, assignment: mockOverdueAssignment }} />);
      expect(screen.getByText(/Quá hạn \d+ ngày/)).toBeInTheDocument();
    });

    it('should show completed text for completed assignment', () => {
      renderWithProviders(<AssignmentCard {...{ ...defaultProps, assignment: mockCompletedAssignment }} />);
      expect(screen.getByText('Đã hoàn thành')).toBeInTheDocument();
    });

    it('should show pin indicator when isPinned is true', () => {
      renderWithProviders(<AssignmentCard {...{ ...defaultProps, isPinned: true }} />);
      expect(screen.getByText('📌 Ghim')).toBeInTheDocument();
    });

    it('should apply completed styling when completed', () => {
      renderWithProviders(<AssignmentCard {...{ ...defaultProps, assignment: mockCompletedAssignment }} />);
      const title = screen.getByText('Bài tập chương 1: Logic mệnh đề');
      expect(title).toHaveClass('line-through');
    });
  });

  describe('Complete Button', () => {
    it('should call onToggleComplete when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AssignmentCard {...defaultProps} />);
      const button = screen.getByRole('button', { name: /đánh dấu hoàn thành/i });
      await user.click(button);
      expect(defaultProps.onToggleComplete).toHaveBeenCalledWith('test-1');
    });

    it('should show checkmark when completed', () => {
      renderWithProviders(<AssignmentCard {...{ ...defaultProps, assignment: mockCompletedAssignment }} />);
      const button = screen.getByRole('button', { name: /đánh dấu chưa hoàn thành/i });
      expect(button).toHaveClass('bg-indigo-600');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should not show checkmark when not completed', () => {
      renderWithProviders(<AssignmentCard {...defaultProps} />);
      const button = screen.getByRole('button', { name: /đánh dấu hoàn thành/i });
      expect(button.querySelector('svg')).not.toBeInTheDocument();
    });
  });

  describe('Pin Button', () => {
    it('should call onTogglePin when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AssignmentCard {...defaultProps} />);
      const button = screen.getByRole('button', { name: /ghim bài tập/i });
      await user.click(button);
      expect(defaultProps.onTogglePin).toHaveBeenCalledWith('test-1');
    });

    it('should show filled pin icon when pinned', () => {
      renderWithProviders(<AssignmentCard {...{ ...defaultProps, isPinned: true }} />);
      const button = screen.getByRole('button', { name: /bỏ ghim bài tập/i });
      const svg = button.querySelector('svg');
      // fill-current class applies fill: currentColor via CSS
      expect(svg).toHaveClass('fill-current');
    });

    it('should show outline pin icon when not pinned', () => {
      renderWithProviders(<AssignmentCard {...defaultProps} />);
      const button = screen.getByRole('button', { name: /ghim bài tập/i });
      const svg = button.querySelector('svg');
      expect(svg).not.toHaveAttribute('fill', 'currentColor');
    });
  });

  describe('Delete Button', () => {
    it('should call onDelete when clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AssignmentCard {...defaultProps} />);
      const button = screen.getByRole('button', { name: /xóa bài tập/i });
      const originalConfirm = window.confirm;
      window.confirm = jest.fn().mockReturnValue(true);
      await user.click(button);
      expect(defaultProps.onDelete).toHaveBeenCalledWith('test-1');
      window.confirm = originalConfirm;
    });

    it('should not call onDelete if user cancels', async () => {
      const user = userEvent.setup();
      renderWithProviders(<AssignmentCard {...defaultProps} />);
      const button = screen.getByRole('button', { name: /xóa bài tập/i });
      const originalConfirm = window.confirm;
      window.confirm = jest.fn().mockReturnValue(false);
      await user.click(button);
      expect(defaultProps.onDelete).not.toHaveBeenCalled();
      window.confirm = originalConfirm;
    });
  });

  describe('Priority Badge', () => {
    it('should show red badge for high priority', () => {
      renderWithProviders(<AssignmentCard {...defaultProps} />);
      const badge = screen.getByText('Cao');
      expect(badge).toHaveClass('bg-red-100');
      expect(badge).toHaveClass('text-red-700');
    });

    it('should show yellow badge for medium priority', () => {
      const mediumAssignment = { ...mockAssignment, priority: 'medium' as const };
      renderWithProviders(<AssignmentCard {...{ ...defaultProps, assignment: mediumAssignment }} />);
      const badge = screen.getByText('Trung bình');
      expect(badge).toHaveClass('bg-yellow-100');
      expect(badge).toHaveClass('text-yellow-700');
    });

    it('should show green badge for low priority', () => {
      const lowAssignment = { ...mockAssignment, priority: 'low' as const };
      renderWithProviders(<AssignmentCard {...{ ...defaultProps, assignment: lowAssignment }} />);
      const badge = screen.getByText('Thấp');
      expect(badge).toHaveClass('bg-green-100');
      expect(badge).toHaveClass('text-green-700');
    });
  });
});