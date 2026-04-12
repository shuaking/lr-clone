/**
 * 词典服务主类
 * 聚合多个词典提供商的数据
 */

import { DictionaryConfig, DictionaryResult, DictionaryProvider } from './types';
import { FreeDictionaryProvider } from './providers/free-dictionary';
import { TatoebaProvider } from './providers/tatoeba';
import { LemmatizationProvider } from './providers/lemmatization';

export class DictionaryService {
  private providers: DictionaryProvider[] = [];
  private config: DictionaryConfig;
  private cache: Map<string, DictionaryResult> = new Map();
  private readonly CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

  constructor(config: DictionaryConfig = {}) {
    this.config = {
      enableCache: true,
      cacheTTL: this.CACHE_TTL,
      maxExamples: 5,
      ...config
    };
    this.initializeProviders();
  }

  private initializeProviders() {
    const providers: DictionaryProvider[] = [];

    // 添加所有提供商
    providers.push(new FreeDictionaryProvider());
    providers.push(new TatoebaProvider());
    providers.push(new LemmatizationProvider());

    // 根据配置过滤
    if (this.config.enabledProviders && this.config.enabledProviders.length > 0) {
      this.providers = providers.filter(p =>
        this.config.enabledProviders!.includes(p.name)
      );
    } else {
      this.providers = providers;
    }
  }

  async lookup(word: string, language: string): Promise<DictionaryResult> {
    // 检查缓存
    const cacheKey = `${language}:${word.toLowerCase()}`;
    if (this.config.enableCache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // 并行查询所有提供商
    const results = await Promise.allSettled(
      this.providers.map(provider => provider.lookup(word, language))
    );

    // 聚合结果
    const aggregated = this.aggregateResults(word, results);

    // 限制例句数量
    if (aggregated.examples.length > this.config.maxExamples!) {
      aggregated.examples = aggregated.examples.slice(0, this.config.maxExamples);
    }

    // 缓存结果
    if (this.config.enableCache) {
      this.cache.set(cacheKey, aggregated);
      setTimeout(() => this.cache.delete(cacheKey), this.config.cacheTTL!);
    }

    return aggregated;
  }

  private aggregateResults(
    word: string,
    results: PromiseSettledResult<Partial<DictionaryResult>>[]
  ): DictionaryResult {
    const aggregated: DictionaryResult = {
      word,
      pronunciations: [],
      definitions: [],
      examples: [],
      sources: []
    };

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const data = result.value;

        // 合并音标
        if (data.phonetic && !aggregated.phonetic) {
          aggregated.phonetic = data.phonetic;
        }

        // 合并发音
        if (data.pronunciations) {
          aggregated.pronunciations.push(...data.pronunciations);
        }

        // 合并定义
        if (data.definitions) {
          aggregated.definitions.push(...data.definitions);
        }

        // 合并例句
        if (data.examples) {
          aggregated.examples.push(...data.examples);
        }

        // 合并词形变化
        if (data.lemma && !aggregated.lemma) {
          aggregated.lemma = data.lemma;
        }

        // 合并词频
        if (data.frequency && !aggregated.frequency) {
          aggregated.frequency = data.frequency;
        }

        // 合并来源
        if (data.sources) {
          aggregated.sources.push(...data.sources);
        }
      }
    }

    // 去重
    aggregated.sources = [...new Set(aggregated.sources)];

    // 去重发音（基于音频 URL）
    const seenAudio = new Set<string>();
    aggregated.pronunciations = aggregated.pronunciations.filter(p => {
      if (!p.audio) return true;
      if (seenAudio.has(p.audio)) return false;
      seenAudio.add(p.audio);
      return true;
    });

    // 去重例句（基于句子文本）
    const seenSentences = new Set<string>();
    aggregated.examples = aggregated.examples.filter(ex => {
      const key = ex.sentence.toLowerCase();
      if (seenSentences.has(key)) return false;
      seenSentences.add(key);
      return true;
    });

    return aggregated;
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

  updateConfig(config: Partial<DictionaryConfig>) {
    this.config = { ...this.config, ...config };
    this.initializeProviders();
  }

  clearCache() {
    this.cache.clear();
  }
}

// 单例实例
let dictionaryServiceInstance: DictionaryService | null = null;

export function getDictionaryService(config?: DictionaryConfig): DictionaryService {
  if (!dictionaryServiceInstance) {
    dictionaryServiceInstance = new DictionaryService(config);
  } else if (config) {
    dictionaryServiceInstance.updateConfig(config);
  }
  return dictionaryServiceInstance;
}
