import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_LANGUAGE_PAIR, getLanguagePair, type LanguagePair } from '@/lib/language-pairs';

interface LanguagePairState {
  currentPairId: string;
  currentPair: LanguagePair;

  // Actions
  setLanguagePair: (pairId: string) => void;
}

export const useLanguagePairStore = create<LanguagePairState>()(
  persist(
    (set) => ({
      currentPairId: DEFAULT_LANGUAGE_PAIR,
      currentPair: getLanguagePair(DEFAULT_LANGUAGE_PAIR)!,

      setLanguagePair: (pairId: string) => {
        const pair = getLanguagePair(pairId);
        if (pair) {
          set({ currentPairId: pairId, currentPair: pair });
        }
      },
    }),
    {
      name: 'language-pair-storage',
      partialize: (state) => ({ currentPairId: state.currentPairId }),
    }
  )
);
