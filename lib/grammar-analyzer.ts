/**
 * 语法分析和提示系统
 * 提供词性标注、语法解释、常见搭配
 */

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'pronoun'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
  | 'article'
  | 'unknown';

export interface GrammarInfo {
  word: string;
  partOfSpeech: PartOfSpeech;
  explanation: string;
  examples: string[];
  collocations: string[];
  commonMistakes?: string[];
}

/**
 * 词性标注规则
 */
const POS_PATTERNS: Record<PartOfSpeech, RegExp[]> = {
  article: [/^(a|an|the)$/i],
  pronoun: [/^(i|you|he|she|it|we|they|me|him|her|us|them|my|your|his|her|its|our|their)$/i],
  preposition: [/^(in|on|at|by|for|with|from|to|of|about|under|over|between|among|through)$/i],
  conjunction: [/^(and|but|or|nor|for|yet|so|because|although|while|if|unless|until|since)$/i],
  interjection: [/^(oh|ah|wow|hey|ouch|oops|yay|hmm)$/i],
  verb: [
    /ing$/i,
    /ed$/i,
    /^(is|are|was|were|be|been|being|have|has|had|do|does|did|can|could|will|would|shall|should|may|might|must)$/i
  ],
  adjective: [
    /ful$/i,
    /less$/i,
    /ous$/i,
    /ive$/i,
    /able$/i,
    /ible$/i,
    /al$/i,
    /ic$/i,
    /^(good|bad|big|small|happy|sad|beautiful|ugly|fast|slow|hot|cold)$/i
  ],
  adverb: [
    /ly$/i,
    /^(very|quite|really|too|so|just|only|also|always|never|often|sometimes|usually)$/i
  ],
  noun: [
    /tion$/i,
    /ment$/i,
    /ness$/i,
    /ity$/i,
    /ism$/i,
    /er$/i,
    /or$/i,
    /^[A-Z]/  // 首字母大写可能是专有名词
  ],
  unknown: []
};

/**
 * 检测词性
 */
export function detectPartOfSpeech(word: string): PartOfSpeech {
  const cleanWord = word.toLowerCase().trim();

  // 按优先级检查
  const order: PartOfSpeech[] = [
    'article',
    'pronoun',
    'preposition',
    'conjunction',
    'interjection',
    'verb',
    'adjective',
    'adverb',
    'noun'
  ];

  for (const pos of order) {
    const patterns = POS_PATTERNS[pos];
    for (const pattern of patterns) {
      if (pattern.test(cleanWord)) {
        return pos;
      }
    }
  }

  return 'unknown';
}

/**
 * 获取词性的中文名称
 */
export function getPOSName(pos: PartOfSpeech, lang: string = 'zh'): string {
  const names: Record<string, Record<PartOfSpeech, string>> = {
    zh: {
      noun: '名词',
      verb: '动词',
      adjective: '形容词',
      adverb: '副词',
      pronoun: '代词',
      preposition: '介词',
      conjunction: '连词',
      interjection: '感叹词',
      article: '冠词',
      unknown: '未知'
    },
    en: {
      noun: 'Noun',
      verb: 'Verb',
      adjective: 'Adjective',
      adverb: 'Adverb',
      pronoun: 'Pronoun',
      preposition: 'Preposition',
      conjunction: 'Conjunction',
      interjection: 'Interjection',
      article: 'Article',
      unknown: 'Unknown'
    }
  };

  return names[lang]?.[pos] || names.en[pos];
}

/**
 * 获取语法解释
 */
export function getGrammarExplanation(pos: PartOfSpeech, lang: string = 'zh'): string {
  const explanations: Record<string, Record<PartOfSpeech, string>> = {
    zh: {
      noun: '表示人、事物、地点或抽象概念的词',
      verb: '表示动作或状态的词',
      adjective: '描述名词性质或特征的词',
      adverb: '修饰动词、形容词或其他副词的词',
      pronoun: '代替名词的词',
      preposition: '表示名词与其他词之间关系的词',
      conjunction: '连接词、短语或句子的词',
      interjection: '表达情感或感叹的词',
      article: '限定名词的词 (a/an/the)',
      unknown: '词性未知'
    },
    en: {
      noun: 'A word that represents a person, place, thing, or idea',
      verb: 'A word that expresses an action or state',
      adjective: 'A word that describes a noun',
      adverb: 'A word that modifies a verb, adjective, or other adverb',
      pronoun: 'A word that replaces a noun',
      preposition: 'A word that shows the relationship between a noun and other words',
      conjunction: 'A word that connects words, phrases, or clauses',
      interjection: 'A word that expresses emotion or exclamation',
      article: 'A word that defines a noun (a/an/the)',
      unknown: 'Part of speech unknown'
    }
  };

  return explanations[lang]?.[pos] || explanations.en[pos];
}

/**
 * 获取常见搭配
 */
export function getCommonCollocations(word: string): string[] {
  const collocations: Record<string, string[]> = {
    // 动词搭配
    make: ['make a decision', 'make progress', 'make sense', 'make a mistake'],
    take: ['take a break', 'take care', 'take place', 'take time'],
    have: ['have fun', 'have a look', 'have a try', 'have breakfast'],
    get: ['get started', 'get ready', 'get better', 'get in touch'],
    do: ['do homework', 'do business', 'do exercise', 'do your best'],

    // 形容词搭配
    good: ['good idea', 'good job', 'good luck', 'good morning'],
    bad: ['bad news', 'bad weather', 'bad habit', 'bad luck'],
    big: ['big deal', 'big difference', 'big problem', 'big city'],
    small: ['small business', 'small talk', 'small change', 'small town'],

    // 名词搭配
    time: ['save time', 'waste time', 'spend time', 'have time'],
    money: ['save money', 'spend money', 'make money', 'waste money'],
    attention: ['pay attention', 'draw attention', 'attract attention'],
    decision: ['make a decision', 'reach a decision', 'difficult decision'],

    // 介词搭配
    in: ['in time', 'in fact', 'in general', 'in particular'],
    on: ['on time', 'on purpose', 'on average', 'on behalf of'],
    at: ['at least', 'at most', 'at first', 'at last'],
    by: ['by chance', 'by accident', 'by mistake', 'by the way']
  };

  return collocations[word.toLowerCase()] || [];
}

/**
 * 获取常见错误
 */
export function getCommonMistakes(word: string): string[] {
  const mistakes: Record<string, string[]> = {
    their: ['❌ They\'re going to their house → ✅ They\'re going to their house', '易混淆: their (他们的) / there (那里) / they\'re (他们是)'],
    your: ['❌ Your welcome → ✅ You\'re welcome', '易混淆: your (你的) / you\'re (你是)'],
    its: ['❌ It\'s color is red → ✅ Its color is red', '易混淆: its (它的) / it\'s (它是)'],
    affect: ['❌ The effect affected me → ✅ The effect affected me', '易混淆: affect (动词-影响) / effect (名词-效果)'],
    then: ['❌ I like it better then this → ✅ I like it better than this', '易混淆: then (然后) / than (比)'],
    lose: ['❌ Don\'t loose your keys → ✅ Don\'t lose your keys', '易混淆: lose (丢失) / loose (松的)'],
    accept: ['❌ I except your apology → ✅ I accept your apology', '易混淆: accept (接受) / except (除了)']
  };

  return mistakes[word.toLowerCase()] || [];
}

/**
 * 获取完整的语法信息
 */
export async function getGrammarInfo(
  word: string,
  context?: string,
  lang: string = 'zh'
): Promise<GrammarInfo> {
  const pos = detectPartOfSpeech(word);
  const explanation = getGrammarExplanation(pos, lang);
  const collocations = getCommonCollocations(word);
  const commonMistakes = getCommonMistakes(word);

  // 生成示例句子
  const examples = generateExamples(word, pos);

  return {
    word,
    partOfSpeech: pos,
    explanation,
    examples,
    collocations,
    commonMistakes: commonMistakes.length > 0 ? commonMistakes : undefined
  };
}

/**
 * 生成示例句子
 */
function generateExamples(word: string, pos: PartOfSpeech): string[] {
  const templates: Record<PartOfSpeech, string[]> = {
    noun: [
      `The ${word} is important.`,
      `I need a ${word}.`,
      `This ${word} is very useful.`
    ],
    verb: [
      `I ${word} every day.`,
      `She ${word}s well.`,
      `They will ${word} tomorrow.`
    ],
    adjective: [
      `It is very ${word}.`,
      `The ${word} one is better.`,
      `I feel ${word} today.`
    ],
    adverb: [
      `He speaks ${word}.`,
      `She works ${word}.`,
      `They arrived ${word}.`
    ],
    pronoun: [
      `${word.charAt(0).toUpperCase() + word.slice(1)} is here.`,
      `I saw ${word} yesterday.`,
      `This is ${word}.`
    ],
    preposition: [
      `The book is ${word} the table.`,
      `I'm going ${word} the store.`,
      `She lives ${word} London.`
    ],
    conjunction: [
      `I like tea ${word} coffee.`,
      `She is smart ${word} kind.`,
      `Come here ${word} I'll show you.`
    ],
    interjection: [
      `${word.charAt(0).toUpperCase() + word.slice(1)}! That's amazing!`,
      `${word.charAt(0).toUpperCase() + word.slice(1)}, I didn't know that.`
    ],
    article: [
      `${word.charAt(0).toUpperCase() + word.slice(1)} book is on the table.`,
      `I need ${word} pen.`
    ],
    unknown: [
      `The word "${word}" is used in context.`
    ]
  };

  return templates[pos] || templates.unknown;
}

/**
 * 分析句子中的语法结构
 */
export function analyzeSentenceGrammar(sentence: string): Array<{
  word: string;
  pos: PartOfSpeech;
  posName: string;
}> {
  const words = sentence.split(/\s+/).filter(w => w.length > 0);

  return words.map(word => {
    const cleanWord = word.replace(/[.,!?;:]/g, '');
    const pos = detectPartOfSpeech(cleanWord);

    return {
      word: cleanWord,
      pos,
      posName: getPOSName(pos)
    };
  });
}

/**
 * 检测语法错误（简单规则）
 */
export function detectGrammarErrors(sentence: string): Array<{
  error: string;
  suggestion: string;
  position: number;
}> {
  const errors: Array<{ error: string; suggestion: string; position: number }> = [];

  // 检测常见错误模式
  const patterns = [
    {
      pattern: /\ba\s+[aeiou]/i,
      error: 'a + 元音',
      suggestion: '应该使用 "an"'
    },
    {
      pattern: /\ban\s+[^aeiou]/i,
      error: 'an + 辅音',
      suggestion: '应该使用 "a"'
    },
    {
      pattern: /\bdont\b/i,
      error: 'dont',
      suggestion: '应该是 "don\'t"'
    },
    {
      pattern: /\bcant\b/i,
      error: 'cant',
      suggestion: '应该是 "can\'t"'
    }
  ];

  for (const { pattern, error, suggestion } of patterns) {
    const match = sentence.match(pattern);
    if (match && match.index !== undefined) {
      errors.push({
        error,
        suggestion,
        position: match.index
      });
    }
  }

  return errors;
}
