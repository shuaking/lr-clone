"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Volume2, Settings, ChevronLeft, ChevronRight, BookmarkPlus, RefreshCw } from "lucide-react";
import { WordPopup } from "./word-popup";
import { fetchYouTubeSubtitles, translateSubtitles, cacheSubtitles, getCachedSubtitles } from "@/lib/youtube-subtitles";
import { getMockSubtitles } from "@/lib/mock-subtitles";
import { useFeatureFlag } from "@/lib/feature-flags";
import { VideoLearningInterface as VideoLearningInterfaceNew } from "./video-player/VideoLearningInterface";

// 条件日志 - 仅在开发环境输出
const DEBUG = process.env.NODE_ENV === 'development';
const log = DEBUG ? console.log.bind(console) : () => {};
const logError = console.error.bind(console); // 错误始终记录

// YouTube Player API 类型定义
interface YT {
  Player: new (elementId: string, config: YTPlayerConfig) => YTPlayer;
  PlayerState: {
    PLAYING: number;
    PAUSED: number;
    ENDED: number;
    BUFFERING: number;
    CUED: number;
  };
}

interface YTPlayerConfig {
  videoId: string;
  playerVars?: {
    rel?: number;
    modestbranding?: number;
    [key: string]: any;
  };
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerEvent) => void;
  };
}

interface YTPlayer {
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  destroy: () => void;
}

interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

interface Subtitle {
  id: string;
  start: number;
  end: number;
  text: string;
  translation?: string;
}

interface SubtitleWithTranslation extends Subtitle {
  translation: string;
}

interface VideoLearningInterfaceProps {
  videoId: string;
  title: string;
  subtitles?: Subtitle[];
}

// 声明 YouTube iframe API 类型
declare global {
  interface Window {
    YT: YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

type SubtitleMode = 'both' | 'original' | 'translation';

export function VideoLearningInterface({ videoId, title, subtitles = [] }: VideoLearningInterfaceProps) {
  // 默认使用新架构（包含所有新功能：字幕编辑器、发音练习、语法/文化注释等）
  // 如果需要使用旧架构，在控制台执行: disableFeature('video_refactor')
  const useLegacyArchitecture = useFeatureFlag('video_legacy');

  if (!useLegacyArchitecture) {
    return <VideoLearningInterfaceNew videoId={videoId} title={title} subtitles={subtitles} />;
  }

  // 旧架构代码继续...
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [subtitleMode, setSubtitleMode] = useState<SubtitleMode>('both');
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    x: number;
    y: number;
    context: string;
    timestamp: number;
  } | null>(null);
  const [loadedSubtitles, setLoadedSubtitles] = useState<Subtitle[]>([]);
  const [isLoadingSubtitles, setIsLoadingSubtitles] = useState(false);
  const [subtitleError, setSubtitleError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(true);
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [subtitleDelay, setSubtitleDelay] = useState(0);

  const playerRef = useRef<YTPlayer | null>(null);
  const subtitleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const subtitlesRef = useRef<Subtitle[]>([]);
  const loadingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const currentVideoIdRef = useRef<string>(videoId);
  const lastPausedSubtitleRef = useRef<string | null>(null);

  // 滚动到指定字幕 - 必须在 onPlayerReady 之前定义
  const scrollToSubtitle = useCallback((subtitleId: string) => {
    try {
      const element = subtitleRefs.current[subtitleId];
      const container = scrollContainerRef.current;

      if (element && container) {
        const elementTop = element.offsetTop;
        const containerHeight = container.clientHeight;
        const scrollPosition = elementTop - containerHeight / 2 + element.clientHeight / 2;

        container.scrollTo({
          top: Math.max(0, scrollPosition),
          behavior: 'smooth'
        });
      }
    } catch (error) {
      logError('Error scrolling to subtitle:', error);
    }
  }, []);

  // 加载字幕 - 必须在使用它的 useEffect 之前定义
  const loadSubtitles = useCallback(async () => {
    log('[loadSubtitles] Starting, videoId:', videoId);

    // 防止重复加载
    if (loadingRef.current) {
      log('[loadSubtitles] Already loading, skipping');
      return;
    }

    if (subtitles.length > 0) {
      log('[loadSubtitles] Using passed-in subtitles:', subtitles.length);
      setLoadedSubtitles(subtitles);
      return;
    }

    const cached = getCachedSubtitles(videoId);
    if (cached && cached.length > 0) {
      log('[loadSubtitles] Using cached subtitles:', cached.length);
      setLoadedSubtitles(cached.map((sub, idx) => ({
        ...sub,
        id: `sub-${idx}`
      })));
      return;
    }

    loadingRef.current = true;
    setIsLoadingSubtitles(true);
    setSubtitleError(null);

    try {
      log('[loadSubtitles] Fetching from YouTube API...');
      const subs = await fetchYouTubeSubtitles(videoId);

      if (subs.length === 0) {
        log('[loadSubtitles] No subtitles from API, using mock');
        setSubtitleError('该视频暂无字幕。请尝试其他视频，或等待字幕上传。');
        const mockSubs = getMockSubtitles(videoId);
        log('[loadSubtitles] Mock subtitles count:', mockSubs.length);
        setLoadedSubtitles(mockSubs);
        setIsLoadingSubtitles(false);
        loadingRef.current = false;
        log('[loadSubtitles] Finished (early return with mock)');
        return;
      }

      log('[loadSubtitles] Translating subtitles...');
      const translated = await translateSubtitles(subs);

      const formattedSubs = translated.map((sub, idx) => ({
        id: `sub-${idx}`,
        start: sub.start,
        end: sub.end,
        text: sub.text,
        translation: (sub as SubtitleWithTranslation).translation
      }));

      log('[loadSubtitles] Setting formatted subtitles:', formattedSubs.length);
      setLoadedSubtitles(formattedSubs);
      cacheSubtitles(videoId, formattedSubs);
      setIsLoadingSubtitles(false);
      loadingRef.current = false;
      log('[loadSubtitles] Finished (with API subtitles)');
    } catch (error) {
      logError('[loadSubtitles] Error:', error);
      setSubtitleError('字幕加载失败。请检查网络连接后刷新页面重试。');
      const mockSubs = getMockSubtitles(videoId);
      log('[loadSubtitles] Fallback mock subtitles count:', mockSubs.length);
      setLoadedSubtitles(mockSubs);
      setIsLoadingSubtitles(false);
      loadingRef.current = false;
      log('[loadSubtitles] Finished (error fallback)');
    }
  }, [videoId, subtitles]);

  // 播放器事件回调 - 必须在 initPlayer 之前定义
  const onPlayerReady = useCallback(() => {
    if (!isMountedRef.current) return;

    log('Player ready, starting time update interval');
    setIsPlayerLoading(false);

    // 清除旧的interval
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
    }

    // 开始时间更新循环
    timeUpdateInterval.current = setInterval(() => {
      if (!isMountedRef.current) {
        if (timeUpdateInterval.current) {
          clearInterval(timeUpdateInterval.current);
          timeUpdateInterval.current = null;
        }
        return;
      }

      if (playerRef.current && playerRef.current.getCurrentTime) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);

        // 使用 ref 获取最新的字幕数据，应用延迟偏移
        const current = subtitlesRef.current.find(
          sub => time >= (sub.start + subtitleDelay) && time <= (sub.end + subtitleDelay)
        );

        if (current) {
          setCurrentSubtitle(prev => {
            if (prev !== current.id) {
              // 自动滚动到当前字幕
              if (isMountedRef.current) {
                setTimeout(() => {
                  if (isMountedRef.current) {
                    scrollToSubtitle(current.id);
                  }
                }, 0);
              }
              return current.id;
            }
            return prev;
          });
        } else {
          // 当前时间不在任何字幕范围内，检查是否刚结束一句
          const justEnded = subtitlesRef.current.find(
            sub => time > (sub.end + subtitleDelay) && time < (sub.end + subtitleDelay + 0.3) // 300ms 容差
          );

          if (justEnded && autoPauseEnabled && lastPausedSubtitleRef.current !== justEnded.id) {
            // 自动暂停
            if (playerRef.current && playerRef.current.pauseVideo) {
              playerRef.current.pauseVideo();
              lastPausedSubtitleRef.current = justEnded.id;
              log('[AutoPause] Paused after subtitle:', justEnded.id);
            }
          }
        }
      }
    }, 100); // 每100ms更新一次
  }, [scrollToSubtitle, autoPauseEnabled, subtitleDelay]);

  const onPlayerStateChange = useCallback((event: YTPlayerEvent) => {
    setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
  }, []);

  // 初始化播放器
  const initPlayer = useCallback(() => {
    const playerElement = document.getElementById('youtube-player');
    if (!playerElement) {
      log('Player element not found, retrying in 100ms...');
      // DOM 元素可能还没渲染，延迟重试
      setTimeout(() => {
        if (isMountedRef.current) {
          initPlayer();
        }
      }, 100);
      return;
    }

    // 检查是否是当前视频
    if (currentVideoIdRef.current !== videoId) {
      log('Video changed, skipping player init for old video');
      return;
    }

    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        logError('Error destroying previous player:', e);
      }
    }

    log('Initializing YouTube player for video:', videoId);

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  }, [videoId, onPlayerReady, onPlayerStateChange]);

  // 加载 YouTube iframe API
  useEffect(() => {
    isMountedRef.current = true;

    const loadPlayer = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
      }
    };

    if (!window.YT) {
      // 检查是否已经有脚本正在加载
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');

      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      // 保存旧的回调
      const oldCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (oldCallback && typeof oldCallback === 'function') {
          oldCallback();
        }
        loadPlayer();
      };
    } else {
      loadPlayer();
    }

    return () => {
      isMountedRef.current = false;

      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = null;
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          logError('Error destroying player:', e);
        }
        playerRef.current = null;
      }
    };
  }, [videoId, initPlayer]);

  // 加载字幕
  useEffect(() => {
    log('[useEffect] Loading subtitles for videoId:', videoId);

    // 更新当前视频 ID
    currentVideoIdRef.current = videoId;

    // 切换视频时重置状态
    setCurrentSubtitle(null);
    setSelectedSubtitle(null);
    setSelectedWord(null);
    setCurrentTime(0);
    loadingRef.current = false;

    loadSubtitles();
  }, [videoId, loadSubtitles]);

  // 同步字幕到 ref
  useEffect(() => {
    log('[useEffect] Syncing subtitles to ref, count:', loadedSubtitles.length);
    subtitlesRef.current = loadedSubtitles;

    // 清理不再使用的字幕引用
    const currentIds = new Set(loadedSubtitles.map(sub => sub.id));
    Object.keys(subtitleRefs.current).forEach(id => {
      if (!currentIds.has(id)) {
        delete subtitleRefs.current[id];
      }
    });
  }, [loadedSubtitles]);

  // 点击字幕跳转到对应时间
  const handleSubtitleClick = useCallback((subtitle: Subtitle) => {
    setSelectedSubtitle(subtitle.id);
    if (playerRef.current && playerRef.current.seekTo && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(subtitle.start, true);
        if (!isPlaying && playerRef.current.playVideo && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      } catch (error) {
        logError('Error seeking to subtitle:', error);
      }
    }
  }, [isPlaying]);

  // 点击单词
  const handleWordClick = useCallback((word: string, event: React.MouseEvent, subtitleText: string) => {
    event.stopPropagation();
    const cleanedWord = word.trim();

    // 忽略空单词
    if (cleanedWord.length === 0) {
      return;
    }

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedWord({
      word: cleanedWord,
      x: rect.left,
      y: rect.bottom,
      context: subtitleText,
      timestamp: currentTime
    });
  }, [currentTime]);

  // 改变播放速度
  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (playerRef.current && playerRef.current.setPlaybackRate) {
      try {
        playerRef.current.setPlaybackRate(rate);
        setPlaybackRate(rate);
        log('[PlaybackRate] Changed to:', rate);
      } catch (error) {
        logError('Error changing playback rate:', error);
      }
    }
  }, []);

  // 调整字幕延迟
  const adjustSubtitleDelay = useCallback((delta: number) => {
    setSubtitleDelay(prev => {
      const newDelay = Math.max(-5, Math.min(5, prev + delta));
      log('[SubtitleDelay] Adjusted to:', newDelay);
      return newDelay;
    });
  }, []);

  // 重置字幕延迟
  const resetSubtitleDelay = useCallback(() => {
    setSubtitleDelay(0);
    log('[SubtitleDelay] Reset to 0');
  }, []);

  // 分词函数：将文本分割为单词和标点符号
  const tokenizeText = useCallback((text: string) => {
    const tokens: Array<{ type: 'word' | 'punctuation' | 'space'; value: string }> = [];
    // 匹配单词（字母、数字、连字符、撇号）或标点符号
    const regex = /([a-zA-Z0-9'-]+)|([.,!?;:"""''()[\]{}—…])|(\s+)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match[1]) {
        // 单词
        tokens.push({ type: 'word', value: match[1] });
      } else if (match[2]) {
        // 标点符号
        tokens.push({ type: 'punctuation', value: match[2] });
      } else if (match[3]) {
        // 空格
        tokens.push({ type: 'space', value: match[3] });
      }
    }

    return tokens;
  }, []);

  // 上一句/下一句
  const navigateSubtitle = useCallback((direction: 'prev' | 'next') => {
    if (!subtitlesRef.current || subtitlesRef.current.length === 0) {
      return;
    }

    const currentIndex = subtitlesRef.current.findIndex(sub => sub.id === currentSubtitle);
    if (currentIndex === -1) return;

    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < subtitlesRef.current.length) {
      handleSubtitleClick(subtitlesRef.current[newIndex]);
    }
  }, [currentSubtitle, handleSubtitleClick]);

  // 切换播放/暂停
  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch (error) {
      logError('Error toggling play/pause:', error);
    }
  }, [isPlaying]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果用户在输入框中，不处理快捷键
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case ' ': // 空格键：播放/暂停
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowLeft': // 左箭头：上一句
          e.preventDefault();
          navigateSubtitle('prev');
          break;
        case 'ArrowRight': // 右箭头：下一句
          e.preventDefault();
          navigateSubtitle('next');
          break;
        case 'Escape': // Esc：关闭弹窗
          if (selectedWord) {
            setSelectedWord(null);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, navigateSubtitle, selectedWord]);

  return (
    <div className="flex h-screen bg-[#0a0e1a]">
      {/* 左侧导航 */}
      <aside className="w-16 border-r border-white/5 bg-[#0d1117] flex flex-col items-center py-4 gap-4">
        <button className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/20 text-brand transition hover:bg-brand/30">
          <Play size={20} />
        </button>
        <button className="flex h-12 w-12 items-center justify-center rounded-xl text-muted transition hover:bg-white/5">
          <Volume2 size={20} />
        </button>
        <button className="flex h-12 w-12 items-center justify-center rounded-xl text-muted transition hover:bg-white/5">
          <BookmarkPlus size={20} />
        </button>
        <button className="flex h-12 w-12 items-center justify-center rounded-xl text-muted transition hover:bg-white/5">
          <Settings size={20} />
        </button>
      </aside>

      {/* 中间视频区域 */}
      <main className="flex-1 flex flex-col">
        {/* 视频播放器 */}
        <div className="relative aspect-video bg-black">
          {isPlayerLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand/30 border-t-brand" />
                <p className="text-sm text-muted">正在加载播放器...</p>
              </div>
            </div>
          )}
          <div id="youtube-player" className="h-full w-full" />
        </div>

        {/* 视频信息 */}
        <div className="border-b border-white/5 bg-[#0d1117] p-4">
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted">
            <span>{formatTime(currentTime)}</span>
            <button className="transition hover:text-white">保存视频</button>
            <button className="transition hover:text-white">添加到播放列表</button>
          </div>
        </div>

        {/* 控制栏 */}
        <div className="flex items-center justify-between border-b border-white/5 bg-[#0d1117] px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateSubtitle('prev')}
              className="rounded-lg bg-white/5 p-2 transition hover:bg-white/10"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-muted">字幕导航</span>
            <button
              onClick={() => navigateSubtitle('next')}
              className="rounded-lg bg-white/5 p-2 transition hover:bg-white/10"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={autoPauseEnabled}
                onChange={(e) => setAutoPauseEnabled(e.target.checked)}
                className="rounded"
              />
              每句后自动暂停
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">播放速度:</span>
              <select
                value={playbackRate}
                onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white transition hover:bg-white/10 cursor-pointer border border-white/10"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">字幕延迟:</span>
              <button
                onClick={() => adjustSubtitleDelay(-0.5)}
                className="rounded-lg bg-white/5 px-2 py-1 text-sm transition hover:bg-white/10"
              >
                -0.5s
              </button>
              <span className="min-w-[3rem] text-center text-sm text-white">
                {subtitleDelay > 0 ? '+' : ''}{subtitleDelay.toFixed(1)}s
              </span>
              <button
                onClick={() => adjustSubtitleDelay(0.5)}
                className="rounded-lg bg-white/5 px-2 py-1 text-sm transition hover:bg-white/10"
              >
                +0.5s
              </button>
              {subtitleDelay !== 0 && (
                <button
                  onClick={resetSubtitleDelay}
                  className="rounded-lg bg-white/5 px-2 py-1 text-xs text-muted transition hover:bg-white/10"
                >
                  重置
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">字幕模式:</span>
              <button
                onClick={() => setSubtitleMode('both')}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  subtitleMode === 'both'
                    ? 'bg-brand text-white'
                    : 'bg-white/5 text-muted hover:bg-white/10'
                }`}
              >
                双语
              </button>
              <button
                onClick={() => setSubtitleMode('original')}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  subtitleMode === 'original'
                    ? 'bg-brand text-white'
                    : 'bg-white/5 text-muted hover:bg-white/10'
                }`}
              >
                原文
              </button>
              <button
                onClick={() => setSubtitleMode('translation')}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  subtitleMode === 'translation'
                    ? 'bg-brand text-white'
                    : 'bg-white/5 text-muted hover:bg-white/10'
                }`}
              >
                译文
              </button>
            </div>
            <button
              onClick={() => {
                loadingRef.current = false;
                loadSubtitles();
              }}
              disabled={isLoadingSubtitles}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isLoadingSubtitles ? 'animate-spin' : ''} />
              重新加载
            </button>
          </div>
        </div>

        {/* 学习提示 */}
        <div className="border-b border-white/5 bg-[#0d1117] p-4">
          <div className="flex items-start gap-3 rounded-2xl bg-brand/10 p-3">
            <BookmarkPlus className="text-brand" size={18} />
            <div className="flex-1 text-xs">
              <p className="font-medium text-white">学习提示</p>
              <p className="mt-1 text-muted">
                点击字幕跳转播放 · 点击单词查看翻译
                {subtitleError && <span className="text-yellow-400"> · {subtitleError}</span>}
              </p>
              <p className="mt-2 text-muted">
                <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">空格</span> 播放/暂停 ·
                <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] ml-1">←</span>
                <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">→</span> 切换句子 ·
                <span className="inline-block rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] ml-1">Esc</span> 关闭弹窗
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 右侧字幕区域 */}
      <aside className="w-[420px] border-l border-white/5 bg-[#0d1117] flex flex-col">
        <div className="border-b border-white/5 p-4">
          <h2 className="font-semibold text-white">字幕文本</h2>
          <p className="mt-1 text-sm text-muted">
            {isLoadingSubtitles ? '正在加载字幕...' : '当前播放会自动高亮'}
          </p>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {isLoadingSubtitles ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          ) : loadedSubtitles.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-muted">
                <p>没有字幕数据</p>
                <button
                  onClick={() => {
                    loadingRef.current = false;
                    loadSubtitles();
                  }}
                  className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm text-white"
                >
                  重新加载
                </button>
              </div>
            </div>
          ) : (
            loadedSubtitles.map((subtitle) => (
              <div
                key={subtitle.id}
                ref={(el) => { subtitleRefs.current[subtitle.id] = el; }}
                onClick={() => handleSubtitleClick(subtitle)}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  currentSubtitle === subtitle.id
                    ? 'border-brand bg-brand/20 shadow-lg shadow-brand/20'
                    : selectedSubtitle === subtitle.id
                    ? 'border-brand/50 bg-brand/10'
                    : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/[0.07]'
                }`}
              >
                {/* 原文 */}
                {(subtitleMode === 'both' || subtitleMode === 'original') && (
                  <p className={`leading-relaxed text-[15px] ${
                    currentSubtitle === subtitle.id ? 'text-white font-medium' : 'text-white'
                  }`}>
                    {tokenizeText(subtitle.text).map((token, idx) => {
                      if (token.type === 'word') {
                        return (
                          <span
                            key={idx}
                            className="cursor-pointer transition hover:text-brand hover:underline"
                            onClick={(e) => handleWordClick(token.value, e, subtitle.text)}
                          >
                            {token.value}
                          </span>
                        );
                      } else {
                        return <span key={idx}>{token.value}</span>;
                      }
                    })}
                  </p>
                )}

                {/* 翻译 */}
                {(subtitleMode === 'both' || subtitleMode === 'translation') && subtitle.translation && (
                  <p className={`leading-relaxed text-sm text-muted ${
                    subtitleMode === 'both' ? 'mt-3 pt-3 border-t border-white/5' : 'text-[15px]'
                  } ${subtitleMode === 'translation' && currentSubtitle === subtitle.id ? 'text-white font-medium' : ''}`}>
                    {subtitle.translation}
                  </p>
                )}

                {/* 时间戳 */}
                <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                  <span className="rounded bg-white/5 px-2 py-0.5">{formatTime(subtitle.start)}</span>
                  <span>→</span>
                  <span className="rounded bg-white/5 px-2 py-0.5">{formatTime(subtitle.end)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* 单词翻译弹窗 */}
      {selectedWord && (
        <WordPopup
          word={selectedWord.word}
          position={{ x: selectedWord.x, y: selectedWord.y }}
          onClose={() => setSelectedWord(null)}
          context={selectedWord.context}
          timestamp={selectedWord.timestamp}
          videoId={videoId}
        />
      )}
    </div>
  );
}

function formatTime(seconds: number): string {
  // 处理边界情况
  if (!isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
