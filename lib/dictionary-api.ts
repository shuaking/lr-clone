/**
 * 词典 API 集成
 * 使用免费的翻译 API
 */

export interface DictionaryResult {
  word: string;
  translation: string;
  phonetic?: string;
  definitions?: string[];
  examples?: string[];
}

/**
 * 使用 MyMemory Translation API (免费，无需 API key)
 */
export async function translateWord(
  word: string,
  sourceLang: string = 'en',
  targetLang: string = 'zh-CN'
): Promise<DictionaryResult> {
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
  sourceLang: string = 'en',
  targetLang: string = 'zh-CN'
): Promise<string> {
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
