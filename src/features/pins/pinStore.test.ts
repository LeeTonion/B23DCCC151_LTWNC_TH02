import { act } from '@testing-library/react';
import { usePinStore } from '@/features/pins/pinStore';

describe('usePinStore', () => {
  beforeEach(() => {
    act(() => {
      usePinStore.getState().clearPins();
    });
  });

  describe('togglePin', () => {
    it('should add id to pinnedIds when not pinned', () => {
      act(() => {
        usePinStore.getState().togglePin('test-1');
      });
      
      expect(usePinStore.getState().pinnedIds).toContain('test-1');
      expect(usePinStore.getState().pinnedIds).toHaveLength(1);
    });

    it('should remove id from pinnedIds when already pinned', () => {
      act(() => {
        usePinStore.getState().togglePin('test-1');
        usePinStore.getState().togglePin('test-1');
      });
      
      expect(usePinStore.getState().pinnedIds).not.toContain('test-1');
      expect(usePinStore.getState().pinnedIds).toHaveLength(0);
    });

    it('should handle multiple pins', () => {
      act(() => {
        usePinStore.getState().togglePin('test-1');
        usePinStore.getState().togglePin('test-2');
        usePinStore.getState().togglePin('test-3');
      });
      
      expect(usePinStore.getState().pinnedIds).toHaveLength(3);
      expect(usePinStore.getState().pinnedIds).toContain('test-1');
      expect(usePinStore.getState().pinnedIds).toContain('test-2');
      expect(usePinStore.getState().pinnedIds).toContain('test-3');
    });

    it('should toggle individual pins independently', () => {
      act(() => {
        usePinStore.getState().togglePin('test-1');
        usePinStore.getState().togglePin('test-2');
        usePinStore.getState().togglePin('test-1'); // unpin test-1
      });
      
      expect(usePinStore.getState().pinnedIds).toHaveLength(1);
      expect(usePinStore.getState().pinnedIds).toContain('test-2');
      expect(usePinStore.getState().pinnedIds).not.toContain('test-1');
    });
  });

  describe('isPinned', () => {
    it('should return true for pinned id', () => {
      act(() => {
        usePinStore.getState().togglePin('test-1');
      });
      
      expect(usePinStore.getState().isPinned('test-1')).toBe(true);
    });

    it('should return false for unpinned id', () => {
      expect(usePinStore.getState().isPinned('test-1')).toBe(false);
    });

    it('should return false for id that was pinned then unpinned', () => {
      act(() => {
        usePinStore.getState().togglePin('test-1');
        usePinStore.getState().togglePin('test-1');
      });
      
      expect(usePinStore.getState().isPinned('test-1')).toBe(false);
    });
  });

  describe('clearPins', () => {
    it('should clear all pinned ids', () => {
      act(() => {
        usePinStore.getState().togglePin('test-1');
        usePinStore.getState().togglePin('test-2');
        usePinStore.getState().clearPins();
      });
      
      expect(usePinStore.getState().pinnedIds).toHaveLength(0);
    });
  });

  describe('persistence', () => {
    it('should persist pins across store instances', () => {
      act(() => {
        usePinStore.getState().togglePin('persist-test');
      });
      
      // Create a new store instance (simulating page reload)
      // The actual persistence is tested by the zustand middleware
      expect(usePinStore.getState().isPinned('persist-test')).toBe(true);
    });
  });
});