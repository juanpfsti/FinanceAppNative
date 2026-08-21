import { create } from 'zustand';
import { Storage } from '../utils/storage';

export type Role = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  photoUrl?: string;
  customCategories?: string[];
  pushNotifications?: boolean;
  weeklySummaries?: boolean;
  expenseAlerts?: boolean;
  language?: string;
  currency?: string;
}

export const DEFAULT_USER: User = {
  id: 'local_user',
  email: 'usuario@financeapp.com',
  name: 'Usuário',
  role: 'user',
  pushNotifications: true,
  weeklySummaries: true,
  expenseAlerts: true,
  language: 'pt',
  currency: 'BRL',
  customCategories: [],
};

interface AuthState {
  user: User;
  isLoading: boolean;
  _initialized: boolean;
  initSession: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<User>) => Promise<void>;
  addCustomCategory: (categoryName: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEFAULT_USER,
  isLoading: false,
  _initialized: false,

  initSession: async () => {
    // Only run once
    if (get()._initialized) return;
    set({ _initialized: true });

    try {
      const session = await Storage.getItem('@session');
      if (session) {
        const parsed = JSON.parse(session);
        // Merge with defaults so new fields are always present
        set({ user: { ...DEFAULT_USER, ...parsed } });
      } else {
        // First time: persist default user
        await Storage.setItem('@session', JSON.stringify(DEFAULT_USER));
      }
    } catch (e) {
      console.error('Erro ao recuperar sessão local:', e);
    }
  },

  updateProfile: async (updatedData) => {
    const currentUser = get().user;
    const newUser = { ...currentUser, ...updatedData };
    set({ user: newUser });
    await Storage.setItem('@session', JSON.stringify(newUser));
  },

  addCustomCategory: async (categoryName) => {
    const currentUser = get().user;
    const currentCategories = currentUser.customCategories || [];
    if (currentCategories.includes(categoryName)) return;

    const updatedCategories = [...currentCategories, categoryName];
    await get().updateProfile({ customCategories: updatedCategories });
  },

  updatePassword: async (_newPassword) => {
    // No-op without Firebase auth
  },

  deleteAccount: async () => {
    await Storage.removeItem('@session');
    await Storage.removeItem('@transactions');
    set({ user: DEFAULT_USER });
  },

  logout: async () => {
    await Storage.setItem('@session', JSON.stringify(DEFAULT_USER));
    set({ user: DEFAULT_USER });
  },
}));