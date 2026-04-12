'use client';

import { useRef, useEffect } from 'react';
import type { YT, YTPlayer, YTPlayerEvent } from '@/lib/youtube-types';
import { youtubeAPIManager } from '@/lib/youtube-api-manager';

interface VideoPlayerProps {
  videoId: string;
  onPlayerReady: (player: YTPlayer) => void;
  onStateChange: (event: YTPlayerEvent) => void;
}

export function VideoPlayer({ videoId, onPlayerReady, onStateChange }: VideoPlayerProps) {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  useEffect(() => {
    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        // 销毁旧播放器
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (e) {
            console.error('Error destroying previous player:', e);
          }
        }

        playerRef.current = new window.YT.Player('youtube-player', {
          videoId,
          playerVars: { rel: 0, modestbranding: 1 },
          events: {
            onReady: (event: YTPlayerEvent) => onPlayerReady(event.target),
            onStateChange,
          },
        });
      }
    };

    // 使用 YouTube API 管理器
    youtubeAPIManager.init();
    const unsubscribe = youtubeAPIManager.onReady(initPlayer);

    return () => {
      unsubscribe();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error('Error destroying player on unmount:', e);
        }
        playerRef.current = null;
      }
    };
  }, [videoId, onPlayerReady, onStateChange]);

  return (
    <div ref={playerContainerRef} className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <div id="youtube-player" className="h-full w-full" />
    </div>
  );
}
