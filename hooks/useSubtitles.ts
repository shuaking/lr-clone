import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fetchYouTubeSubtitles,
  translateSubtitles,
  SubtitleEntry
} from '@/lib/youtube-subtitles';
import { getMockSubtitles } from '@/lib/mock-subtitles';
import { subtitleCache } from '@/lib/subtitle-cache';

export interface Subtitle {
  id: string;
  start: number;
  end: number;
  text: string;
  translation?: string;
}

export type SubtitleMode = 'both' | 'original' | 'translation';

export interface UseSubtitlesOptions {
  videoId: string;
  initialSubtitles?: Subtitle[];
}

export interface UseSubtitlesReturn {
  subtitles: Subtitle[];
  setSubtitles: (subtitles: Subtitle[]) => void;
  isLoading: boolean;
  error: string | null;

  subtitleMode: SubtitleMode;
  setSubtitleMode: (mode: SubtitleMode) => void;

  subtitleDelay: number;
  adjustSubtitleDelay: (delta: number) => void;
  resetSubtitleDelay: () => void;

  reload: () => void;
}

const DEBUG = process.env.NODE_ENV === 'development';
const log = DEBUG ? console.log.bind(console) : () => {};
const logError = console.error.bind(console);

export function useSubtitles({
  videoId,
  initialSubtitles = []
}: UseSubtitlesOptions): UseSubtitlesReturn {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subtitleMode, setSubtitleMode] = useState<SubtitleMode>('both');
  const [subtitleDelay, setSubtitleDelay] = useState(0);

  const loadingRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // 加载字幕
  const loadSubtitles = useCallback(async () => {
    log('[useSubtitles] Starting load for videoId:', videoId);

    // 防止重复加载
    if (loadingRef.current) {
      log('[useSubtitles] Already loading, skipping');
      return;
    }

    // 如果有传入的初始字幕，直接使用
    if (initialSubtitles.length > 0) {
      log('[useSubtitles] Using initial subtitles:', initialSubtitles.length);
      setSubtitles(initialSubtitles);
      return;
    }

    // 检查缓存
    const cached = await subtitleCache.get(videoId);
    if (cached && cached.length > 0) {
      log('[useSubtitles] Using cached subtitles:', cached.length);
      setSubtitles(cached);
      return;
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      log('[useSubtitles] Fetching from YouTube API...');
      const subs = await fetchYouTubeSubtitles(videoId);

      // 检查组件是否已卸载
      if (!isMountedRef.current) {
        log('[useSubtitles] Component unmounted, aborting');
        return;
      }

      if (subs.length === 0) {
        log('[useSubtitles] No subtitles from API, using mock');
        setError('该视频暂无字幕。请尝试其他视频，或等待字幕上传。');
        const mockSubs = getMockSubtitles(videoId);
        setSubtitles(mockSubs);
        setIsLoading(false);
        loadingRef.current = false;
        return;
      }

      log('[useSubtitles] Translating subtitles...');
      const translated = await translateSubtitles(subs);

      // 再次检查组件是否已卸载
      if (!isMountedRef.current) {
        log('[useSubtitles] Component unmounted after translation, aborting');
        return;
      }

      const formattedSubs = translated.map((sub, idx) => ({
        id: `sub-${idx}`,
        start: sub.start,
        end: sub.end,
        text: sub.text,
        translation: sub.translation
      }));

      log('[useSubtitles] Setting formatted subtitles:', formattedSubs.length);
      setSubtitles(formattedSubs);
      await subtitleCache.set(videoId, formattedSubs);
      setIsLoading(false);
      loadingRef.current = false;
    } catch (err) {
      // 忽略取消的请求
      if (err instanceof Error && err.name === 'AbortError') {
        log('[useSubtitles] Request aborted');
        return;
      }

      if (!isMountedRef.current) {
        return;
      }

      logError('[useSubtitles] Error loading subtitles:', err);
      setError('字幕加载失败。请检查网络连接后刷新页面重试。');
      const mockSubs = getMockSubtitles(videoId);
      setSubtitles(mockSubs);
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [videoId, initialSubtitles]);

  // 调整字幕延迟
  const adjustSubtitleDelay = useCallback((delta: number) => {
    setSubtitleDelay(prev => {
      const newDelay = prev + delta;
      // 限制在 -10 到 +10 秒之间
      return Math.max(-10, Math.min(10, newDelay));
    });
  }, []);

  // 重置字幕延迟
  const resetSubtitleDelay = useCallback(() => {
    setSubtitleDelay(0);
  }, []);

  // 重新加载字幕
  const reload = useCallback(() => {
    log('[useSubtitles] Manual reload triggered');
    loadingRef.current = false;
    loadSubtitles();
  }, [loadSubtitles]);

  // 初始加载
  useEffect(() => {
    isMountedRef.current = true;
    loadSubtitles();

    return () => {
      isMountedRef.current = false;

      // 取消进行中的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      loadingRef.current = false;
    };
  }, [loadSubtitles]);

  return {
    subtitles,
    setSubtitles,
    isLoading,
    error,
    subtitleMode,
    setSubtitleMode,
    subtitleDelay,
    adjustSubtitleDelay,
    resetSubtitleDelay,
    reload,
  };
}
