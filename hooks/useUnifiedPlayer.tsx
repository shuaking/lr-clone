/**
 * 统一视频播放器组件
 * 支持 YouTube 和 Vimeo
 */

"use client";

import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { useVimeoPlayer } from '@/hooks/useVimeoPlayer';

export type VideoPlatform = 'youtube' | 'vimeo';

export interface UnifiedPlayerProps {
  platform: VideoPlatform;
  videoId: string;
  onReady?: () => void;
  onStateChange?: (isPlaying: boolean) => void;
}

export interface UnifiedPlayerReturn {
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

export function useUnifiedPlayer({
  platform,
  videoId,
  onReady,
  onStateChange
}: UnifiedPlayerProps): UnifiedPlayerReturn {
  const youtubePlayer = useYouTubePlayer({
    videoId: platform === 'youtube' ? videoId : '',
    onReady: platform === 'youtube' ? onReady : undefined,
    onStateChange: platform === 'youtube' ? onStateChange : undefined
  });

  const vimeoPlayer = useVimeoPlayer({
    videoId: platform === 'vimeo' ? videoId : '',
    onReady: platform === 'vimeo' ? onReady : undefined,
    onStateChange: platform === 'vimeo' ? onStateChange : undefined
  });

  return platform === 'youtube' ? youtubePlayer : vimeoPlayer;
}

/**
 * 从 URL 检测视频平台和 ID
 */
export function detectVideoSource(url: string): { platform: VideoPlatform; videoId: string } | null {
  // YouTube 检测
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return { platform: 'youtube', videoId: youtubeMatch[1] };
  }

  // Vimeo 检测
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return { platform: 'vimeo', videoId: vimeoMatch[1] };
  }

  return null;
}

/**
 * 渲染对应平台的播放器容器
 */
export function VideoPlayerContainer({ platform }: { platform: VideoPlatform }) {
  if (platform === 'youtube') {
    return <div id="youtube-player" className="h-full w-full" />;
  }

  if (platform === 'vimeo') {
    return <div id="vimeo-player" className="h-full w-full" />;
  }

  return null;
}
