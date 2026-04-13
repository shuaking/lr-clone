/**
 * AI 辅助功能
 * 提供句子解释、语法分析等功能
 */

export interface AIExplanation {
  sentence: string;
  translation: string;
  grammar: string[];
  vocabulary: Array<{
    word: string;
    meaning: string;
    usage: string;
  }>;
  culturalNotes?: string;
}

/**
 * 解释句子（基础实现）
 * 注意：这是一个简化版本，使用规则基础的分析
 * 生产环境应该集成真实的 LLM API（OpenAI/Anthropic）
 */
export async function explainSentence(
  sentence: string,
  targetLanguage: string = 'zh'
): Promise<AIExplanation> {
  // 模拟 API 延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  // 基础语法分析
  const grammar: string[] = [];

  // 检测时态
  if (/\b(will|shall)\b/i.test(sentence)) {
    grammar.push('将来时态 (Future tense)');
  } else if (/\b(have|has)\s+\w+ed\b/i.test(sentence)) {
    grammar.push('现在完成时 (Present perfect)');
  } else if (/\b(was|were)\b/i.test(sentence)) {
    grammar.push('过去时态 (Past tense)');
  } else if (/\b(am|is|are)\b/i.test(sentence)) {
    grammar.push('现在时态 (Present tense)');
  }

  // 检测被动语态
  if (/\b(is|are|was|were|been)\s+\w+ed\b/i.test(sentence)) {
    grammar.push('被动语态 (Passive voice)');
  }

  // 检测条件句
  if (/\bif\b/i.test(sentence)) {
    grammar.push('条件句 (Conditional sentence)');
  }

  // 提取关键词汇
  const words = sentence.match(/\b[a-zA-Z]{4,}\b/g) || [];
  const vocabulary = words.slice(0, 3).map(word => ({
    word: word.toLowerCase(),
    meaning: `${word} 的含义`,
    usage: `例句：This is an example with ${word}.`
  }));

  return {
    sentence,
    translation: `这是 "${sentence}" 的翻译`,
    grammar,
    vocabulary,
    culturalNotes: grammar.length > 0 ? '这个句子使用了常见的英语语法结构。' : undefined
  };
}

/**
 * 生成对话练习
 */
export interface DialoguePractice {
  scenario: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  turns: Array<{
    speaker: 'user' | 'ai';
    text: string;
    translation?: string;
  }>;
}

export async function generateDialogue(
  topic: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<DialoguePractice> {
  // 模拟 API 延迟
  await new Promise(resolve => setTimeout(resolve, 800));

  const scenarios: Record<string, DialoguePractice> = {
    restaurant: {
      scenario: '在餐厅点餐',
      difficulty,
      turns: [
        { speaker: 'ai', text: 'Good evening! Welcome to our restaurant. How many people?', translation: '晚上好！欢迎来到我们的餐厅。几位？' },
        { speaker: 'user', text: 'Table for two, please.', translation: '两位，谢谢。' },
        { speaker: 'ai', text: 'Right this way. Here are your menus.', translation: '这边请。这是您的菜单。' },
        { speaker: 'user', text: 'Thank you. What do you recommend?', translation: '谢谢。你推荐什么？' },
        { speaker: 'ai', text: 'Our special today is grilled salmon with vegetables.', translation: '我们今天的特色菜是烤三文鱼配蔬菜。' }
      ]
    },
    shopping: {
      scenario: '在商店购物',
      difficulty,
      turns: [
        { speaker: 'ai', text: 'Hello! Can I help you find something?', translation: '你好！需要帮您找什么吗？' },
        { speaker: 'user', text: 'Yes, I\'m looking for a blue shirt.', translation: '是的，我在找一件蓝色衬衫。' },
        { speaker: 'ai', text: 'What size do you need?', translation: '您需要什么尺码？' },
        { speaker: 'user', text: 'Medium, please.', translation: '中号，谢谢。' },
        { speaker: 'ai', text: 'Let me check our inventory.', translation: '让我查一下我们的库存。' }
      ]
    }
  };

  return scenarios[topic] || scenarios.restaurant;
}

/**
 * 检查是否配置了真实的 AI API
 */
export function hasAIAPIConfigured(): boolean {
  if (typeof window === 'undefined') return false;

  // 检查环境变量
  const hasOpenAI = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const hasAnthropic = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

  return !!(hasOpenAI || hasAnthropic);
}

/**
 * 获取 AI 功能状态
 */
export function getAIStatus(): {
  available: boolean;
  provider: 'mock' | 'openai' | 'anthropic';
  message: string;
} {
  if (hasAIAPIConfigured()) {
    return {
      available: true,
      provider: process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'openai' : 'anthropic',
      message: 'AI 功能已启用'
    };
  }

  return {
    available: true,
    provider: 'mock',
    message: 'AI 功能使用模拟数据（配置 API 密钥以启用真实 AI）'
  };
}
