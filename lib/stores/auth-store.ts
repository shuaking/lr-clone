import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@supabase/supabase-js';
import { getCurrentUser, signIn, signUp, signOut, onAuthStateChange } from '@/lib/supabase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      initialized: false,

      setUser: (user) => set({ user }),

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { user } = await signIn(email, password);
          set({ user, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      register: async (email, password, displayName) => {
        set({ loading: true });
        try {
          const { user } = await signUp(email, password, displayName);
          set({ user, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await signOut();
          set({ user: null, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      initialize: async () => {
        if (get().initialized) return;

        set({ loading: true });
        try {
          const user = await getCurrentUser();
          set({ user, loading: false, initialized: true });

          // 监听认证状态变化
          onAuthStateChange((user) => {
            set({ user });
          });
        } catch (error) {
          set({ loading: false, initialized: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
