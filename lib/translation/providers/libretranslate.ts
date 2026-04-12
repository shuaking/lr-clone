/**
 * LibreTranslate 翻译提供商
 * 开源免费翻译服务
 */

import { ITranslationProvider, TranslationRequest, TranslationResult } from '../types';

export class LibreTranslateProvider implements ITranslationProvider {
  name = 'libretranslate' as const;
  private apiUrl: string;
  private apiKey?: string;

  constructor(apiUrl?: string, apiKey?: string) {
    this.apiUrl = apiUrl || 'https://libretranslate.com';
    this.apiKey = apiKey;
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const url = `${this.apiUrl}/translate`;

    const body: any = {
      q: request.text,
      source: this.mapLanguageCode(request.sourceLang),
      target: this.mapLanguageCode(request.targetLang),
      format: 'text'
    };

    if (this.apiKey) {
      body.api_key = this.apiKey;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        translatedText: data.translatedText,
        provider: this.name,
        detectedSourceLang: data.detectedLanguage?.language
      };
    } catch (error) {
      console.error('LibreTranslate error:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/languages`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getSupportedLanguages(): string[] {
    return ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'hi'];
  }

  private mapLanguageCode(code: string): string {
    const mapping: Record<string, string> = {
      'zh': 'zh',
      'zh-CN': 'zh',
      'zh-TW': 'zh',
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
      'hi': 'hi'
    };
    return mapping[code] || code;
  }
}
