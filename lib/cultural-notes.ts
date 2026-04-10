/**
 * 文化注释系统
 * 提供文化背景、俚语解释、地区差异
 */

export interface CulturalNote {
  word: string;
  type: 'idiom' | 'slang' | 'cultural' | 'regional' | 'historical';
  explanation: string;
  origin?: string;
  usage: string;
  examples: string[];
  regions?: string[];
  alternatives?: string[];
  relatedTerms?: string[];
}

/**
 * 文化注释数据库
 */
const CULTURAL_NOTES: Record<string, CulturalNote> = {
  // 习语 (Idioms)
  'break the ice': {
    word: 'break the ice',
    type: 'idiom',
    explanation: '打破僵局，缓解尴尬气氛',
    origin: '源自16世纪，当时船只需要破冰才能航行',
    usage: '用于描述在社交场合中开始对话或缓解紧张气氛',
    examples: [
      'He told a joke to break the ice at the meeting.',
      'Small talk helps break the ice with new people.'
    ],
    relatedTerms: ['ice breaker', 'warm up']
  },
  'piece of cake': {
    word: 'piece of cake',
    type: 'idiom',
    explanation: '非常容易的事情',
    origin: '20世纪初美国俚语，可能源自蛋糕容易切分',
    usage: '形容某事非常简单',
    examples: [
      'The exam was a piece of cake.',
      'Don\'t worry, this task is a piece of cake for me.'
    ],
    relatedTerms: ['easy as pie', 'walk in the park']
  },
  'hit the books': {
    word: 'hit the books',
    type: 'idiom',
    explanation: '开始认真学习',
    origin: '美国学生俚语，20世纪中期开始流行',
    usage: '表示开始努力学习或做功课',
    examples: [
      'I need to hit the books for tomorrow\'s test.',
      'She hits the books every night.'
    ],
    relatedTerms: ['study hard', 'crack the books']
  },

  // 俚语 (Slang)
  'cool': {
    word: 'cool',
    type: 'slang',
    explanation: '很棒、很酷、令人印象深刻',
    origin: '1930年代爵士乐文化，原指冷静、沉着',
    usage: '表达赞赏或认可',
    examples: [
      'That\'s a cool car!',
      'Your new haircut looks cool.'
    ],
    regions: ['US', 'UK', 'Global'],
    alternatives: ['awesome', 'great', 'nice']
  },
  'gonna': {
    word: 'gonna',
    type: 'slang',
    explanation: 'going to 的口语缩写',
    usage: '非正式场合使用，表示将要做某事',
    examples: [
      'I\'m gonna go to the store.',
      'What are you gonna do?'
    ],
    regions: ['US', 'UK'],
    alternatives: ['going to']
  },
  'wanna': {
    word: 'wanna',
    type: 'slang',
    explanation: 'want to 的口语缩写',
    usage: '非正式场合使用，表示想要做某事',
    examples: [
      'I wanna go home.',
      'Do you wanna come with us?'
    ],
    regions: ['US', 'UK'],
    alternatives: ['want to']
  },

  // 文化概念 (Cultural)
  'thanksgiving': {
    word: 'Thanksgiving',
    type: 'cultural',
    explanation: '感恩节，美国和加拿大的重要节日',
    origin: '1621年，清教徒移民庆祝丰收',
    usage: '每年11月第四个星期四（美国）或10月第二个星期一（加拿大）',
    examples: [
      'We always have turkey on Thanksgiving.',
      'Thanksgiving is a time for family gatherings.'
    ],
    regions: ['US', 'Canada'],
    relatedTerms: ['turkey', 'Black Friday', 'Pilgrim']
  },
  'tea time': {
    word: 'tea time',
    type: 'cultural',
    explanation: '下午茶时间，英国传统习俗',
    origin: '19世纪英国贵族传统',
    usage: '通常在下午3-5点，喝茶并吃点心',
    examples: [
      'Would you like to join us for tea time?',
      'Tea time is a British tradition.'
    ],
    regions: ['UK'],
    relatedTerms: ['afternoon tea', 'high tea']
  },

  // 地区差异 (Regional)
  'lift': {
    word: 'lift',
    type: 'regional',
    explanation: '电梯（英式英语）',
    usage: '英国及英联邦国家使用',
    examples: [
      'Take the lift to the third floor. (UK)',
      'Take the elevator to the third floor. (US)'
    ],
    regions: ['UK', 'AU', 'NZ'],
    alternatives: ['elevator (US)']
  },
  'flat': {
    word: 'flat',
    type: 'regional',
    explanation: '公寓（英式英语）',
    usage: '英国及英联邦国家使用',
    examples: [
      'I live in a flat in London. (UK)',
      'I live in an apartment in New York. (US)'
    ],
    regions: ['UK', 'AU', 'NZ'],
    alternatives: ['apartment (US)']
  },
  'lorry': {
    word: 'lorry',
    type: 'regional',
    explanation: '卡车（英式英语）',
    usage: '英国使用',
    examples: [
      'A lorry blocked the road. (UK)',
      'A truck blocked the road. (US)'
    ],
    regions: ['UK'],
    alternatives: ['truck (US)']
  },

  // 历史典故 (Historical)
  'achilles heel': {
    word: 'Achilles\' heel',
    type: 'historical',
    explanation: '致命弱点',
    origin: '希腊神话：阿喀琉斯的脚后跟是他唯一的弱点',
    usage: '指某人或某事的关键弱点',
    examples: [
      'His temper is his Achilles\' heel.',
      'The company\'s Achilles\' heel is poor customer service.'
    ],
    relatedTerms: ['weak spot', 'vulnerability']
  },
  'trojan horse': {
    word: 'Trojan horse',
    type: 'historical',
    explanation: '特洛伊木马，指隐藏的危险或欺骗手段',
    origin: '希腊神话：希腊人用木马攻陷特洛伊城',
    usage: '指看似无害实则危险的事物',
    examples: [
      'The free software was a Trojan horse containing malware.',
      'Be careful of Trojan horse tactics.'
    ],
    relatedTerms: ['deception', 'hidden danger']
  }
};

/**
 * 获取文化注释
 */
export function getCulturalNote(word: string): CulturalNote | null {
  const key = word.toLowerCase().trim();
  return CULTURAL_NOTES[key] || null;
}

/**
 * 搜索文化注释
 */
export function searchCulturalNotes(query: string): CulturalNote[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(CULTURAL_NOTES).filter(note =>
    note.word.toLowerCase().includes(lowerQuery) ||
    note.explanation.toLowerCase().includes(lowerQuery) ||
    note.examples.some(ex => ex.toLowerCase().includes(lowerQuery))
  );
}

/**
 * 按类型获取文化注释
 */
export function getCulturalNotesByType(
  type: CulturalNote['type']
): CulturalNote[] {
  return Object.values(CULTURAL_NOTES).filter(note => note.type === type);
}

/**
 * 获取类型名称
 */
export function getTypeName(type: CulturalNote['type'], lang: string = 'zh'): string {
  const names: Record<string, Record<CulturalNote['type'], string>> = {
    zh: {
      idiom: '习语',
      slang: '俚语',
      cultural: '文化',
      regional: '地区差异',
      historical: '历史典故'
    },
    en: {
      idiom: 'Idiom',
      slang: 'Slang',
      cultural: 'Cultural',
      regional: 'Regional',
      historical: 'Historical'
    }
  };

  return names[lang]?.[type] || names.en[type];
}

/**
 * 检测文本中的文化相关词汇
 */
export function detectCulturalTerms(text: string): CulturalNote[] {
  const found: CulturalNote[] = [];
  const lowerText = text.toLowerCase();

  for (const [key, note] of Object.entries(CULTURAL_NOTES)) {
    if (lowerText.includes(key.toLowerCase())) {
      found.push(note);
    }
  }

  return found;
}

/**
 * 获取地区特定的词汇
 */
export function getRegionalTerms(region: string): CulturalNote[] {
  return Object.values(CULTURAL_NOTES).filter(
    note => note.regions && note.regions.includes(region)
  );
}

/**
 * 获取相关术语
 */
export function getRelatedCulturalNotes(word: string): CulturalNote[] {
  const note = getCulturalNote(word);
  if (!note || !note.relatedTerms) return [];

  return note.relatedTerms
    .map(term => getCulturalNote(term))
    .filter((n): n is CulturalNote => n !== null);
}

/**
 * 添加自定义文化注释
 */
export function addCustomCulturalNote(note: CulturalNote): void {
  CULTURAL_NOTES[note.word.toLowerCase()] = note;
}

/**
 * 导出文化注释数据
 */
export function exportCulturalNotes(): string {
  return JSON.stringify(CULTURAL_NOTES, null, 2);
}

/**
 * 导入文化注释数据
 */
export function importCulturalNotes(data: string): number {
  try {
    const notes = JSON.parse(data);
    let count = 0;

    for (const [key, note] of Object.entries(notes)) {
      if (isValidCulturalNote(note)) {
        CULTURAL_NOTES[key] = note as CulturalNote;
        count++;
      }
    }

    return count;
  } catch (error) {
    console.error('Failed to import cultural notes:', error);
    return 0;
  }
}

/**
 * 验证文化注释数据
 */
function isValidCulturalNote(note: any): boolean {
  return (
    note &&
    typeof note.word === 'string' &&
    typeof note.type === 'string' &&
    typeof note.explanation === 'string' &&
    typeof note.usage === 'string' &&
    Array.isArray(note.examples)
  );
}

/**
 * 获取所有文化注释统计
 */
export function getCulturalNotesStats(): {
  total: number;
  byType: Record<CulturalNote['type'], number>;
  byRegion: Record<string, number>;
} {
  const stats = {
    total: Object.keys(CULTURAL_NOTES).length,
    byType: {
      idiom: 0,
      slang: 0,
      cultural: 0,
      regional: 0,
      historical: 0
    } as Record<CulturalNote['type'], number>,
    byRegion: {} as Record<string, number>
  };

  for (const note of Object.values(CULTURAL_NOTES)) {
    stats.byType[note.type]++;

    if (note.regions) {
      for (const region of note.regions) {
        stats.byRegion[region] = (stats.byRegion[region] || 0) + 1;
      }
    }
  }

  return stats;
}
