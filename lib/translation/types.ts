/**
 * 翻译服务类型定义
 */

export type TranslationProvider = 'deepl' | 'google' | 'libretranslate' | 'mymemory' | 'mock';

export interface TranslationConfig {
  // DeepL API 配置
  deeplApiKey?: string;
  deeplApiUrl?: string; // 默认: https://api-free.deepl.com/v2

  // Google Translate API 配置
  googleApiKey?: string;

  // LibreTranslate 配置
  libreTranslateUrl?: string; // 默认: https://libretranslate.com
  libreTranslateApiKey?: string; // 可选，某些实例需要

  // 首选翻译服务
  preferredProvider?: TranslationProvider;

  // 是否启用自动降级
  enableFallback?: boolean;
}

export interface TranslationRequest {
  text: string;
  sourceLang: string;
  targetLang: string;
  context?: string; // 上下文，用于提高翻译质量
}

export interface TranslationResult {
  translatedText: string;
  provider: TranslationProvider;
  detectedSourceLang?: string;
  alternatives?: string[]; // 备选翻译
  confidence?: number; // 翻译置信度 (0-1)
}

export interface TranslationError {
  provider: TranslationProvider;
  error: string;
  code?: string;
}

export interface ITranslationProvider {
  name: TranslationProvider;
  translate(request: TranslationRequest): Promise<TranslationResult>;
  isAvailable(): Promise<boolean>;
  getSupportedLanguages(): string[];
}
