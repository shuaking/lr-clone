/**
 * 视频收藏管理
 */

export interface FavoriteVideo {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  channel: string;
  duration: string;
  addedAt: string;
  notes?: string;
}

const FAVORITES_KEY = 'lr-favorite-videos';

/**
 * 获取所有收藏的视频
 */
export function getFavoriteVideos(): FavoriteVideo[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load favorite videos:', error);
    return [];
  }
}

/**
 * 添加视频到收藏
 */
export function addFavoriteVideo(video: Omit<FavoriteVideo, 'id' | 'addedAt'>): FavoriteVideo {
  const favorites = getFavoriteVideos();

  // 检查是否已收藏
  const existing = favorites.find(v => v.videoId === video.videoId);
  if (existing) {
    return existing;
  }

  const newFavorite: FavoriteVideo = {
    ...video,
    id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    addedAt: new Date().toISOString()
  };

  favorites.push(newFavorite);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

  return newFavorite;
}

/**
 * 从收藏中移除视频
 */
export function removeFavoriteVideo(videoId: string): void {
  const favorites = getFavoriteVideos();
  const filtered = favorites.filter(v => v.videoId !== videoId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
}

/**
 * 检查视频是否已收藏
 */
export function isVideoFavorited(videoId: string): boolean {
  const favorites = getFavoriteVideos();
  return favorites.some(v => v.videoId === videoId);
}

/**
 * 更新收藏视频的笔记
 */
export function updateFavoriteNotes(videoId: string, notes: string): void {
  const favorites = getFavoriteVideos();
  const video = favorites.find(v => v.videoId === videoId);

  if (video) {
    video.notes = notes;
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}
