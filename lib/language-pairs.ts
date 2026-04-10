/**
 * 语言对配置
 * 支持多种学习语言对组合
 */

export interface LanguagePair {
  id: string;
  sourceCode: string;
  targetCode: string;
  sourceName: string;
  targetName: string;
  flag: string;
}

export const LANGUAGE_PAIRS: LanguagePair[] = [
  // 英语学习
  {
    id: 'en-zh',
    sourceCode: 'en',
    targetCode: 'zh-CN',
    sourceName: 'English',
    targetName: '中文',
    flag: '🇬🇧→🇨🇳',
  },
  {
    id: 'en-ja',
    sourceCode: 'en',
    targetCode: 'ja',
    sourceName: 'English',
    targetName: '日本語',
    flag: '🇬🇧→🇯🇵',
  },
  {
    id: 'en-ko',
    sourceCode: 'en',
    targetCode: 'ko',
    sourceName: 'English',
    targetName: '한국어',
    flag: '🇬🇧→🇰🇷',
  },
  {
    id: 'en-es',
    sourceCode: 'en',
    targetCode: 'es',
    sourceName: 'English',
    targetName: 'Español',
    flag: '🇬🇧→🇪🇸',
  },
  {
    id: 'en-fr',
    sourceCode: 'en',
    targetCode: 'fr',
    sourceName: 'English',
    targetName: 'Français',
    flag: '🇬🇧→🇫🇷',
  },
  {
    id: 'en-de',
    sourceCode: 'en',
    targetCode: 'de',
    sourceName: 'English',
    targetName: 'Deutsch',
    flag: '🇬🇧→🇩🇪',
  },

  // 日语学习
  {
    id: 'ja-zh',
    sourceCode: 'ja',
    targetCode: 'zh-CN',
    sourceName: '日本語',
    targetName: '中文',
    flag: '🇯🇵→🇨🇳',
  },
  {
    id: 'ja-en',
    sourceCode: 'ja',
    targetCode: 'en',
    sourceName: '日本語',
    targetName: 'English',
    flag: '🇯🇵→🇬🇧',
  },
  {
    id: 'ja-ko',
    sourceCode: 'ja',
    targetCode: 'ko',
    sourceName: '日本語',
    targetName: '한국어',
    flag: '🇯🇵→🇰🇷',
  },

  // 韩语学习
  {
    id: 'ko-zh',
    sourceCode: 'ko',
    targetCode: 'zh-CN',
    sourceName: '한국어',
    targetName: '中文',
    flag: '🇰🇷→🇨🇳',
  },
  {
    id: 'ko-en',
    sourceCode: 'ko',
    targetCode: 'en',
    sourceName: '한국어',
    targetName: 'English',
    flag: '🇰🇷→🇬🇧',
  },
  {
    id: 'ko-ja',
    sourceCode: 'ko',
    targetCode: 'ja',
    sourceName: '한국어',
    targetName: '日本語',
    flag: '🇰🇷→🇯🇵',
  },

  // 中文学习
  {
    id: 'zh-en',
    sourceCode: 'zh-CN',
    targetCode: 'en',
    sourceName: '中文',
    targetName: 'English',
    flag: '🇨🇳→🇬🇧',
  },
  {
    id: 'zh-ja',
    sourceCode: 'zh-CN',
    targetCode: 'ja',
    sourceName: '中文',
    targetName: '日本語',
    flag: '🇨🇳→🇯🇵',
  },
  {
    id: 'zh-ko',
    sourceCode: 'zh-CN',
    targetCode: 'ko',
    sourceName: '中文',
    targetName: '한국어',
    flag: '🇨🇳→🇰🇷',
  },

  // 西班牙语学习
  {
    id: 'es-en',
    sourceCode: 'es',
    targetCode: 'en',
    sourceName: 'Español',
    targetName: 'English',
    flag: '🇪🇸→🇬🇧',
  },
  {
    id: 'es-zh',
    sourceCode: 'es',
    targetCode: 'zh-CN',
    sourceName: 'Español',
    targetName: '中文',
    flag: '🇪🇸→🇨🇳',
  },

  // 法语学习
  {
    id: 'fr-en',
    sourceCode: 'fr',
    targetCode: 'en',
    sourceName: 'Français',
    targetName: 'English',
    flag: '🇫🇷→🇬🇧',
  },
  {
    id: 'fr-zh',
    sourceCode: 'fr',
    targetCode: 'zh-CN',
    sourceName: 'Français',
    targetName: '中文',
    flag: '🇫🇷→🇨🇳',
  },

  // 德语学习
  {
    id: 'de-en',
    sourceCode: 'de',
    targetCode: 'en',
    sourceName: 'Deutsch',
    targetName: 'English',
    flag: '🇩🇪→🇬🇧',
  },
  {
    id: 'de-zh',
    sourceCode: 'de',
    targetCode: 'zh-CN',
    sourceName: 'Deutsch',
    targetName: '中文',
    flag: '🇩🇪→🇨🇳',
  },
];

export const DEFAULT_LANGUAGE_PAIR = 'en-zh';

export function getLanguagePair(id: string): LanguagePair | undefined {
  return LANGUAGE_PAIRS.find(pair => pair.id === id);
}

export function getLanguagePairByCode(sourceCode: string, targetCode: string): LanguagePair | undefined {
  return LANGUAGE_PAIRS.find(
    pair => pair.sourceCode === sourceCode && pair.targetCode === targetCode
  );
}
