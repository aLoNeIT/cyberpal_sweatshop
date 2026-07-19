import { create } from 'zustand';
import { authApi } from '../api/auth';

interface User {
  id: number;
  email: string;
  display_name: string;
  theme_pref: string;
  auto_archive_enabled: boolean;
  auto_archive_days: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  /** 初始化：从 localStorage 恢复 token，调 /me 验证 */
  init: () => Promise<void>;
  /** 登录：调 API，存 token + user */
  login: (email: string, password: string) => Promise<void>;
  /** 注册：调 API，存 token + user */
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  /** 登出：清 token + user */
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,
  loading: false,

  init: async () => {
    const token = get().token;
    if (!token) return;
    try {
      set({ loading: true });
      const res = await authApi.me();
      set({ user: res.data.user, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await authApi.login(email, password);
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    set({ token, user });
  },

  register: async (email, password, displayName) => {
    const res = await authApi.register(email, password, displayName);
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },
}));
