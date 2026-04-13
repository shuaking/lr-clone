import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/auth';
import { getCloudSettings, saveCloudSettings } from '@/lib/supabase/settings-sync';

export interface PlayerSettings {
  fontSize: number;
  sidebarWidth: number;
  loopEnabled: boolean;
  knownSentences: Set<string>;
}

interface PlayerSettingsState extends PlayerSettings {
  setFontSize: (size: number) => void;
  setSidebarWidth: (width: number) => void;
  setLoopEnabled: (enabled: boolean) => void;
  markSentenceAsKnown: (sentenceId: string) => void;
  unmarkSentenceAsKnown: (sentenceId: string) => void;
  isSentenceKnown: (sentenceId: string) => boolean;
  resetSettings: () => void;
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
}

const DEFAULT_SETTINGS: PlayerSettings = {
  fontSize: 15,
  sidebarWidth: 420,
  loopEnabled: false,
  knownSentences: new Set(),
};

/**
 * 检查是否应该使用云端存储
 */
async function shouldUseCloud(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const user = await getCurrentUser();
    return user !== null;
  } catch {
    return false;
  }
}

export const usePlayerSettingsStore = create<PlayerSettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setFontSize: (size) => {
        const newSize = Math.max(12, Math.min(24, size));
        set({ fontSize: newSize });
        // 异步同步到云端
        get().syncToCloud().catch(console.error);
      },

      setSidebarWidth: (width) => {
        const newWidth = Math.max(300, Math.min(600, width));
        set({ sidebarWidth: newWidth });
        // 异步同步到云端
        get().syncToCloud().catch(console.error);
      },

      setLoopEnabled: (enabled) => {
        set({ loopEnabled: enabled });
        // 异步同步到云端
        get().syncToCloud().catch(console.error);
      },

      markSentenceAsKnown: (sentenceId) => {
        const knownSentences = new Set(get().knownSentences);
        knownSentences.add(sentenceId);
        set({ knownSentences });
        // 异步同步到云端
        get().syncToCloud().catch(console.error);
      },

      unmarkSentenceAsKnown: (sentenceId) => {
        const knownSentences = new Set(get().knownSentences);
        knownSentences.delete(sentenceId);
        set({ knownSentences });
        // 异步同步到云端
        get().syncToCloud().catch(console.error);
      },

      isSentenceKnown: (sentenceId) => get().knownSentences.has(sentenceId),

      resetSettings: () => {
        set(DEFAULT_SETTINGS);
        // 异步同步到云端
        get().syncToCloud().catch(console.error);
      },

      syncToCloud: async () => {
        if (!(await shouldUseCloud())) return;

        try {
          const state = get();
          await saveCloudSettings({
            fontSize: state.fontSize,
            sidebarWidth: state.sidebarWidth,
            loopEnabled: state.loopEnabled,
            knownSentences: state.knownSentences,
          });
        } catch (error) {
          console.error('Failed to sync settings to cloud:', error);
        }
      },

      loadFromCloud: async () => {
        if (!(await shouldUseCloud())) return;

        try {
          const cloudSettings = await getCloudSettings();
          if (cloudSettings) {
            set({
              fontSize: cloudSettings.fontSize ?? DEFAULT_SETTINGS.fontSize,
              sidebarWidth: cloudSettings.sidebarWidth ?? DEFAULT_SETTINGS.sidebarWidth,
              loopEnabled: cloudSettings.loopEnabled ?? DEFAULT_SETTINGS.loopEnabled,
              knownSentences: Array.isArray(cloudSettings.knownSentences)
                ? new Set(cloudSettings.knownSentences as string[])
                : DEFAULT_SETTINGS.knownSentences,
            });
          }
        } catch (error) {
          console.error('Failed to load settings from cloud:', error);
        }
      },
    }),
    {
      name: 'player-settings-storage',
      partialize: (state) => ({
        fontSize: state.fontSize,
        sidebarWidth: state.sidebarWidth,
        loopEnabled: state.loopEnabled,
        knownSentences: Array.from(state.knownSentences),
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.knownSentences)) {
          state.knownSentences = new Set(state.knownSentences as string[]);
        }
        // 登录后自动从云端加载
        state?.loadFromCloud().catch(console.error);
      },
    }
  )
);
