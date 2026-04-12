/**
 * DeepL 翻译提供商
 * 高质量付费翻译服务
 */

import { ITranslationProvider, TranslationRequest, TranslationResult } from '../types';

export class DeepLProvider implements ITranslationProvider {
  name = 'deepl' as const;
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl?: string) {
    this.apiKey = apiKey;
    // 免费版使用 api-free.deepl.com，付费版使用 api.deepl.com
    this.apiUrl = apiUrl || 'https://api-free.deepl.com/v2';
  }

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    const url = `${this.apiUrl}/translate`;

    const params = new URLSearchParams({
      auth_key: this.apiKey,
      text: request.text,
      source_lang: this.mapLanguageCode(request.sourceLang).toUpperCase(),
      target_lang: this.mapLanguageCode(request.targetLang).toUpperCase(),
    });

    if (request.context) {
      params.append('context', request.context);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.translations || data.translations.length === 0) {
        throw new Error('No translation returned');
      }

      const translation = data.translations[0];

      return {
        translatedText: translation.text,
        provider: this.name,
        detectedSourceLang: translation.detected_source_language?.toLowerCase()
      };
    } catch (error) {
      console.error('DeepL error:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await fetch(`${this.apiUrl}/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `auth_key=${this.apiKey}`,
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
      'nl', 'pl', 'tr', 'id', 'uk', 'sv', 'cs', 'ro', 'el', 'da',
      'fi', 'bg', 'hu', 'sk', 'lt', 'lv', 'et', 'sl'
    ];
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
      'pt': 'pt-PT',
      'pt-BR': 'pt-BR',
      'ru': 'ru',
      'nl': 'nl',
      'pl': 'pl',
      'tr': 'tr',
      'id': 'id',
      'uk': 'uk',
      'sv': 'sv'
    };
    return mapping[code] || code;
  }
}
