import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 300 });
    expect(result.current).toBe('initial'); // Still initial

    // Advance time by less than delay
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('initial'); // Still initial

    // Advance time past delay
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('updated'); // Now updated
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    // Rapid changes
    rerender({ value: 'change1', delay: 300 });
    act(() => jest.advanceTimersByTime(100));
    
    rerender({ value: 'change2', delay: 300 });
    act(() => jest.advanceTimersByTime(100));
    
    rerender({ value: 'change3', delay: 300 });
    act(() => jest.advanceTimersByTime(100));
    
    expect(result.current).toBe('initial'); // Still initial

    // Wait for debounce to complete
    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe('change3'); // Final value
  });

  it('should work with different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    rerender({ value: 'updated', delay: 500 });
    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe('initial');

    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('updated');
  });

  it('should handle object values', () => {
    const initialObj = { name: 'John', age: 30 };
    const updatedObj = { name: 'Jane', age: 25 };

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 300 } }
    );

    expect(result.current).toEqual(initialObj);

    rerender({ value: updatedObj, delay: 300 });
    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toEqual(updatedObj);
  });

  it('should handle array values', () => {
    const initialArr = [1, 2, 3];
    const updatedArr = [4, 5, 6];

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialArr, delay: 300 } }
    );

    expect(result.current).toEqual(initialArr);

    rerender({ value: updatedArr, delay: 300 });
    act(() => jest.advanceTimersByTime(300));
    expect(result.current).toEqual(updatedArr);
  });
});