import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { ThemeProvider } from '@/features/theme/ThemeContext';
import { AssignmentListPage } from '@/pages/AssignmentListPage';

// Mock the VirtualizedAssignmentList to avoid AutoSizer issues in tests
jest.mock('@/components/VirtualizedAssignmentList', () => ({
  VirtualizedAssignmentList: ({ assignments, onToggleComplete, onDelete, onTogglePin }: any) => {
    if (assignments.length === 0) {
      return (
        <div data-testid="assignment-list" className="text-center py-12">
          <p>Không có bài tập nào</p>
        </div>
      );
    }
    return (
      <div data-testid="assignment-list">
        {assignments.map((assignment: any) => (
          <div key={assignment.id} className="p-4 border-b" data-testid={`assignment-${assignment.id}`}>
            <h3>{assignment.title}</h3>
            <p>{assignment.subject}</p>
            <button onClick={() => onToggleComplete(assignment.id)}>Toggle</button>
            <button onClick={() => onDelete(assignment.id)}>Delete</button>
            <button onClick={() => onTogglePin(assignment.id)}>Pin</button>
          </div>
        ))}
      </div>
    );
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </Provider>
  );
};

describe('AssignmentListPage - State-based tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch({ type: 'assignments/clearAll' });
  });

  it('shows loading state when status is loading', () => {
    store.dispatch({ 
      type: 'assignments/fetchAssignments/pending',
      meta: { requestId: 'test', arg: undefined }
    });

    renderWithProviders(<AssignmentListPage />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/đang tải/i)).toBeInTheDocument();
  });

  it('displays assignments from store when status is succeeded', () => {
    const mockAssignments = [
      {
        id: '1',
        subject: 'Lập trình web',
        title: 'Project React',
        dueDate: '2026-12-31T23:59:00',
        priority: 'high',
        completed: false,
        createdAt: '2026-01-01T00:00:00',
      },
      {
        id: '2',
        subject: 'Cơ sở dữ liệu',
        title: 'Thiết kế ERD',
        dueDate: '2026-11-30T23:59:00',
        priority: 'medium',
        completed: true,
        createdAt: '2026-01-01T00:00:00',
      },
    ];

    store.dispatch({ 
      type: 'assignments/fetchAssignments/fulfilled',
      payload: mockAssignments,
      meta: { requestId: 'test', arg: undefined }
    });

    renderWithProviders(<AssignmentListPage />);

    expect(screen.getByText('Project React')).toBeInTheDocument();
    expect(screen.getByText('Thiết kế ERD')).toBeInTheDocument();
    expect(screen.getByText('Lập trình web')).toBeInTheDocument();
    expect(screen.getByText('Cơ sở dữ liệu')).toBeInTheDocument();
  });

  it('displays error message when status is failed', () => {
    store.dispatch({ 
      type: 'assignments/fetchAssignments/rejected',
      payload: 'Network error',
      meta: { requestId: 'test', arg: undefined, aborted: false },
      error: { message: 'Rejected' }
    });

    renderWithProviders(<AssignmentListPage />);

    expect(screen.getByText(/không thể tải danh sách bài tập/i)).toBeInTheDocument();
    expect(screen.getByText(/network error/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /thử lại/i })).toBeInTheDocument();
  });

  it('shows empty state when no assignments and status succeeded', () => {
    store.dispatch({ 
      type: 'assignments/fetchAssignments/fulfilled',
      payload: [],
      meta: { requestId: 'test', arg: undefined }
    });

    renderWithProviders(<AssignmentListPage />);

    expect(screen.getByText('Không có bài tập nào')).toBeInTheDocument();
  });
});