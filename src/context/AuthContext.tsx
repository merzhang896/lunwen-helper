import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RewriteMode, RewritePreset } from '../lib/types';
import { authApi, userApi } from '../services/api';

interface User {
  id: number;
  email: string;
  nickname: string;
  avatar?: string;
}

interface Membership {
  level: 'free' | 'standard' | 'professional';
  expireDate?: string;
  points: number;
}

// 历史记录项
export interface HistoryItem {
  id: string;
  type: 'rewrite' | 'reduce-ai';
  mode: RewriteMode;
  preset?: RewritePreset;
  inputText: string;
  outputText: string;
  aiRate?: number;
  pointsCost: number;
  createdAt: string;
}

// 收藏项
export interface FavoriteItem {
  id: string;
  type: 'rewrite' | 'reduce-ai';
  mode: RewriteMode;
  preset?: RewritePreset;
  inputText: string;
  outputText: string;
  aiRate?: number;
  title: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  membership: Membership;
  isAuthenticated: boolean;
  history: HistoryItem[];
  favorites: FavoriteItem[];
  loading: boolean;
  // 方法
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, nickname: string, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateMembership: (level: Membership['level'], days: number) => void;
  deductPoints: (amount: number) => Promise<boolean>;
  addPoints: (amount: number) => Promise<void>;
  // 历史记录（从服务器同步）
  syncHistory: () => Promise<void>;
  addHistory: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => void;
  deleteHistory: (id: string) => void;
  clearHistory: () => void;
  // 收藏（从服务器同步）
  syncFavorites: () => Promise<void>;
  addFavorite: (item: Omit<FavoriteItem, 'id' | 'createdAt'>) => Promise<boolean>;
  deleteFavorite: (id: string) => void;
  isFavorited: (inputText: string) => boolean;
  // 初始化
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      membership: {
        level: 'free',
        points: 0,
      },
      isAuthenticated: false,
      history: [
        {
          id: '1',
          type: 'rewrite' as const,
          mode: 'basic' as const,
          preset: 'academic' as const,
          inputText: '人工智能在教育领域的应用越来越广泛，它可以帮助教师更好地了解学生的学习情况，提供个性化的学习方案。',
          outputText: '人工智能技术在教育领域的应用正变得日益广泛，这项技术能够协助教师更为全面地掌握学生的学习状况，并据此提供具有个性化特点的学习方案。',
          pointsCost: 1,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'reduce-ai' as const,
          mode: 'basic' as const,
          inputText: '人工智能在医疗领域的应用前景非常广阔，它可以帮助医生进行疾病诊断，提高诊断的准确性和效率。',
          outputText: '在医疗领域，人工智能技术展现出了极为广阔的应用前景。借助这一技术，医生能够更有效地进行疾病诊断，从而显著提升诊断的准确性与效率。',
          aiRate: 15,
          pointsCost: 1,
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        }
      ],
      favorites: [],
      loading: false,

      // 初始化 - 检查登录状态
      init: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
          const { user } = await authApi.getMe();
          set({
            user,
            membership: {
              level: user.level,
              expireDate: user.expireDate,
              points: user.points,
            },
            isAuthenticated: true,
          });

          // 同步历史和收藏
          get().syncHistory();
          get().syncFavorites();
        } catch (error) {
          localStorage.removeItem('token');
          console.error('初始化失败:', error);
        }
      },

      login: async (email: string, password: string) => {
        set({ loading: true });
        try {
          const { token, user } = await authApi.login(email, password);
          localStorage.setItem('token', token);
          set({
            user,
            membership: {
              level: user.level,
              expireDate: user.expireDate,
              points: user.points,
            },
            isAuthenticated: true,
            loading: false,
          });

          // 同步历史和收藏
          get().syncHistory();
          get().syncFavorites();

          return { success: true };
        } catch (error: any) {
          set({ loading: false });
          return { success: false, error: error.message || '登录失败' };
        }
      },

      register: async (email: string, password: string, nickname: string, code: string) => {
        set({ loading: true });
        try {
          const { token, user } = await authApi.register(email, password, nickname, code);
          localStorage.setItem('token', token);
          set({
            user,
            membership: {
              level: user.level,
              expireDate: user.expireDate,
              points: user.points,
            },
            isAuthenticated: true,
            loading: false,
          });
          return { success: true };
        } catch (error: any) {
          set({ loading: false });
          return { success: false, error: error.message || '注册失败' };
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({
          user: null,
          isAuthenticated: false,
          membership: { level: 'free', points: 0 },
          history: [],
          favorites: [],
        });
      },

      refreshUser: async () => {
        try {
          const { user } = await authApi.getMe();
          set({
            user,
            membership: {
              level: user.level,
              expireDate: user.expireDate,
              points: user.points,
            },
          });
        } catch (error) {
          console.error('刷新用户信息失败:', error);
        }
      },

      updateMembership: (level: Membership['level'], days: number) => {
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + days);
        set(state => ({
          membership: {
            ...state.membership,
            level,
            expireDate: expireDate.toISOString(),
          },
        }));
      },

      deductPoints: async (amount: number) => {
        const { membership } = get();
        if (membership.points < amount) {
          return false;
        }
        try {
          await userApi.deductPoints(amount);
          set(state => ({
            membership: { ...state.membership, points: state.membership.points - amount },
          }));
          return true;
        } catch (error) {
          console.error('扣减积分失败:', error);
          // 如果API调用失败，前端先扣减（乐观更新）
          set(state => ({
            membership: { ...state.membership, points: state.membership.points - amount },
          }));
          return true;
        }
      },

      addPoints: async (amount: number) => {
        try {
          await userApi.addPoints(amount);
          set(state => ({
            membership: { ...state.membership, points: state.membership.points + amount },
          }));
        } catch (error) {
          console.error('增加积分失败:', error);
        }
      },

      // 同步历史记录
      syncHistory: async () => {
        try {
          const { history } = await userApi.getHistory(100, 0);
          set({ history: history.map((h: any) => ({
            ...h,
            id: String(h.id),
          }))});
        } catch (error) {
          console.error('同步历史失败:', error);
        }
      },

      addHistory: (item) => {
        // 本地添加（后端也会记录）
        const newItem: HistoryItem = {
          ...item,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        set(state => ({
          history: [newItem, ...state.history].slice(0, 100),
        }));
      },

      deleteHistory: (id) => {
        set(state => ({
          history: state.history.filter(h => h.id !== id),
        }));
        // 异步删除服务器记录
        userApi.deleteHistory(id).catch(console.error);
      },

      clearHistory: () => {
        set({ history: [] });
        userApi.clearHistory().catch(console.error);
      },

      // 同步收藏
      syncFavorites: async () => {
        try {
          const { favorites } = await userApi.getFavorites();
          set({ favorites: favorites.map((f: any) => ({
            ...f,
            id: String(f.id),
          }))});
        } catch (error) {
          console.error('同步收藏失败:', error);
        }
      },

      addFavorite: async (item) => {
        const { favorites, isFavorited } = get();
        if (isFavorited(item.inputText)) {
          return false;
        }
        try {
          await userApi.addFavorite({
            type: item.type,
            mode: item.mode,
            preset: item.preset,
            title: item.title,
            inputText: item.inputText,
            outputText: item.outputText,
            aiRate: item.aiRate,
          });
          const newItem: FavoriteItem = {
            ...item,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          };
          set({ favorites: [newItem, ...favorites] });
          return true;
        } catch (error: any) {
          console.error('添加收藏失败:', error);
          // 即使服务器失败，本地也添加
          const newItem: FavoriteItem = {
            ...item,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
          };
          set({ favorites: [newItem, ...favorites] });
          return true;
        }
      },

      deleteFavorite: (id) => {
        set(state => ({
          favorites: state.favorites.filter(f => f.id !== id),
        }));
        userApi.deleteFavorite(id).catch(console.error);
      },

      isFavorited: (inputText) => {
        return get().favorites.some(f => f.inputText === inputText);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // 只持久化这些字段
        user: state.user,
        membership: state.membership,
        isAuthenticated: state.isAuthenticated,
      }),
      // 从 localStorage 恢复时，确保 membership 不为 null
      merge: (persistedState: any, currentState) => {
        const persisted = persistedState as Partial<AuthState>;
        return {
          ...currentState,
          ...persisted,
          membership: persisted.membership ?? { level: 'free', points: 0 },
        };
      },
    }
  )
);
