'use client';

import { create } from 'zustand';

type ServerStatusState = {
  unavailable: boolean;
  markUnavailable: () => void;
  markOnline: () => void;
};

export const useServerStatus = create<ServerStatusState>((set) => ({
  unavailable: false,
  markUnavailable: () => set((state) => (state.unavailable ? state : { unavailable: true })),
  markOnline: () => set((state) => (state.unavailable ? { unavailable: false } : state)),
}));
