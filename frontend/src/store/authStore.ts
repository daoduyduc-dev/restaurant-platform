import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    user: null,
    token: null,
    refreshToken: null,
    setAuth: (user, token, refreshToken) => set({ user, token, refreshToken }),
    logout: () => set({ user: null, token: null, refreshToken: null }),
    isAuthenticated: () => !!get().token,
  })
);
