/**
 * API 配置 Store
 * 管理翻译和词典 API 的配置
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ApiConfig {
  // 翻译 API
  translation: {
    deeplApiKey?: string;
    deeplApiUrl?: string;
    googleApiKey?: string;
    libreTranslateUrl?: string;
    libreTranslateApiKey?: string;
    preferredProvider?: 'deepl' | 'google' | 'libretranslate' | 'mymemory';
    enableFallback: boolean;
  };

  // 词典 API
  dictionary: {
    enabledProviders: string[];
    maxExamples: number;
  };
}

interface ApiConfigStore {
  config: ApiConfig;
  updateTranslationConfig: (config: Partial<ApiConfig['translation']>) => void;
  updateDictionaryConfig: (config: Partial<ApiConfig['dictionary']>) => void;
  resetConfig: () => void;
}

const defaultConfig: ApiConfig = {
  translation: {
    enableFallback: true,
  },
  dictionary: {
    enabledProviders: ['free-dictionary', 'tatoeba', 'lemmatization'],
    maxExamples: 5,
  },
};

export const useApiConfigStore = create<ApiConfigStore>()(
  persist(
    (set) => ({
      config: defaultConfig,

      updateTranslationConfig: (newConfig) =>
        set((state) => ({
          config: {
            ...state.config,
            translation: {
              ...state.config.translation,
              ...newConfig,
            },
          },
        })),

      updateDictionaryConfig: (newConfig) =>
        set((state) => ({
          config: {
            ...state.config,
            dictionary: {
              ...state.config.dictionary,
              ...newConfig,
            },
          },
        })),

      resetConfig: () => set({ config: defaultConfig }),
    }),
    {
      name: 'api-config-storage',
    }
  )
);
