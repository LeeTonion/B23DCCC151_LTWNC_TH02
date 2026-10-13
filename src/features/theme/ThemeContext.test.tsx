import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';

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

import { ThemeProvider, useTheme } from '@/features/theme/ThemeContext';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

const TestComponent = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme} data-testid="toggle">Toggle</button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">Set Dark</button>
      <button onClick={() => setTheme('light')} data-testid="set-light">Set Light</button>
    </div>
  );
};

const renderWithProvider = (initialTheme: 'light' | 'dark' = 'light') => {
  localStorageMock.getItem.mockReturnValue(initialTheme);
  return render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('light');
    document.documentElement.classList.remove('dark');
  });

  describe('Initial theme', () => {
    it('should default to light theme', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should load saved theme from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('dark');
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should respect system preference when no saved theme', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      (window.matchMedia as jest.Mock).mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
      }));
      
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      const toggleButton = screen.getByTestId('toggle');
      
      act(() => {
        fireEvent.click(toggleButton);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should toggle from dark to light', async () => {
      localStorageMock.getItem.mockReturnValue('dark');
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      const toggleButton = screen.getByTestId('toggle');
      
      act(() => {
        fireEvent.click(toggleButton);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });

  describe('setTheme', () => {
    it('should set theme to dark', async () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      const setDarkButton = screen.getByTestId('set-dark');
      
      act(() => {
        fireEvent.click(setDarkButton);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark');
      });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should set theme to light', async () => {
      localStorageMock.getItem.mockReturnValue('dark');
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );
      const setLightButton = screen.getByTestId('set-light');
      
      act(() => {
        fireEvent.click(setLightButton);
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light');
      });
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });

  describe('ThemeProvider without children', () => {
    it('should render children when mounted', () => {
      const { unmount } = render(
        <ThemeProvider>
          <div data-testid="child">Child</div>
        </ThemeProvider>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
      unmount();
    });
  });
});