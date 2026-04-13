import { useRef, useState, useEffect, useCallback } from 'react';
import type { YT, YTPlayer, YTPlayerEvent } from '@/lib/youtube-types';
import { youtubeAPIManager } from '@/lib/youtube-api-manager';

export interface UseYouTubePlayerOptions {
  videoId: string;
  onReady?: () => void;
  onStateChange?: (isPlaying: boolean) => void;
}

export interface UseYouTubePlayerReturn {
  playerRef: React.RefObject<YTPlayer | null>;
  isPlayerLoading: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  playerError: string | null;

  seekTo: (time: number) => void;
  togglePlayPause: () => void;
  setPlaybackRate: (rate: number) => void;
}

const DEBUG = process.env.NODE_ENV === 'development';
const log = DEBUG ? console.log.bind(console) : () => {};
const logError = console.error.bind(console);

export function useYouTubePlayer({
  videoId,
  onReady,
  onStateChange
}: UseYouTubePlayerOptions): UseYouTubePlayerReturn {
  const playerRef = useRef<YTPlayer | null>(null);
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const currentVideoIdRef = useRef<string>(videoId);
  const lastToggleTimeRef = useRef<number>(0);

  // 使用 ref 存储回调，避免因回调引用变化导致播放器重建
  const onReadyRef = useRef(onReady);
  const onStateChangeRef = useRef(onStateChange);

  // 保持 ref 同步
  useEffect(() => {
    onReadyRef.current = onReady;
    onStateChangeRef.current = onStateChange;
  }, [onReady, onStateChange]);

  const [isPlayerLoading, setIsPlayerLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [playerError, setPlayerError] = useState<string | null>(null);

  // 播放器就绪回调
  const handlePlayerReady = useCallback(() => {
    if (!isMountedRef.current) return;

    log('[useYouTubePlayer] Player ready');
    setIsPlayerLoading(false);
    setPlayerError(null);

    // 清除旧的 interval
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
    }

    // 开始时间更新循环 (100ms)
    timeUpdateInterval.current = setInterval(() => {
      if (!isMountedRef.current) {
        if (timeUpdateInterval.current) {
          clearInterval(timeUpdateInterval.current);
          timeUpdateInterval.current = null;
        }
        return;
      }

      if (playerRef.current?.getCurrentTime) {
        try {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
        } catch (error) {
          logError('[useYouTubePlayer] Error getting current time:', error);
        }
      }
    }, 100);

    onReadyRef.current?.();
  }, []); // 移除 onReady 依赖，使用 ref

  // 播放器状态变化回调
  const handlePlayerStateChange = useCallback((event: YTPlayerEvent) => {
    const playing = event.data === window.YT.PlayerState.PLAYING;
    log('[useYouTubePlayer] State change:', {
      newState: event.data,
      isPlaying: playing,
      stateNames: {
        '-1': 'UNSTARTED',
        '0': 'ENDED',
        '1': 'PLAYING',
        '2': 'PAUSED',
        '3': 'BUFFERING',
        '5': 'CUED'
      }
    });
    setIsPlaying(playing);
    onStateChangeRef.current?.(playing);
  }, []); // 移除 onStateChange 依赖，使用 ref

  // 初始化播放器
  const initPlayer = useCallback(() => {
    const playerElement = document.getElementById('youtube-player');
    if (!playerElement) {
      log('[useYouTubePlayer] Player element not found, retrying...');
      setTimeout(() => {
        if (isMountedRef.current) {
          initPlayer();
        }
      }, 100);
      return;
    }

    // 检查视频是否已切换
    if (currentVideoIdRef.current !== videoId) {
      log('[useYouTubePlayer] Video changed, skipping init for old video');
      return;
    }

    // 销毁旧播放器
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        logError('[useYouTubePlayer] Error destroying previous player:', e);
      }
    }

    log('[useYouTubePlayer] Initializing player for video:', videoId);

    try {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: handlePlayerReady,
          onStateChange: handlePlayerStateChange,
        },
      });
    } catch (error) {
      logError('[useYouTubePlayer] Error initializing player:', error);
      setPlayerError('播放器初始化失败，请刷新页面重试');
      setIsPlayerLoading(false);
    }
  }, [videoId, handlePlayerReady, handlePlayerStateChange]);

  // 加载 YouTube iframe API
  useEffect(() => {
    isMountedRef.current = true;
    currentVideoIdRef.current = videoId;

    const loadPlayer = () => {
      if (window.YT?.Player) {
        initPlayer();
      }
    };

    // 使用 YouTube API 管理器
    youtubeAPIManager.init();
    const unsubscribe = youtubeAPIManager.onReady(loadPlayer);

    return () => {
      log('[useYouTubePlayer] Cleanup: destroying player');
      isMountedRef.current = false;

      // 取消订阅
      unsubscribe();

      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
        timeUpdateInterval.current = null;
      }

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          log('[useYouTubePlayer] Player destroyed successfully');
        } catch (e) {
          logError('[useYouTubePlayer] Error destroying player on unmount:', e);
        }
        playerRef.current = null;
      }
    };
  }, [videoId, initPlayer]);

  // 控制方法：跳转到指定时间
  const seekTo = useCallback((time: number) => {
    if (!playerRef.current) {
      setPlayerError('播放器未就绪，请稍后重试');
      return;
    }
    try {
      playerRef.current.seekTo(time, true);
      setPlayerError(null);
    } catch (error) {
      logError('[useYouTubePlayer] Seek failed:', error);
      setPlayerError('跳转失败，请检查网络连接');
    }
  }, []);

  // 控制方法：播放/暂停切换
  const togglePlayPause = useCallback(() => {
    // 防抖：防止 300ms 内重复调用
    const now = Date.now();
    if (now - lastToggleTimeRef.current < 300) {
      log('[useYouTubePlayer] togglePlayPause debounced - too soon');
      return;
    }
    lastToggleTimeRef.current = now;

    if (!playerRef.current) {
      setPlayerError('播放器未就绪，请稍后重试');
      return;
    }
    try {
      // 直接从播放器获取当前状态，而不是依赖 React state
      const playerState = playerRef.current.getPlayerState?.();
      const isCurrentlyPlaying = playerState === window.YT?.PlayerState?.PLAYING;

      log('[useYouTubePlayer] togglePlayPause called, React isPlaying:', isPlaying, 'Player state:', playerState, 'isCurrentlyPlaying:', isCurrentlyPlaying);

      if (DEBUG) {
        // 详细的调用栈信息
        console.log('=== TOGGLE PLAY/PAUSE CALLED ===');
        console.log('Time:', new Date().toISOString());
        console.log('React isPlaying:', isPlaying);
        console.log('Player state:', playerState);
        console.log('isCurrentlyPlaying:', isCurrentlyPlaying);
        console.trace('FULL CALL STACK:');
        console.log('================================');
      }

      if (isCurrentlyPlaying) {
        log('[useYouTubePlayer] Calling pauseVideo()');
        if (DEBUG) {
          console.trace('[useYouTubePlayer] PAUSE CALL STACK:');
        }
        playerRef.current.pauseVideo();
      } else {
        log('[useYouTubePlayer] Calling playVideo()');
        playerRef.current.playVideo();
      }
      setPlayerError(null);
    } catch (error) {
      logError('[useYouTubePlayer] Play/Pause failed:', error);
      setPlayerError('播放控制失败，请检查网络连接');
    }
  }, [isPlaying]);

  // 控制方法：设置播放速度
  const setPlaybackRate = useCallback((rate: number) => {
    if (!playerRef.current) {
      setPlayerError('播放器未就绪，请稍后重试');
      return;
    }
    try {
      playerRef.current.setPlaybackRate(rate);
      setPlaybackRateState(rate);
      setPlayerError(null);
    } catch (error) {
      logError('[useYouTubePlayer] Set playback rate failed:', error);
      setPlayerError('播放速度调整失败');
    }
  }, []);

  return {
    playerRef,
    isPlayerLoading,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    playerError,
    seekTo,
    togglePlayPause,
    setPlaybackRate,
  };
}
