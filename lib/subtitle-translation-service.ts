/**
 * 字幕翻译服务
 * 批量翻译字幕文件
 */

import { getTranslationService } from '@/lib/translation';
import { Subtitle } from '@/hooks/useSubtitles';

export interface SubtitleTranslationProgress {
  total: number;
  completed: number;
  percentage: number;
  currentIndex: number;
}

export interface TranslatedSubtitle extends Subtitle {
  originalText?: string;
  translatedText?: string;
}

export class SubtitleTranslationService {
  private translationService: ReturnType<typeof getTranslationService> | null = null;
  private cache: Map<string, string> = new Map();

  private getTranslationServiceInstance() {
    if (!this.translationService) {
      this.translationService = getTranslationService();
    }
    return this.translationService;
  }

  /**
   * 翻译整个字幕文件
   */
  async translateSubtitles(
    subtitles: Subtitle[],
    sourceLang: string,
    targetLang: string,
    onProgress?: (progress: SubtitleTranslationProgress) => void
  ): Promise<TranslatedSubtitle[]> {
    const results: TranslatedSubtitle[] = [];
    const total = subtitles.length;

    for (let i = 0; i < subtitles.length; i++) {
      const subtitle = subtitles[i];

      // 检查缓存
      const cacheKey = this.getCacheKey(subtitle.text, sourceLang, targetLang);
      let translatedText = this.cache.get(cacheKey);

      if (!translatedText) {
        try {
          // 翻译字幕
          const result = await this.getTranslationServiceInstance().translate({
            text: subtitle.text,
            sourceLang,
            targetLang
          });
          translatedText = result.translatedText;

          // 缓存结果
          this.cache.set(cacheKey, translatedText);

          // 添加小延迟避免 API 限流
          if (i < subtitles.length - 1) {
            await this.delay(100);
          }
        } catch (error) {
          console.error(`Failed to translate subtitle ${i}:`, error);
          translatedText = subtitle.text; // 失败时使用原文
        }
      }

      results.push({
        ...subtitle,
        originalText: subtitle.text,
        translatedText,
        translation: translatedText
      });

      // 报告进度
      if (onProgress) {
        onProgress({
          total,
          completed: i + 1,
          percentage: Math.round(((i + 1) / total) * 100),
          currentIndex: i
        });
      }
    }

    return results;
  }

  /**
   * 批量翻译（分批处理，避免一次性请求过多）
   */
  async translateSubtitlesBatch(
    subtitles: Subtitle[],
    sourceLang: string,
    targetLang: string,
    batchSize: number = 10,
    onProgress?: (progress: SubtitleTranslationProgress) => void
  ): Promise<TranslatedSubtitle[]> {
    const results: TranslatedSubtitle[] = [];
    const total = subtitles.length;

    for (let i = 0; i < subtitles.length; i += batchSize) {
      const batch = subtitles.slice(i, i + batchSize);

      // 并行翻译当前批次
      const batchPromises = batch.map(async (subtitle, batchIndex) => {
        const cacheKey = this.getCacheKey(subtitle.text, sourceLang, targetLang);
        let translatedText = this.cache.get(cacheKey);

        if (!translatedText) {
          try {
            const result = await this.getTranslationServiceInstance().translate({
              text: subtitle.text,
              sourceLang,
              targetLang
            });
            translatedText = result.translatedText;
            this.cache.set(cacheKey, translatedText);
          } catch (error) {
            console.error(`Failed to translate subtitle ${i + batchIndex}:`, error);
            translatedText = subtitle.text;
          }
        }

        return {
          ...subtitle,
          originalText: subtitle.text,
          translatedText,
          translation: translatedText
        };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // 报告进度
      if (onProgress) {
        onProgress({
          total,
          completed: results.length,
          percentage: Math.round((results.length / total) * 100),
          currentIndex: results.length - 1
        });
      }

      // 批次间延迟
      if (i + batchSize < subtitles.length) {
        await this.delay(500);
      }
    }

    return results;
  }

  /**
   * 保存翻译后的字幕到 localStorage
   */
  saveTranslatedSubtitles(videoId: string, subtitles: TranslatedSubtitle[]) {
    try {
      const key = `translated_subtitles_${videoId}`;
      localStorage.setItem(key, JSON.stringify(subtitles));
    } catch (error) {
      console.error('Failed to save translated subtitles:', error);
    }
  }

  /**
   * 从 localStorage 加载翻译后的字幕
   */
  loadTranslatedSubtitles(videoId: string): TranslatedSubtitle[] | null {
    try {
      const key = `translated_subtitles_${videoId}`;
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load translated subtitles:', error);
    }
    return null;
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * 清除特定视频的翻译字幕
   */
  clearTranslatedSubtitles(videoId: string) {
    try {
      const key = `translated_subtitles_${videoId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear translated subtitles:', error);
    }
  }

  private getCacheKey(text: string, sourceLang: string, targetLang: string): string {
    return `${sourceLang}:${targetLang}:${text}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 单例实例
let subtitleTranslationServiceInstance: SubtitleTranslationService | null = null;

export function getSubtitleTranslationService(): SubtitleTranslationService {
  if (!subtitleTranslationServiceInstance) {
    subtitleTranslationServiceInstance = new SubtitleTranslationService();
  }
  return subtitleTranslationServiceInstance;
}
