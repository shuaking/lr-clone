/**
 * 高级词典服务类型定义
 */

export interface DictionaryDefinition {
  partOfSpeech: string; // 词性：noun, verb, adjective 等
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface DictionaryPronunciation {
  text?: string; // 音标文本
  audio?: string; // 音频 URL
  dialect?: string; // 方言：US, UK, AU 等
}

export interface DictionaryExample {
  sentence: string;
  translation?: string;
  source?: string;
}

export interface WordLemma {
  lemma: string; // 原形
  forms: string[]; // 变形：复数、过去式等
}

export interface DictionaryResult {
  word: string;
  phonetic?: string;
  pronunciations: DictionaryPronunciation[];
  definitions: DictionaryDefinition[];
  examples: DictionaryExample[];
  lemma?: WordLemma;
  frequency?: number; // 词频 (0-1)
  sources: string[]; // 数据来源
}

export interface DictionaryProvider {
  name: string;
  lookup(word: string, language: string): Promise<Partial<DictionaryResult>>;
  isAvailable(): Promise<boolean>;
  getSupportedLanguages(): string[];
}

export interface DictionaryConfig {
  // 启用的提供商
  enabledProviders?: string[];

  // 缓存配置
  enableCache?: boolean;
  cacheTTL?: number;

  // 例句数量限制
  maxExamples?: number;
}
