'use client';

import { useRef, useEffect } from 'react';
import type { YT, YTPlayer, YTPlayerEvent } from '@/lib/youtube-types';

interface VideoPlayerProps {
  videoId: string;
  onPlayerReady: (player: YTPlayer) => void;
  onStateChange: (event: YTPlayerEvent) => void;
}

export function VideoPlayer({ videoId, onPlayerReady, onStateChange }: VideoPlayerProps) {
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        new window.YT.Player('youtube-player', {
          videoId,
          playerVars: { rel: 0, modestbranding: 1 },
          events: {
            onReady: (event: YTPlayerEvent) => onPlayerReady(event.target),
            onStateChange,
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }
  }, [videoId, onPlayerReady, onStateChange]);

  return (
    <div ref={playerContainerRef} className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <div id="youtube-player" className="h-full w-full" />
    </div>
  );
}
