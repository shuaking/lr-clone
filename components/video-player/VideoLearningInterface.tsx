"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { BookmarkPlus } from 'lucide-react';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { useSubtitles, Subtitle } from '@/hooks/useSubtitles';
import { useSubtitleSync } from '@/hooks/useSubtitleSync';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePlayerSettingsStore } from '@/lib/stores/player-settings-store';
import { NavigationSidebar } from './NavigationSidebar';
import { VideoControls } from './VideoControls';
import { SubtitlePanel } from './SubtitlePanel';
import { WordPopup } from '../word-popup';

interface VideoLearningInterfaceProps {
  videoId: string;
  title: string;
  subtitles?: Subtitle[];
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VideoLearningInterface({
  videoId,
  title,
  subtitles: initialSubtitles = []
}: VideoLearningInterfaceProps) {
  // 本地 UI 状态
  const [selectedWord, setSelectedWord] = useState<{
    word: string;
    x: number;
    y: number;
    context: string;
    timestamp: number;
  } | null>(null);
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(false);

  // 播放器设置
  const loopEnabled = usePlayerSettingsStore((state) => state.loopEnabled);

  // 使用自定义 hooks
  const player = useYouTubePlayer({
    videoId,
    onReady: () => {
      console.log('[VideoLearningInterface] Player ready');
    },
    onStateChange: (isPlaying) => {
      console.log('[VideoLearningInterface] Playing state:', isPlaying);
    }
  });

  const subtitlesHook = useSubtitles({
    videoId,
    initialSubtitles
  });

  const sync = useSubtitleSync({
    subtitles: subtitlesHook.subtitles,
    currentTime: player.currentTime,
    subtitleDelay: subtitlesHook.subtitleDelay,
    autoPauseEnabled,
    onAutoPause: player.togglePlayPause,
    onSkipToNext: (endedSubtitleId) => {
      const currentIndex = subtitlesRef.current.findIndex(
        sub => sub.id === endedSubtitleId
      );
      if (currentIndex !== -1 && currentIndex < subtitlesRef.current.length - 1) {
        handleSubtitleClick(subtitlesRef.current[currentIndex + 1]);
      }
    }
  });

  // 循环播放当前句子
  useEffect(() => {
    if (!loopEnabled || !sync.currentSubtitle || !player.isPlaying) return;

    const checkLoop = setInterval(() => {
      const adjustedTime = player.currentTime + subtitlesHook.subtitleDelay;
      if (sync.currentSubtitle && adjustedTime > sync.currentSubtitle.end) {
        player.seekTo(sync.currentSubtitle.start + subtitlesHook.subtitleDelay);
      }
    }, 100);

    return () => clearInterval(checkLoop);
  }, [loopEnabled, sync.currentSubtitle, player, subtitlesHook.subtitleDelay]);

  // 用于字幕导航的 ref
  const subtitlesRef = useRef<Subtitle[]>([]);
  subtitlesRef.current = subtitlesHook.subtitles;

  // 处理字幕点击
  const handleSubtitleClick = useCallback((subtitle: Subtitle) => {
    sync.setSelectedSubtitle(subtitle.id);
    player.seekTo(subtitle.start + subtitlesHook.subtitleDelay);
  }, [sync, player, subtitlesHook.subtitleDelay]);

  // 处理单词点击
  const handleWordClick = useCallback((word: string, event: React.MouseEvent, subtitleText: string) => {
    const cleanedWord = word.trim();
    if (cleanedWord.length === 0) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setSelectedWord({
      word: cleanedWord,
      x: rect.left,
      y: rect.bottom,
      context: subtitleText,
      timestamp: player.currentTime
    });
  }, [player.currentTime]);

  // 字幕导航 (上一句/下一句)
  const navigateSubtitle = useCallback((direction: 'prev' | 'next') => {
    if (subtitlesRef.current.length === 0) return;

    const currentIndex = subtitlesRef.current.findIndex(
      sub => sub.id === sync.currentSubtitle?.id
    );
    if (currentIndex === -1) return;

    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < subtitlesRef.current.length) {
      handleSubtitleClick(subtitlesRef.current[newIndex]);
    }
  }, [sync.currentSubtitle, handleSubtitleClick]);

  // 键盘快捷键
  useKeyboardShortcuts({
    onPlayPause: player.togglePlayPause,
    onPrevSubtitle: () => navigateSubtitle('prev'),
    onNextSubtitle: () => navigateSubtitle('next'),
    onClosePopup: () => setSelectedWord(null)
  });

  return (
    <div className="flex h-screen bg-[#0a0e1a]">
      {/* 左侧导航 */}
      <NavigationSidebar />

      {/* 中间视频区域 */}
      <main className="flex-1 flex flex-col">
        {/* 视频播放器 */}
        <div className="relative aspect-video bg-black">
          {player.isPlayerLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand/30 border-t-brand" />
                <p className="text-sm text-muted">正在加载播放器...</p>
              </div>
            </div>
          )}
          {player.playerError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="text-center">
                <p className="text-red-400">{player.playerError}</p>
              </div>
            </div>
          )}
          <div id="youtube-player" className="h-full w-full" />
        </div>

        {/* 视频信息 */}
        <div className="border-b border-white/5 bg-[#0d1117] p-4">
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted">
            <span>{formatTime(player.currentTime)}</span>
            <button className="transition hover:text-white">保存视频</button>
            <button className="transition hover:text-white">添加到播放列表</button>
          </div>
        </div>

        {/* 控制栏 */}
        <VideoControls
          playbackRate={player.playbackRate}
          onPlaybackRateChange={player.setPlaybackRate}
          subtitleDelay={subtitlesHook.subtitleDelay}
          onSubtitleDelayChange={subtitlesHook.adjustSubtitleDelay}
          onResetDelay={subtitlesHook.resetSubtitleDelay}
          subtitleMode={subtitlesHook.subtitleMode}
          onSubtitleModeChange={subtitlesHook.setSubtitleMode}
          autoPauseEnabled={autoPauseEnabled}
          onAutoPauseChange={setAutoPauseEnabled}
          onReload={subtitlesHook.reload}
          isLoading={subtitlesHook.isLoading}
          onPrevSubtitle={() => navigateSubtitle('prev')}
          onNextSubtitle={() => navigateSubtitle('next')}
        />

        {/* 学习提示 */}
        <div className="border-b border-white/5 bg-[#0d1117] p-4">
          <div className="flex items-start gap-3 rounded-2xl bg-brand/10 p-3">
            <BookmarkPlus className="text-brand" size={18} />
            <div className="flex-1 text-xs">
              <p className="font-medium text-white">学习提示</p>
              <p className="mt-1 text-muted">
                点击字幕跳转播放 · 点击单词查看翻译
                {subtitlesHook.error && (
                  <span className="text-yellow-400"> · {subtitlesHook.error}</span>
                )}
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

      {/* 右侧字幕面板 */}
      <SubtitlePanel
        subtitles={subtitlesHook.subtitles}
        currentSubtitle={sync.currentSubtitle}
        selectedSubtitle={sync.selectedSubtitle}
        subtitleMode={subtitlesHook.subtitleMode}
        isLoading={subtitlesHook.isLoading}
        onSubtitleClick={handleSubtitleClick}
        onWordClick={handleWordClick}
      />

      {/* 单词翻译弹窗 */}
      {selectedWord && (
        <WordPopup
          word={selectedWord.word}
          position={{ x: selectedWord.x, y: selectedWord.y }}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </div>
  );
}
