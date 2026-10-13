import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { FilterBar } from '@/components/FilterBar';
import { ThemeProvider } from '@/features/theme/ThemeContext';
import { setFilter, setSearchTerm } from '@/features/assignments/assignmentsSlice';
import { useDebounce } from '@/hooks/useDebounce';

jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: jest.fn((value) => value),
}));

const mockUseDebounce = useDebounce as jest.MockedFunction<typeof useDebounce>;

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <Provider store={store}>
      <ThemeProvider>{component}</ThemeProvider>
    </Provider>
  );
};

describe('FilterBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDebounce.mockImplementation((value) => value);
    store.dispatch(setFilter('all'));
    store.dispatch(setSearchTerm(''));
  });

  it('renders search input and filter buttons', () => {
    renderWithProviders(<FilterBar />);

    expect(screen.getByPlaceholderText(/tìm kiếm theo môn học, tên bài tập/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tất cả/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /chưa hoàn thành/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /quá hạn/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /đã hoàn thành/i })).toBeInTheDocument();
  });

  it('highlights active filter', () => {
    store.dispatch(setFilter('pending'));
    renderWithProviders(<FilterBar />);

    const pendingButton = screen.getByRole('button', { name: /chưa hoàn thành/i });
    expect(pendingButton).toHaveClass('bg-indigo-600');
  });

  it('updates search term on input change', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FilterBar />);

    const searchInput = screen.getByPlaceholderText(/tìm kiếm theo môn học, tên bài tập/i);
    await user.type(searchInput, 'react');

    expect(store.getState().assignments.searchTerm).toBe('react');
  });

  it('updates filter when button clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<FilterBar />);

    const overdueButton = screen.getByRole('button', { name: /quá hạn/i });
    await user.click(overdueButton);

    expect(store.getState().assignments.filter).toBe('overdue');
  });

  it('shows debounced search indicator', () => {
    mockUseDebounce.mockImplementation((value) => value === 'react' ? 'rea' : value);
    store.dispatch(setSearchTerm('react'));

    renderWithProviders(<FilterBar />);

    expect(screen.getByText(/đang tìm kiếm:/i)).toBeInTheDocument();
    expect(screen.getByText(/rea/i)).toBeInTheDocument();
  });
});