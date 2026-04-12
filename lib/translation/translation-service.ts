/**
 * 翻译服务主类
 * 管理多个翻译提供商，实现自动降级和缓存
 */

import { TranslationConfig, TranslationRequest, TranslationResult, TranslationError, ITranslationProvider } from './types';
import { DeepLProvider } from './providers/deepl';
import { GoogleTranslateProvider } from './providers/google';
import { LibreTranslateProvider } from './providers/libretranslate';
import { MyMemoryProvider } from './providers/mymemory';
import { MockProvider } from './providers/mock';

export class TranslationService {
  private providers: ITranslationProvider[] = [];
  private config: TranslationConfig;
  private cache: Map<string, TranslationResult> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 hour

  constructor(config: TranslationConfig = {}) {
    this.config = {
      enableFallback: true,
      ...config
    };
    this.initializeProviders();
  }

  private initializeProviders() {
    const providers: ITranslationProvider[] = [];

    // 开发环境使用 Mock
    if (process.env.NODE_ENV === 'development' && !this.config.preferredProvider) {
      providers.push(new MockProvider());
    }

    // 根据配置添加付费提供商
    if (this.config.deeplApiKey) {
      providers.push(new DeepLProvider(
        this.config.deeplApiKey,
        this.config.deeplApiUrl
      ));
    }

    if (this.config.googleApiKey) {
      providers.push(new GoogleTranslateProvider(this.config.googleApiKey));
    }

    // 添加免费提供商
    providers.push(new LibreTranslateProvider(
      this.config.libreTranslateUrl,
      this.config.libreTranslateApiKey
    ));

    providers.push(new MyMemoryProvider());

    // 如果有首选提供商，将其移到最前面
    if (this.config.preferredProvider) {
      const preferredIndex = providers.findIndex(
        p => p.name === this.config.preferredProvider
      );
      if (preferredIndex > 0) {
        const [preferred] = providers.splice(preferredIndex, 1);
        providers.unshift(preferred);
      }
    }

    this.providers = providers;
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    // 检查缓存
    const cacheKey = this.getCacheKey(request);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const errors: TranslationError[] = [];

    // 尝试每个提供商
    for (const provider of this.providers) {
      try {
        // 检查提供商是否支持该语言对
        const supportedLangs = provider.getSupportedLanguages();
        if (!supportedLangs.includes(request.sourceLang) ||
            !supportedLangs.includes(request.targetLang)) {
          continue;
        }

        const result = await provider.translate(request);

        // 缓存结果
        this.cache.set(cacheKey, result);
        setTimeout(() => this.cache.delete(cacheKey), this.CACHE_TTL);

        return result;
      } catch (error) {
        errors.push({
          provider: provider.name,
          error: error instanceof Error ? error.message : String(error)
        });

        // 如果禁用了降级，直接抛出错误
        if (!this.config.enableFallback) {
          throw error;
        }

        // 否则继续尝试下一个提供商
        console.warn(`Translation failed with ${provider.name}, trying next provider...`);
      }
    }

    // 所有提供商都失败了
    throw new Error(
      `All translation providers failed. Errors: ${errors.map(e => `${e.provider}: ${e.error}`).join('; ')}`
    );
  }

  async translateBatch(requests: TranslationRequest[]): Promise<TranslationResult[]> {
    return Promise.all(requests.map(req => this.translate(req)));
  }

  async checkAvailability(): Promise<Record<string, boolean>> {
    const availability: Record<string, boolean> = {};

    await Promise.all(
      this.providers.map(async (provider) => {
        availability[provider.name] = await provider.isAvailable();
      })
    );

    return availability;
  }

  updateConfig(config: Partial<TranslationConfig>) {
    this.config = { ...this.config, ...config };
    this.initializeProviders();
  }

  clearCache() {
    this.cache.clear();
  }

  private getCacheKey(request: TranslationRequest): string {
    return `${request.sourceLang}:${request.targetLang}:${request.text}`;
  }
}

// 单例实例
let translationServiceInstance: TranslationService | null = null;

export function getTranslationService(config?: TranslationConfig): TranslationService {
  if (!translationServiceInstance) {
    translationServiceInstance = new TranslationService(config);
  } else if (config) {
    translationServiceInstance.updateConfig(config);
  }
  return translationServiceInstance;
}
