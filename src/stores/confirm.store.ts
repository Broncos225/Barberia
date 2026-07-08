import { create } from 'zustand';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

interface ConfirmState {
  open: boolean;
  options: ConfirmOptions;
  resolve: ((v: boolean) => void) | null;
  ask: (options: ConfirmOptions) => Promise<boolean>;
  close: (value: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
  open: false,
  options: { title: '' },
  resolve: null,
  ask: (options) =>
    new Promise<boolean>((resolve) => {
      set({ open: true, options, resolve });
    }),
  close: (value) =>
    set((state) => {
      state.resolve?.(value);
      return { open: false, options: { title: '' }, resolve: null };
    }),
}));

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return useConfirmStore.getState().ask(options);
}
