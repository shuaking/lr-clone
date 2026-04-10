import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

const DEFAULT_SETTINGS: PlayerSettings = {
  fontSize: 15,
  sidebarWidth: 420,
  loopEnabled: false,
  knownSentences: new Set(),
};

export const usePlayerSettingsStore = create<PlayerSettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setFontSize: (size) => set({ fontSize: Math.max(12, Math.min(24, size)) }),

      setSidebarWidth: (width) => set({ sidebarWidth: Math.max(300, Math.min(600, width)) }),

      setLoopEnabled: (enabled) => set({ loopEnabled: enabled }),

      markSentenceAsKnown: (sentenceId) => {
        const knownSentences = new Set(get().knownSentences);
        knownSentences.add(sentenceId);
        set({ knownSentences });
      },

      unmarkSentenceAsKnown: (sentenceId) => {
        const knownSentences = new Set(get().knownSentences);
        knownSentences.delete(sentenceId);
        set({ knownSentences });
      },

      isSentenceKnown: (sentenceId) => get().knownSentences.has(sentenceId),

      resetSettings: () => set(DEFAULT_SETTINGS),
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
        if (state && Array.isArray((state as any).knownSentences)) {
          state.knownSentences = new Set((state as any).knownSentences);
        }
      },
    }
  )
);
