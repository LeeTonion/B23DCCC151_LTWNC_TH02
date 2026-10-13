import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useCountdown(targetDate: string, interval: number = 1000): number {
  const [timeLeft, setTimeLeft] = useState(() => {
    const target = new Date(targetDate).getTime();
    const now = Date.now();
    return Math.max(0, target - now);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(targetDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft(diff);
      if (diff === 0) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [targetDate, interval]);

  return timeLeft;
}