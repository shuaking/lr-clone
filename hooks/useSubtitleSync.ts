import { useState, useEffect, useRef } from 'react';
import { Subtitle } from './useSubtitles';
import { usePlayerSettingsStore } from '@/lib/stores/player-settings-store';

export interface UseSubtitleSyncOptions {
  subtitles: Subtitle[];
  currentTime: number;
  subtitleDelay: number;
  autoPauseEnabled: boolean;
  onAutoPause?: () => void;
  onSkipToNext?: (endedSubtitleId: string) => void;
}

export interface UseSubtitleSyncReturn {
  currentSubtitle: Subtitle | null;
  selectedSubtitle: string | null;
  setSelectedSubtitle: (id: string | null) => void;
}

const DEBUG = process.env.NODE_ENV === 'development';
const log = DEBUG ? console.log.bind(console) : () => {};

// 容差值: 在正常播放速度下给予 300ms 的缓冲时间
// 注意: 在不同播放速度下可能需要调整 (未来优化)
const PAUSE_TOLERANCE = 0.3;

/**
 * 使用二分查找匹配当前字幕
 * 时间复杂度: O(log n)
 */
function findCurrentSubtitle(time: number, subtitles: Subtitle[]): Subtitle | null {
  if (subtitles.length === 0) return null;

  let left = 0;
  let right = subtitles.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const sub = subtitles[mid];

    if (time >= sub.start && time <= sub.end) {
      return sub;
    } else if (time < sub.start) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return null;
}

export function useSubtitleSync({
  subtitles,
  currentTime,
  subtitleDelay,
  autoPauseEnabled,
  onAutoPause,
  onSkipToNext
}: UseSubtitleSyncOptions): UseSubtitleSyncReturn {
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  const lastPausedRef = useRef<string | null>(null);
  const isSentenceKnown = usePlayerSettingsStore((state) => state.isSentenceKnown);

  useEffect(() => {
    // 防御性检查: 空数组直接返回
    if (subtitles.length === 0) {
      setCurrentSubtitle(null);
      return;
    }

    // 应用字幕延迟
    const adjustedTime = currentTime + subtitleDelay;

    // 使用二分查找匹配当前字幕
    const current = findCurrentSubtitle(adjustedTime, subtitles);

    if (current) {
      setCurrentSubtitle(current);
    } else {
      setCurrentSubtitle(null);

      // 检测刚结束的字幕，触发自动暂停或跳过
      // 注意：只有在 autoPauseEnabled 为 true 时才执行此逻辑
      if (DEBUG) {
        console.log('[useSubtitleSync] Checking auto-pause. autoPauseEnabled:', autoPauseEnabled, 'currentTime:', currentTime);
      }
      if (autoPauseEnabled) {
        if (DEBUG) {
          console.log('[useSubtitleSync] AUTO-PAUSE IS ENABLED - checking for ended subtitles');
        }
        const justEnded = subtitles.find(
          sub => adjustedTime > sub.end &&
                 adjustedTime < sub.end + PAUSE_TOLERANCE
        );

        if (justEnded && lastPausedRef.current !== justEnded.id) {
          // 优先检查是否为已知句子，如果是则跳过
          if (isSentenceKnown(justEnded.id) && onSkipToNext) {
            log('[useSubtitleSync] Skipping known sentence:', justEnded.id);
            onSkipToNext(justEnded.id);
            lastPausedRef.current = justEnded.id;
          } else {
            log('[useSubtitleSync] Auto-pause triggered for subtitle:', justEnded.id);
            onAutoPause?.();
            lastPausedRef.current = justEnded.id;
          }
        }
      }
    }
  }, [currentTime, subtitles, subtitleDelay, autoPauseEnabled, onAutoPause, isSentenceKnown, onSkipToNext]);

  return {
    currentSubtitle,
    selectedSubtitle,
    setSelectedSubtitle,
  };
}
