import { create } from 'zustand';
import { apiClient } from '@/src/services/api';
import type { User } from '@/src/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: false,
  isLoading: true,

  login: async (token: string) => {
    localStorage.setItem('token', token);
    set({ token });

    try {
      const user = await apiClient.get<User, User>('/auth/me');
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const user = await apiClient.get<User, User>('/auth/me');
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user: User) => set({ user }),
}));
