// YouTube Player API 类型定义
export interface YT {
  Player: new (elementId: string, config: YTPlayerConfig) => YTPlayer;
  PlayerState: {
    PLAYING: number;
    PAUSED: number;
    ENDED: number;
    BUFFERING: number;
    CUED: number;
  };
}

export interface YTPlayerConfig {
  videoId: string;
  height?: string | number;
  width?: string | number;
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

export interface YTPlayer {
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

export interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

// 全局声明
declare global {
  interface Window {
    YT: YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

export {};
