/**
 * YouTube 字幕获取
 * 使用第三方 API 获取 YouTube 视频字幕
 */

import { safeStorage } from './safe-storage';

export interface SubtitleEntry {
  start: number;
  end: number;
  text: string;
  translation?: string;
}

interface YouTubeSubtitleItem {
  offset: number;
  duration: number;
  text: string;
}

/**
 * 从 YouTube 获取字幕
 * 使用本地 API 路由
 */
export async function fetchYouTubeSubtitles(
  videoId: string,
  lang: string = 'en'
): Promise<SubtitleEntry[]> {
  try {
    const response = await fetch(
      `/api/transcript?videoId=${videoId}&lang=${lang}`
    );

    if (!response.ok) {
      console.warn('YouTube API response not ok:', response.status);
      return [];
    }

    const data = await response.json();

    // 检查 API 错误响应格式
    if (data && typeof data === 'object' && data.error) {
      console.warn('YouTube API returned error:', data.error);
      return [];
    }

    // 验证数据格式
    if (!data || !Array.isArray(data)) {
      console.warn('Invalid subtitle data format:', data);
      return [];
    }

    // 转换为标准格式
    return data.map((item: YouTubeSubtitleItem) => ({
      start: item.offset / 1000, // 转换为秒
      end: (item.offset + item.duration) / 1000,
      text: item.text
    }));
  } catch (error) {
    console.error('Failed to fetch YouTube subtitles:', error);
    return [];
  }
}

/**
 * 翻译字幕
 * 使用 Promise.allSettled 确保部分失败不影响其他字幕
 */
export async function translateSubtitles(
  subtitles: SubtitleEntry[],
  targetLang: string = 'zh'
): Promise<SubtitleEntry[]> {
  const { translateSentence } = await import('./dictionary-api');

  const results = await Promise.allSettled(
    subtitles.map(async (subtitle) => {
      const translation = await translateSentence(subtitle.text, 'en', targetLang);
      return {
        ...subtitle,
        translation
      };
    })
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.warn(`Translation failed for subtitle ${index}:`, result.reason);
      return subtitles[index]; // 返回原始字幕
    }
  });
}

/**
 * 缓存字幕到 localStorage
 */
export function cacheSubtitles(videoId: string, subtitles: SubtitleEntry[]): void {
  const key = `subtitles_${videoId}`;
  const result = safeStorage.setJSON(key, subtitles);

  if (!result.success && result.error === 'QUOTA_EXCEEDED') {
    console.warn('localStorage quota exceeded, clearing old subtitle cache');
    // 清除旧的字幕缓存
    try {
      const keys = safeStorage.keys();
      const subtitleKeys = keys.filter((k: string) => k.startsWith('subtitles_'));
      // 保留最近的 5 个，删除其他的
      if (subtitleKeys.length > 5) {
        subtitleKeys.slice(0, -5).forEach((k: string) => safeStorage.removeItem(k));
      }
      // 重试保存
      safeStorage.setJSON(key, subtitles);
    } catch (retryError) {
      console.error('Failed to cache subtitles after cleanup:', retryError);
    }
  }
}

/**
 * 从缓存读取字幕
 */
export function getCachedSubtitles(videoId: string): SubtitleEntry[] | null {
  const key = `subtitles_${videoId}`;
  const result = safeStorage.getJSON<SubtitleEntry[]>(key);

  return result.success ? result.data ?? null : null;
}
