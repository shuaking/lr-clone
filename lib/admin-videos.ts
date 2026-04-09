/**
 * 管理员添加的视频管理
 * 存储在 localStorage
 */

import { ContentItem } from './content-data';

const STORAGE_KEY = 'admin_videos';

export interface AdminVideo extends ContentItem {
  addedAt: string;
}

/**
 * 触发视频变更事件
 */
function dispatchVideoChangeEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('admin-video-changed'));
  }
}

/**
 * 获取管理员添加的所有视频
 */
export function getAdminVideos(): AdminVideo[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load admin videos:', error);
    return [];
  }
}

/**
 * 添加视频
 */
export function addAdminVideo(video: Omit<AdminVideo, 'addedAt'>): void {
  const videos = getAdminVideos();

  // 检查是否已存在
  if (videos.some(v => v.id === video.id)) {
    throw new Error('视频已存在');
  }

  const newVideo: AdminVideo = {
    ...video,
    addedAt: new Date().toISOString()
  };

  videos.push(newVideo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  dispatchVideoChangeEvent();
}

/**
 * 删除视频
 */
export function deleteAdminVideo(videoId: string): void {
  const videos = getAdminVideos();
  const filtered = videos.filter(v => v.id !== videoId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  dispatchVideoChangeEvent();
}

/**
 * 更新视频
 */
export function updateAdminVideo(videoId: string, updates: Partial<ContentItem>): void {
  const videos = getAdminVideos();
  const index = videos.findIndex(v => v.id === videoId);

  if (index === -1) {
    throw new Error('视频不存在');
  }

  videos[index] = { ...videos[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  dispatchVideoChangeEvent();
}

/**
 * 清空所有管理员添加的视频
 */
export function clearAdminVideos(): void {
  localStorage.removeItem(STORAGE_KEY);
  dispatchVideoChangeEvent();
}
