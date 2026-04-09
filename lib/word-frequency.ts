/**
 * 词频标注系统
 *
 * 基于 COCA (Corpus of Contemporary American English) 词频数据
 * 将单词分为高频、中频、低频三个等级
 */

export enum FrequencyLevel {
  HIGH = 'high',      // 高频词 (前 3000)
  MEDIUM = 'medium',  // 中频词 (3000-10000)
  LOW = 'low',        // 低频词 (10000+)
  UNKNOWN = 'unknown' // 未知
}

export interface FrequencyInfo {
  level: FrequencyLevel;
  rank?: number;        // 词频排名
  label: string;        // 显示标签
  color: string;        // 颜色
  description: string;  // 描述
}

/**
 * 高频词列表 (前 3000 个最常用单词)
 * 这里只列出部分示例，实际应用中应该使用完整的词频数据库
 */
const HIGH_FREQUENCY_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  // 添加更多高频词...
  'hello', 'world', 'language', 'learn', 'study', 'book', 'read', 'write', 'speak',
  'listen', 'understand', 'practice', 'improve', 'help', 'need', 'try', 'find',
  'important', 'different', 'same', 'many', 'much', 'very', 'more', 'less',
]);

/**
 * 中频词列表 (3000-10000)
 */
const MEDIUM_FREQUENCY_WORDS = new Set([
  'ability', 'abroad', 'absence', 'absolute', 'absorb', 'abstract', 'academic',
  'accept', 'access', 'accident', 'accompany', 'accomplish', 'according', 'account',
  'accurate', 'achieve', 'acknowledge', 'acquire', 'across', 'active', 'actual',
  'adapt', 'addition', 'address', 'adequate', 'adjust', 'administration', 'admire',
  'admit', 'adopt', 'adult', 'advance', 'advantage', 'adventure', 'advertise',
  'advice', 'advise', 'affair', 'affect', 'afford', 'afraid', 'agency', 'agenda',
  'agent', 'aggressive', 'agriculture', 'ahead', 'aid', 'aim', 'aircraft', 'alarm',
  'album', 'alcohol', 'alert', 'alien', 'alike', 'alive', 'alliance', 'allocate',
  // 添加更多中频词...
  'vocabulary', 'grammar', 'pronunciation', 'fluent', 'native', 'foreign',
  'translate', 'interpret', 'communicate', 'express', 'conversation', 'dialogue',
]);

/**
 * 获取单词的词频信息
 */
export function getWordFrequency(word: string): FrequencyInfo {
  const normalizedWord = word.toLowerCase().trim();

  if (HIGH_FREQUENCY_WORDS.has(normalizedWord)) {
    return {
      level: FrequencyLevel.HIGH,
      label: '高频',
      color: '#10b981', // green-500
      description: '最常用的 3000 个单词之一',
    };
  }

  if (MEDIUM_FREQUENCY_WORDS.has(normalizedWord)) {
    return {
      level: FrequencyLevel.MEDIUM,
      label: '中频',
      color: '#f59e0b', // amber-500
      description: '较常用的单词 (3000-10000)',
    };
  }

  // 检查是否是派生词或复数形式
  if (isDerivativeWord(normalizedWord)) {
    return {
      level: FrequencyLevel.MEDIUM,
      label: '中频',
      color: '#f59e0b',
      description: '常用词的派生形式',
    };
  }

  return {
    level: FrequencyLevel.LOW,
    label: '低频',
    color: '#6b7280', // gray-500
    description: '较少使用的单词',
  };
}

/**
 * 检查是否是派生词
 */
function isDerivativeWord(word: string): boolean {
  // 检查常见后缀
  const commonSuffixes = ['ing', 'ed', 'er', 'est', 'ly', 'ness', 'ment', 'tion', 'sion'];

  for (const suffix of commonSuffixes) {
    if (word.endsWith(suffix)) {
      const root = word.slice(0, -suffix.length);
      if (HIGH_FREQUENCY_WORDS.has(root)) {
        return true;
      }
    }
  }

  // 检查复数形式
  if (word.endsWith('s') || word.endsWith('es')) {
    const singular = word.endsWith('es')
      ? word.slice(0, -2)
      : word.slice(0, -1);

    if (HIGH_FREQUENCY_WORDS.has(singular)) {
      return true;
    }
  }

  return false;
}

/**
 * 批量获取单词词频
 */
export function getWordsFrequency(words: string[]): Map<string, FrequencyInfo> {
  const result = new Map<string, FrequencyInfo>();

  words.forEach(word => {
    result.set(word, getWordFrequency(word));
  });

  return result;
}

/**
 * 按词频排序单词
 */
export function sortByFrequency<T extends { word: string }>(
  items: T[],
  ascending: boolean = true
): T[] {
  const frequencyOrder = {
    [FrequencyLevel.HIGH]: 1,
    [FrequencyLevel.MEDIUM]: 2,
    [FrequencyLevel.LOW]: 3,
    [FrequencyLevel.UNKNOWN]: 4,
  };

  return [...items].sort((a, b) => {
    const freqA = getWordFrequency(a.word);
    const freqB = getWordFrequency(b.word);

    const orderA = frequencyOrder[freqA.level];
    const orderB = frequencyOrder[freqB.level];

    return ascending ? orderA - orderB : orderB - orderA;
  });
}

/**
 * 获取词频统计
 */
export interface FrequencyStats {
  high: number;
  medium: number;
  low: number;
  total: number;
}

export function getFrequencyStats(words: string[]): FrequencyStats {
  const stats: FrequencyStats = {
    high: 0,
    medium: 0,
    low: 0,
    total: words.length,
  };

  words.forEach(word => {
    const freq = getWordFrequency(word);

    switch (freq.level) {
      case FrequencyLevel.HIGH:
        stats.high += 1;
        break;
      case FrequencyLevel.MEDIUM:
        stats.medium += 1;
        break;
      case FrequencyLevel.LOW:
      case FrequencyLevel.UNKNOWN:
        stats.low += 1;
        break;
    }
  });

  return stats;
}
