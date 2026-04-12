/**
 * 翻译服务导出
 */

export * from './types';
export * from './translation-service';
export { DeepLProvider } from './providers/deepl';
export { GoogleTranslateProvider } from './providers/google';
export { LibreTranslateProvider } from './providers/libretranslate';
export { MyMemoryProvider } from './providers/mymemory';
export { MockProvider } from './providers/mock';

import { TranslationService } from './translation-service';
import { TranslationConfig } from './types';

let translationServiceInstance: TranslationService | null = null;

/**
 * 获取翻译服务单例
 */
export function getTranslationService(config?: TranslationConfig): TranslationService {
  if (!translationServiceInstance) {
    translationServiceInstance = new TranslationService(config);
  }
  return translationServiceInstance;
}
