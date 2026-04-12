/**
 * MyMemory 翻译提供商
 * 免费翻译服务，作为后备方案
 */

import { ITranslationProvider, TranslationRequest, TranslationResult } from '../types';

export class MyMemoryProvider implements ITranslationProvider {
  name = 'mymemory' as const;
  private apiUrl = 'https://api.mymemory.translated.net/get';

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const url = `${this.apiUrl}?q=${encodeURIComponent(request.text)}&langpair=${request.sourceLang}|${request.targetLang}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.responseStatus !== 200 && !data.responseData?.translatedText) {
        throw new Error(data.responseDetails || 'Translation failed');
      }

      return {
        translatedText: data.responseData.translatedText,
        provider: this.name,
        confidence: data.responseData.match || undefined
      };
    } catch (error) {
      console.error('MyMemory error:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}?q=test&langpair=en|zh`,
        { signal: AbortSignal.timeout(5000) }
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  getSupportedLanguages(): string[] {
    return ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'hi', 'th'];
  }
}
