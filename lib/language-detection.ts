/**
 * 视频语言检测
 * 基于标题、频道名称和内容特征自动检测视频语言
 */

export type DetectedLanguage = 'en' | 'zh-CN' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'th' | 'unknown';

interface LanguagePattern {
  code: DetectedLanguage;
  name: string;
  patterns: RegExp[];
  charRanges: { min: number; max: number }[];
}

const LANGUAGE_PATTERNS: LanguagePattern[] = [
  {
    code: 'zh-CN',
    name: '中文',
    patterns: [
      /[\u4e00-\u9fff]/,  // 中文字符
      /[\u3400-\u4dbf]/,  // 扩展A
    ],
    charRanges: [
      { min: 0x4e00, max: 0x9fff },
      { min: 0x3400, max: 0x4dbf }
    ]
  },
  {
    code: 'ja',
    name: '日本語',
    patterns: [
      /[\u3040-\u309f]/,  // 平假名
      /[\u30a0-\u30ff]/,  // 片假名
      /[\u4e00-\u9faf]/,  // 汉字（日文也使用）
    ],
    charRanges: [
      { min: 0x3040, max: 0x309f },
      { min: 0x30a0, max: 0x30ff }
    ]
  },
  {
    code: 'ko',
    name: '한국어',
    patterns: [
      /[\uac00-\ud7af]/,  // 韩文音节
      /[\u1100-\u11ff]/,  // 韩文字母
      /[\u3130-\u318f]/,  // 韩文兼容字母
    ],
    charRanges: [
      { min: 0xac00, max: 0xd7af },
      { min: 0x1100, max: 0x11ff }
    ]
  },
  {
    code: 'th',
    name: 'ไทย',
    patterns: [
      /[\u0E00-\u0E7F]/,  // 泰文字符
    ],
    charRanges: [
      { min: 0x0E00, max: 0x0E7F }
    ]
  },
  {
    code: 'es',
    name: 'Español',
    patterns: [
      /[áéíóúñü]/i,
      /\b(el|la|los|las|un|una|de|del|y|que|es|en|por|para)\b/i
    ],
    charRanges: []
  },
  {
    code: 'fr',
    name: 'Français',
    patterns: [
      /[àâäæçéèêëïîôùûüÿœ]/i,
      /\b(le|la|les|un|une|de|du|des|et|que|est|dans|pour)\b/i
    ],
    charRanges: []
  },
  {
    code: 'de',
    name: 'Deutsch',
    patterns: [
      /[äöüß]/i,
      /\b(der|die|das|den|dem|des|ein|eine|und|ist|in|zu|von)\b/i
    ],
    charRanges: []
  },
  {
    code: 'en',
    name: 'English',
    patterns: [
      /^[a-zA-Z\s\d\-'",.:;!?()]+$/,  // 纯英文字符
      /\b(the|is|are|was|were|have|has|had|do|does|did|will|would|can|could)\b/i
    ],
    charRanges: []
  }
];

/**
 * 检测文本中的语言
 */
export function detectLanguage(text: string): DetectedLanguage {
  if (!text || text.trim().length === 0) {
    return 'unknown';
  }

  const scores: Record<DetectedLanguage, number> = {
    'en': 0,
    'zh-CN': 0,
    'ja': 0,
    'ko': 0,
    'th': 0,
    'es': 0,
    'fr': 0,
    'de': 0,
    'unknown': 0
  };

  // 计算每种语言的匹配分数
  for (const lang of LANGUAGE_PATTERNS) {
    let score = 0;

    // 检查字符范围
    for (const char of text) {
      const code = char.charCodeAt(0);
      for (const range of lang.charRanges) {
        if (code >= range.min && code <= range.max) {
          score += 2;
        }
      }
    }

    // 检查正则模式
    for (const pattern of lang.patterns) {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length;
      }
    }

    scores[lang.code] = score;
  }

  // 找出得分最高的语言
  let maxScore = 0;
  let detectedLang: DetectedLanguage = 'unknown';

  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang as DetectedLanguage;
    }
  }

  // 如果得分太低，返回 unknown
  if (maxScore < 3) {
    return 'unknown';
  }

  return detectedLang;
}

/**
 * 检测视频语言（综合标题和频道名称）
 */
export function detectVideoLanguage(title: string, channel?: string): DetectedLanguage {
  const titleLang = detectLanguage(title);

  if (channel) {
    const channelLang = detectLanguage(channel);

    // 如果标题和频道语言一致，更有信心
    if (titleLang === channelLang) {
      return titleLang;
    }

    // 如果标题检测到语言，优先使用标题
    if (titleLang !== 'unknown') {
      return titleLang;
    }

    // 否则使用频道语言
    return channelLang;
  }

  return titleLang;
}

/**
 * 获取语言名称
 */
export function getLanguageName(code: DetectedLanguage): string {
  const lang = LANGUAGE_PATTERNS.find(l => l.code === code);
  return lang?.name || '未知';
}

/**
 * 根据检测到的语言建议语言对
 */
export function suggestLanguagePair(detectedLang: DetectedLanguage, userTargetLang: string = 'zh-CN'): string | null {
  if (detectedLang === 'unknown') {
    return null;
  }

  // 如果检测到的语言和目标语言相同，返回 null
  if (detectedLang === userTargetLang) {
    return null;
  }

  // 构建语言对 ID
  return `${detectedLang}-${userTargetLang.replace('zh-CN', 'zh')}`;
}

/**
 * 批量检测视频语言
 */
export function detectVideosLanguage(videos: Array<{ title: string; channel?: string }>): Map<number, DetectedLanguage> {
  const results = new Map<number, DetectedLanguage>();

  videos.forEach((video, index) => {
    const lang = detectVideoLanguage(video.title, video.channel);
    results.set(index, lang);
  });

  return results;
}
