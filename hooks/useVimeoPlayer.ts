/**
 * Vimeo 播放器 Hook
 * 提供与 YouTube 播放器类似的接口
 */

import { useState, useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    Vimeo: any;
  }
}

export interface UseVimeoPlayerOptions {
  videoId: string;
  onReady?: () => void;
  onStateChange?: (isPlaying: boolean) => void;
}

export interface UseVimeoPlayerReturn {
  isPlayerLoading: boolean;
  playerError: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
}

export function useVimeoPlayer({
  videoId,
  onReady,
  onStateChange
}: UseVimeoPlayerOptions): UseVimeoPlayerReturn {
  const [isPlayerLoading, setIsPlayerLoading] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);

  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 加载 Vimeo Player SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 检查是否已加载
    if (window.Vimeo) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // 初始化播放器
  useEffect(() => {
    if (typeof window === 'undefined' || !window.Vimeo || !videoId) return;

    const initPlayer = async () => {
      try {
        setIsPlayerLoading(true);
        setPlayerError(null);

        const container = document.getElementById('vimeo-player');
        if (!container) {
          throw new Error('Vimeo player container not found');
        }

        // 创建 Vimeo 播放器
        const player = new window.Vimeo.Player(container, {
          id: videoId,
          width: 685,
          height: 383,
          controls: true,
          responsive: false
        });

        playerRef.current = player;

        // 监听事件
        player.on('play', () => {
          setIsPlaying(true);
          onStateChange?.(true);
        });

        player.on('pause', () => {
          setIsPlaying(false);
          onStateChange?.(false);
        });

        player.on('ended', () => {
          setIsPlaying(false);
          onStateChange?.(false);
        });

        player.on('timeupdate', (data: any) => {
          setCurrentTime(data.seconds);
        });

        player.on('loaded', async () => {
          const dur = await player.getDuration();
          setDuration(dur);
          setIsPlayerLoading(false);
          onReady?.();
        });

        player.on('error', (error: any) => {
          console.error('Vimeo player error:', error);
          setPlayerError('播放器加载失败');
          setIsPlayerLoading(false);
        });

      } catch (error) {
        console.error('Failed to initialize Vimeo player:', error);
        setPlayerError('播放器初始化失败');
        setIsPlayerLoading(false);
      }
    };

    // 等待 SDK 加载
    const checkSDK = setInterval(() => {
      if (window.Vimeo) {
        clearInterval(checkSDK);
        initPlayer();
      }
    }, 100);

    return () => {
      clearInterval(checkSDK);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoId, onReady, onStateChange]);

  const togglePlayPause = useCallback(async () => {
    if (!playerRef.current) return;

    try {
      const paused = await playerRef.current.getPaused();
      if (paused) {
        await playerRef.current.play();
      } else {
        await playerRef.current.pause();
      }
    } catch (error) {
      console.error('Toggle play/pause failed:', error);
    }
  }, []);

  const seekTo = useCallback(async (time: number) => {
    if (!playerRef.current) return;

    try {
      await playerRef.current.setCurrentTime(time);
    } catch (error) {
      console.error('Seek failed:', error);
    }
  }, []);

  const setPlaybackRate = useCallback(async (rate: number) => {
    if (!playerRef.current) return;

    try {
      await playerRef.current.setPlaybackRate(rate);
      setPlaybackRateState(rate);
    } catch (error) {
      console.error('Set playback rate failed:', error);
    }
  }, []);

  return {
    isPlayerLoading,
    playerError,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    togglePlayPause,
    seekTo,
    setPlaybackRate
  };
}
