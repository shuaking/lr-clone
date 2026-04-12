/**
 * Free Dictionary API 提供商
 * 提供英语单词的定义、音标、发音音频
 */

import { DictionaryProvider, DictionaryResult, DictionaryDefinition, DictionaryPronunciation } from '../types';

export class FreeDictionaryProvider implements DictionaryProvider {
  name = 'free-dictionary';
  private apiUrl = 'https://api.dictionaryapi.dev/api/v2/entries';

  async lookup(word: string, language: string): Promise<Partial<DictionaryResult>> {
    // Free Dictionary API 目前只支持英语
    if (language !== 'en') {
      return {};
    }

    try {
      const response = await fetch(`${this.apiUrl}/${language}/${encodeURIComponent(word)}`);

      if (!response.ok) {
        if (response.status === 404) {
          return {}; // 单词未找到
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        return {};
      }

      const entry = data[0];
      const definitions: DictionaryDefinition[] = [];
      const pronunciations: DictionaryPronunciation[] = [];

      // 提取音标和发音
      if (entry.phonetics && Array.isArray(entry.phonetics)) {
        for (const phonetic of entry.phonetics) {
          if (phonetic.text || phonetic.audio) {
            pronunciations.push({
              text: phonetic.text,
              audio: phonetic.audio,
              dialect: this.detectDialect(phonetic.audio)
            });
          }
        }
      }

      // 提取定义
      if (entry.meanings && Array.isArray(entry.meanings)) {
        for (const meaning of entry.meanings) {
          if (meaning.definitions && Array.isArray(meaning.definitions)) {
            for (const def of meaning.definitions) {
              definitions.push({
                partOfSpeech: meaning.partOfSpeech || 'unknown',
                definition: def.definition,
                example: def.example,
                synonyms: def.synonyms || [],
                antonyms: def.antonyms || []
              });
            }
          }
        }
      }

      return {
        word: entry.word,
        phonetic: entry.phonetic,
        pronunciations,
        definitions,
        sources: [this.name]
      };
    } catch (error) {
      console.error('Free Dictionary API error:', error);
      return {};
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/en/hello`, {
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getSupportedLanguages(): string[] {
    return ['en'];
  }

  private detectDialect(audioUrl?: string): string | undefined {
    if (!audioUrl) return undefined;
    if (audioUrl.includes('-us.')) return 'US';
    if (audioUrl.includes('-uk.')) return 'UK';
    if (audioUrl.includes('-au.')) return 'AU';
    return undefined;
  }
}
