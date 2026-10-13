import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PinState {
  pinnedIds: string[];
  togglePin: (id: string) => void;
  isPinned: (id: string) => boolean;
  clearPins: () => void;
}

export const usePinStore = create<PinState>()(
  persist(
    (set, get) => ({
      pinnedIds: [],
      togglePin: (id: string) =>
        set((state) => ({
          pinnedIds: state.pinnedIds.includes(id)
            ? state.pinnedIds.filter((pinnedId) => pinnedId !== id)
            : [...state.pinnedIds, id],
        })),
      isPinned: (id: string) => get().pinnedIds.includes(id),
      clearPins: () => set({ pinnedIds: [] }),
    }),
    {
      name: 'assignment-pins',
    }
  )
);