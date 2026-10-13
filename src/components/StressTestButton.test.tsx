import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { StressTestButton } from '@/components/StressTestButton';
import { ThemeProvider } from '@/features/theme/ThemeContext';
import { addSampleAssignments, clearAll } from '@/features/assignments/assignmentsSlice';

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <Provider store={store}>
      <ThemeProvider>{component}</ThemeProvider>
    </Provider>
  );
};

describe('StressTestButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch(clearAll());
  });

  it('renders generate and clear buttons', () => {
    renderWithProviders(<StressTestButton />);

    expect(screen.getByRole('button', { name: /tạo 10.000 bài tập mẫu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /xóa tất cả/i })).toBeInTheDocument();
  });

  it('dispatches addSampleAssignments when generate clicked', async () => {
    renderWithProviders(<StressTestButton />);

    const generateButton = screen.getByRole('button', { name: /tạo 10.000 bài tập mẫu/i });
    fireEvent.click(generateButton);

    expect(screen.getByText(/đang tạo.*\/10000/i)).toBeInTheDocument();
  });

  it('dispatches clearAll when clear button clicked', () => {
    renderWithProviders(<StressTestButton />);

    const clearButton = screen.getByRole('button', { name: /xóa tất cả/i });
    fireEvent.click(clearButton);

    expect(store.getState().assignments.items).toHaveLength(0);
  });

  it('shows progress bar during generation', () => {
    renderWithProviders(<StressTestButton />);

    const generateButton = screen.getByRole('button', { name: /tạo 10.000 bài tập mẫu/i });
    fireEvent.click(generateButton);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('disables buttons during generation', () => {
    renderWithProviders(<StressTestButton />);

    const generateButton = screen.getByRole('button', { name: /tạo 10.000 bài tập mẫu/i });
    fireEvent.click(generateButton);

    expect(generateButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /xóa tất cả/i })).toBeDisabled();
  });
});