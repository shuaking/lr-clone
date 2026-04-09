/**
 * YouTube 字幕获取
 * 使用第三方 API 获取 YouTube 视频字幕
 */

export interface SubtitleEntry {
  start: number;
  end: number;
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
    return data.map((item: any) => ({
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
 */
export async function translateSubtitles(
  subtitles: SubtitleEntry[],
  targetLang: string = 'zh'
): Promise<SubtitleEntry[]> {
  const { translateSentence } = await import('./dictionary-api');

  const translated = await Promise.all(
    subtitles.map(async (subtitle) => {
      try {
        const translation = await translateSentence(subtitle.text, 'en', targetLang);
        return {
          ...subtitle,
          translation
        };
      } catch (error) {
        return subtitle;
      }
    })
  );

  return translated;
}

/**
 * 缓存字幕到 localStorage
 */
export function cacheSubtitles(videoId: string, subtitles: SubtitleEntry[]): void {
  try {
    const key = `subtitles_${videoId}`;
    localStorage.setItem(key, JSON.stringify(subtitles));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old subtitle cache');
      // 清除旧的字幕缓存
      try {
        const keys = Object.keys(localStorage);
        const subtitleKeys = keys.filter(k => k.startsWith('subtitles_'));
        // 保留最近的 5 个，删除其他的
        if (subtitleKeys.length > 5) {
          subtitleKeys.slice(0, -5).forEach(k => localStorage.removeItem(k));
        }
        // 重试保存
        const key = `subtitles_${videoId}`;
        localStorage.setItem(key, JSON.stringify(subtitles));
      } catch (retryError) {
        console.error('Failed to cache subtitles after cleanup:', retryError);
      }
    } else {
      console.error('Failed to cache subtitles:', error);
    }
  }
}

/**
 * 从缓存读取字幕
 */
export function getCachedSubtitles(videoId: string): SubtitleEntry[] | null {
  try {
    const key = `subtitles_${videoId}`;
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Failed to get cached subtitles:', error);
    return null;
  }
}
