/**
 * Google Translate 翻译提供商
 * 付费翻译服务，支持最多语言
 */

import { ITranslationProvider, TranslationRequest, TranslationResult } from '../types';

export class GoogleTranslateProvider implements ITranslationProvider {
  name = 'google' as const;
  private apiKey: string;
  private apiUrl = 'https://translation.googleapis.com/language/translate/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const url = `${this.apiUrl}?key=${this.apiKey}`;

    const body = {
      q: request.text,
      source: this.mapLanguageCode(request.sourceLang),
      target: this.mapLanguageCode(request.targetLang),
      format: 'text'
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP ${response.status}: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      if (!data.data?.translations || data.data.translations.length === 0) {
        throw new Error('No translation returned');
      }

      const translation = data.data.translations[0];

      return {
        translatedText: translation.translatedText,
        provider: this.name,
        detectedSourceLang: translation.detectedSourceLanguage
      };
    } catch (error) {
      console.error('Google Translate error:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await fetch(
        `${this.apiUrl}/languages?key=${this.apiKey}&target=en`,
        {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        }
      );
      return response.ok;
    } catch (error) {
      console.warn('[GoogleTranslate] Availability check failed:', error);
      return false;
    }
  }

  getSupportedLanguages(): string[] {
    // Google Translate 支持 100+ 语言，这里列出常用的
    return [
      'en', 'zh', 'zh-CN', 'zh-TW', 'ja', 'ko', 'es', 'fr', 'de', 'it',
      'pt', 'ru', 'ar', 'hi', 'th', 'vi', 'id', 'ms', 'tl', 'nl', 'pl',
      'tr', 'uk', 'sv', 'cs', 'ro', 'el', 'da', 'fi', 'bg', 'hu', 'sk',
      'lt', 'lv', 'et', 'sl', 'hr', 'sr', 'ca', 'no', 'he', 'fa', 'ur'
    ];
  }

  private mapLanguageCode(code: string): string {
    const mapping: Record<string, string> = {
      'zh': 'zh-CN',
      'zh-CN': 'zh-CN',
      'zh-TW': 'zh-TW',
      'ja': 'ja',
      'ko': 'ko',
      'en': 'en',
      'es': 'es',
      'fr': 'fr',
      'de': 'de',
      'it': 'it',
      'pt': 'pt',
      'ru': 'ru',
      'ar': 'ar',
      'hi': 'hi',
      'th': 'th',
      'vi': 'vi',
      'id': 'id'
    };
    return mapping[code] || code;
  }
}
