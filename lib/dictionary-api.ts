/**
 * 词典 API 集成
 * 使用免费的翻译 API
 */

import { getLanguagePair, DEFAULT_LANGUAGE_PAIR } from './language-pairs';

export interface DictionaryResult {
  word: string;
  translation: string;
  phonetic?: string;
  definitions?: string[];
  examples?: string[];
}

/**
 * 获取当前语言对配置
 */
function getCurrentLanguagePair() {
  if (typeof window === 'undefined') {
    return getLanguagePair(DEFAULT_LANGUAGE_PAIR)!;
  }

  try {
    const stored = localStorage.getItem('language-pair-storage');
    if (stored) {
      const data = JSON.parse(stored);
      const pairId = data.state?.currentPairId || DEFAULT_LANGUAGE_PAIR;
      return getLanguagePair(pairId) || getLanguagePair(DEFAULT_LANGUAGE_PAIR)!;
    }
  } catch (error) {
    console.error('Failed to get language pair:', error);
  }

  return getLanguagePair(DEFAULT_LANGUAGE_PAIR)!;
}

/**
 * 使用 MyMemory Translation API (免费，无需 API key)
 */
export async function translateWord(
  word: string,
  sourceLang?: string,
  targetLang?: string
): Promise<DictionaryResult> {
  // 如果没有指定语言，使用当前选择的语言对
  if (!sourceLang || !targetLang) {
    const pair = getCurrentLanguagePair();
    sourceLang = pair.sourceCode;
    targetLang = pair.targetCode;
  }
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${sourceLang}|${targetLang}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.responseStatus === 200) {
      return {
        word,
        translation: data.responseData.translatedText,
        definitions: [data.responseData.translatedText]
      };
    }

    throw new Error('Translation failed');
  } catch (error) {
    console.error('Dictionary API error:', error);
    return {
      word,
      translation: '翻译失败',
      definitions: []
    };
  }
}

/**
 * 批量翻译（用于句子翻译）
 */
export async function translateSentence(
  sentence: string,
  sourceLang?: string,
  targetLang?: string
): Promise<string> {
  // 如果没有指定语言，使用当前选择的语言对
  if (!sourceLang || !targetLang) {
    const pair = getCurrentLanguagePair();
    sourceLang = pair.sourceCode;
    targetLang = pair.targetCode;
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sentence)}&langpair=${sourceLang}|${targetLang}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.responseStatus === 200) {
      return data.responseData.translatedText;
    }

    return sentence;
  } catch (error) {
    console.error('Translation error:', error);
    return sentence;
  }
}
