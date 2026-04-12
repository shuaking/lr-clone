/**
 * Tatoeba 例句提供商
 * 提供多语言真实例句
 */

import { DictionaryProvider, DictionaryResult, DictionaryExample } from '../types';

export class TatoebaProvider implements DictionaryProvider {
  name = 'tatoeba';
  private apiUrl = 'https://tatoeba.org/en/api_v0/search';

  async lookup(word: string, language: string): Promise<Partial<DictionaryResult>> {
    try {
      // 搜索包含该单词的句子
      const params = new URLSearchParams({
        from: language,
        query: word,
        sort: 'relevance',
        limit: '10'
      });

      const response = await fetch(`${this.apiUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return {};
      }

      const examples: DictionaryExample[] = [];

      for (const result of data.results) {
        if (result.text) {
          const example: DictionaryExample = {
            sentence: result.text,
            source: 'Tatoeba'
          };

          // 如果有翻译，添加翻译
          if (result.translations && result.translations.length > 0) {
            const translation = result.translations[0];
            if (translation && translation.text) {
              example.translation = translation.text;
            }
          }

          examples.push(example);
        }
      }

      return {
        examples,
        sources: [this.name]
      };
    } catch (error) {
      console.error('Tatoeba API error:', error);
      return {};
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}?query=hello&limit=1`, {
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getSupportedLanguages(): string[] {
    return [
      'en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru',
      'ar', 'hi', 'th', 'vi', 'id', 'tr', 'nl', 'pl', 'sv', 'cs'
    ];
  }
}
