/**
 * Mock 翻译提供商
 * 用于开发和测试环境
 */

import { ITranslationProvider, TranslationRequest, TranslationResult } from '../types';

export class MockProvider implements ITranslationProvider {
  name = 'mock' as const;

  async translate(request: TranslationRequest): Promise<TranslationResult> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      translatedText: `[${request.text} 的翻译]`,
      provider: this.name,
      detectedSourceLang: request.sourceLang,
      alternatives: [
        `[${request.text} 的备选翻译 1]`,
        `[${request.text} 的备选翻译 2]`
      ],
      confidence: 0.85
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getSupportedLanguages(): string[] {
    return ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'pt', 'ru'];
  }
}
