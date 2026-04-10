/**
 * YouTube 频道数据
 * 用于频道浏览功能
 */

export interface Channel {
  id: string;
  name: string;
  handle: string;
  description: string;
  thumbnail: string;
  subscribers: string;
  videoCount: number;
  category: string;
  language: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export const CHANNELS: Channel[] = [
  // 英语学习频道
  {
    id: 'UCsooa4yRKGN_zEE8iknghZA',
    name: 'TED-Ed',
    handle: '@TEDEd',
    description: '教育动画视频，涵盖科学、历史、文学等主题',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kGRvnmQTHBnfZBmKxLNVxmvKgqJuN-0fFqKdJV=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '19M',
    videoCount: 2000,
    category: 'Education',
    language: 'en',
    difficulty: 'intermediate',
    tags: ['education', 'animation', 'science', 'history']
  },
  {
    id: 'UCX6OQ3DkcsbYNE6H8uQQuVA',
    name: 'MrBeast',
    handle: '@MrBeast',
    description: '娱乐挑战视频，语速适中，适合学习日常英语',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_nJhVZCqvJQqN5qJQqN5qJQqN5qJQqN5qJQqN5qJQ=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '250M',
    videoCount: 800,
    category: 'Entertainment',
    language: 'en',
    difficulty: 'beginner',
    tags: ['challenge', 'entertainment', 'casual']
  },
  {
    id: 'UCJ0-OtVpF0wOKEqT2Z1HEtA',
    name: 'ElectroBOOM',
    handle: '@ElectroBOOM',
    description: '电子工程教学，幽默风格，适合理工科学习者',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kGRvnmQTHBnfZBmKxLNVxmvKgqJuN-0fFqKdJV=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '6M',
    videoCount: 300,
    category: 'Technology',
    language: 'en',
    difficulty: 'advanced',
    tags: ['engineering', 'electronics', 'technical']
  },
  {
    id: 'UCsXVk37bltHxD1rDPwtNM8Q',
    name: 'Kurzgesagt',
    handle: '@kurzgesagt',
    description: '科普动画，解释复杂概念，配有精美动画',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kGRvnmQTHBnfZBmKxLNVxmvKgqJuN-0fFqKdJV=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '21M',
    videoCount: 200,
    category: 'Education',
    language: 'en',
    difficulty: 'intermediate',
    tags: ['science', 'animation', 'philosophy']
  },
  {
    id: 'UCBJycsmduvYEL83R_U4JriQ',
    name: 'Marques Brownlee',
    handle: '@mkbhd',
    description: '科技产品评测，清晰发音，适合科技爱好者',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kGRvnmQTHBnfZBmKxLNVxmvKgqJuN-0fFqKdJV=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '19M',
    videoCount: 1500,
    category: 'Technology',
    language: 'en',
    difficulty: 'intermediate',
    tags: ['tech', 'review', 'gadgets']
  },

  // 日语学习频道
  {
    id: 'UCZf__ehlCEBPop-_sldpBUQ',
    name: 'Abroad in Japan',
    handle: '@AbroadinJapan',
    description: '日本文化和旅行，英语讲解日本生活',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kGRvnmQTHBnfZBmKxLNVxmvKgqJuN-0fFqKdJV=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '4M',
    videoCount: 500,
    category: 'Travel',
    language: 'en',
    difficulty: 'intermediate',
    tags: ['japan', 'culture', 'travel']
  },
  {
    id: 'UCq-Fj5jknLsUf-MWSy4_brA',
    name: 'Tokyo Creative',
    handle: '@TokyoCreative',
    description: '东京生活和文化，简单日语对话',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kGRvnmQTHBnfZBmKxLNVxmvKgqJuN-0fFqKdJV=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '2M',
    videoCount: 800,
    category: 'Lifestyle',
    language: 'ja',
    difficulty: 'beginner',
    tags: ['tokyo', 'lifestyle', 'culture']
  },

  // 韩语学习频道
  {
    id: 'UCUpJs89fSBXNolQGOYKn0YQ',
    name: 'Korean Englishman',
    handle: '@KoreanEnglishman',
    description: '韩国文化介绍，英语讲解',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kGRvnmQTHBnfZBmKxLNVxmvKgqJuN-0fFqKdJV=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '5M',
    videoCount: 600,
    category: 'Culture',
    language: 'en',
    difficulty: 'intermediate',
    tags: ['korea', 'culture', 'food']
  },

  // 西班牙语学习频道
  {
    id: 'UCt7sw2OXdIlbPeDJdOCtPvg',
    name: 'Butterfly Spanish',
    handle: '@ButterflySpanish',
    description: '西班牙语教学，适合初学者',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kGRvnmQTHBnfZBmKxLNVxmvKgqJuN-0fFqKdJV=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '2M',
    videoCount: 400,
    category: 'Education',
    language: 'es',
    difficulty: 'beginner',
    tags: ['spanish', 'learning', 'grammar']
  },

  // 法语学习频道
  {
    id: 'UCofQxJWd4qkqc7ZgaLkZfcw',
    name: 'Easy French',
    handle: '@EasyFrench',
    description: '街头采访，真实法语对话',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kGRvnmQTHBnfZBmKxLNVxmvKgqJuN-0fFqKdJV=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '1M',
    videoCount: 300,
    category: 'Education',
    language: 'fr',
    difficulty: 'intermediate',
    tags: ['french', 'conversation', 'street']
  },

  // 德语学习频道
  {
    id: 'UCbxb2fqe9oNgglAoYqsYOtQ',
    name: 'Easy German',
    handle: '@EasyGerman',
    description: '德语学习，街头采访和文化介绍',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kGRvnmQTHBnfZBmKxLNVxmvKgqJuN-0fFqKdJV=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '2M',
    videoCount: 500,
    category: 'Education',
    language: 'de',
    difficulty: 'intermediate',
    tags: ['german', 'conversation', 'culture']
  },

  // 中文学习频道
  {
    id: 'UCgRdRCaIqEWGE_KZ_KLp3Ew',
    name: 'ChinesePod',
    handle: '@ChinesePod',
    description: '中文教学，适合各个水平的学习者',
    thumbnail: 'https://yt3.googleusercontent.com/ytc/AIdro_kGRvnmQTHBnfZBmKxLNVxmvKgqJuN-0fFqKdJV=s176-c-k-c0x00ffffff-no-rj',
    subscribers: '500K',
    videoCount: 1000,
    category: 'Education',
    language: 'zh-CN',
    difficulty: 'beginner',
    tags: ['chinese', 'mandarin', 'learning']
  }
];

export function getChannelsByLanguage(language: string): Channel[] {
  return CHANNELS.filter(channel => channel.language === language);
}

export function getChannelsByCategory(category: string): Channel[] {
  if (category === 'All') return CHANNELS;
  return CHANNELS.filter(channel => channel.category === category);
}

export function getChannelsByDifficulty(difficulty: string): Channel[] {
  if (difficulty === 'All') return CHANNELS;
  return CHANNELS.filter(channel => channel.difficulty === difficulty);
}

export const CHANNEL_CATEGORIES = [
  'All',
  'Education',
  'Entertainment',
  'Technology',
  'Travel',
  'Lifestyle',
  'Culture'
];
