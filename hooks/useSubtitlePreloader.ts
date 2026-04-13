import { useEffect } from 'react';
import { subtitleCache } from '@/lib/subtitle-cache';
import { fetchYouTubeSubtitles, translateSubtitles } from '@/lib/youtube-subtitles';

/**
 * 字幕预加载 Hook
 * 在后台预加载相关视频的字幕
 */
export function useSubtitlePreloader(videoIds: string[]) {
  useEffect(() => {
    if (videoIds.length === 0) return;

    // 延迟预加载，避免影响当前页面性能
    const timer = setTimeout(() => {
      videoIds.forEach((videoId, index) => {
        // 错开预加载时间，避免同时发起多个请求
        setTimeout(() => {
          subtitleCache.preload(videoId, async () => {
            const subs = await fetchYouTubeSubtitles(videoId);
            if (subs.length === 0) return [];

            const translated = await translateSubtitles(subs);
            return translated.map((sub, idx) => ({
              id: `sub-${idx}`,
              start: sub.start,
              end: sub.end,
              text: sub.text,
              translation: sub.translation
            }));
          }).catch(error => {
            console.error('[SubtitlePreloader] Failed to preload:', videoId, error);
          });
        }, index * 2000); // 每个视频间隔 2 秒
      });
    }, 3000); // 页面加载后 3 秒开始预加载

    return () => clearTimeout(timer);
  }, [videoIds]);
}
