/**
 * 文本处理工具：分句、分词
 */

export interface Sentence {
  id: string;
  text: string;
  timestamp?: string;
}

/**
 * 将文本分割成句子
 */
export function splitIntoSentences(text: string): Sentence[] {
  const sentenceRegex = /[^.!?。！？]+[.!?。！？]+/g;
  const matches = text.match(sentenceRegex) || [text];

  return matches.map((sentence, index) => ({
    id: `s-${index}`,
    text: sentence.trim(),
    timestamp: `00:${String(index * 5).padStart(2, '0')}`
  }));
}

/**
 * 将句子分割成单词（支持英文和中文）
 */
export function splitIntoWords(text: string): string[] {
  // 英文：按空格和标点分割
  // 中文：保持原样（后续可以集成分词库）
  const words = text.match(/[\u4e00-\u9fa5]+|[a-zA-Z]+('[a-zA-Z]+)?/g) || [];
  return words;
}

/**
 * 检测文本语言
 */
export function detectLanguage(text: string): 'en' | 'zh' | 'other' {
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g);
  const englishChars = text.match(/[a-zA-Z]/g);

  if (chineseChars && chineseChars.length > (englishChars?.length || 0)) {
    return 'zh';
  } else if (englishChars && englishChars.length > 0) {
    return 'en';
  }
  return 'other';
}
