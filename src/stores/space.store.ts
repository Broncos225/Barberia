import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Espacio } from '@/types';

interface SpaceState {
  current: Espacio | null;
  setCurrent: (espacio: Espacio) => void;
  clear: () => void;
}

export const useSpaceStore = create<SpaceState>()(
  persist(
    (set) => ({
      current: null,
      setCurrent: (espacio) => set({ current: espacio }),
      clear: () => set({ current: null }),
    }),
    { name: 'barberia-space' },
  ),
);
