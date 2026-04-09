/**
 * 模拟内容数据
 * 实际应用中应该从 API 获取
 */

import { getAdminVideos } from './admin-videos';

export interface ContentItem {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  channel: string;
  category: string;
}

export const mockYouTubeContent: ContentItem[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Rick Astley - Never Gonna Give You Up',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    duration: '3:33',
    views: '1.4B',
    difficulty: 'beginner',
    channel: 'Rick Astley',
    category: 'Music'
  },
  {
    id: 'jNQXAC9IVRw',
    title: 'Me at the zoo',
    thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg',
    duration: '0:19',
    views: '280M',
    difficulty: 'beginner',
    channel: 'jawed',
    category: 'Conversation'
  },
  {
    id: '9bZkp7q19f0',
    title: 'PSY - Gangnam Style',
    thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg',
    duration: '4:13',
    views: '5B',
    difficulty: 'intermediate',
    channel: 'officialpsy',
    category: 'Music'
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
    thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    duration: '3:37',
    views: '4.5B',
    difficulty: 'intermediate',
    channel: 'Luis Fonsi',
    category: 'Music'
  },
  {
    id: 'OPf0YbXqDm0',
    title: 'Mark Ronson - Uptown Funk ft. Bruno Mars',
    thumbnail: 'https://img.youtube.com/vi/OPf0YbXqDm0/hqdefault.jpg',
    duration: '2:27',
    views: '1.2B',
    difficulty: 'intermediate',
    channel: 'Mark Ronson',
    category: 'Music'
  },
  {
    id: 'RgKAFK5djSk',
    title: 'Maroon 5 - Sugar',
    thumbnail: 'https://img.youtube.com/vi/RgKAFK5djSk/hqdefault.jpg',
    duration: '3:43',
    views: '900M',
    difficulty: 'intermediate',
    channel: 'Maroon 5',
    category: 'Music'
  }
];

/**
 * 获取所有视频（包括管理员添加的）
 */
export function getAllVideos(): ContentItem[] {
  const adminVideos = getAdminVideos();
  return [...mockYouTubeContent, ...adminVideos];
}

export const categories = [
  'All',
  'Conversation',
  'Business',
  'Pronunciation',
  'Stories',
  'Test Prep',
  'Vocabulary',
  'Grammar',
  'News'
];

export const difficulties = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];
