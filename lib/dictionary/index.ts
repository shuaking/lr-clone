/**
 * 词典服务导出
 */

export * from './types';
export * from './dictionary-service';
export { FreeDictionaryProvider } from './providers/free-dictionary';
export { TatoebaProvider } from './providers/tatoeba';
export { LemmatizationProvider } from './providers/lemmatization';

import { DictionaryService } from './dictionary-service';
import { DictionaryConfig } from './types';

let dictionaryServiceInstance: DictionaryService | null = null;

/**
 * 获取词典服务单例
 */
export function getDictionaryService(config?: DictionaryConfig): DictionaryService {
  if (!dictionaryServiceInstance) {
    dictionaryServiceInstance = new DictionaryService(config);
  }
  return dictionaryServiceInstance;
}
