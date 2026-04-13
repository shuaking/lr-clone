"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { BookmarkPlus, Edit3, X } from 'lucide-react';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { useSubtitles, Subtitle } from '@/hooks/useSubtitles';
import { useSubtitleSync } from '@/hooks/useSubtitleSync';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { usePlayerSettingsStore } from '@/lib/stores/player-settings-store';
import { NavigationSidebar } from './NavigationSidebar';
import { VideoControls } from './VideoControls';
import { SubtitlePanel } from './SubtitlePanel';
import { WordPopupEnhanced } from '../word-popup-enhanced';
import { SubtitleEditor } from '../subtitle-editor';
import { SubtitleTranslationButton } from '../subtitle-translation-button';
import { ErrorBoundary } from '../error-boundary';

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
  const [showSubtitleEditor, setShowSubtitleEditor] = useState(false);

  // 播放器设置
  const loopEnabled = usePlayerSettingsStore((state) => state.loopEnabled);

  // 使用自定义 hooks
  const player = useYouTubePlayer({
    videoId,
    onReady: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[VideoLearningInterface] Player ready');
      }
    },
    onStateChange: (isPlaying) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[VideoLearningInterface] Playing state:', isPlaying);
      }
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
    autoPauseEnabled: autoPauseEnabled,
    onAutoPause: player.togglePlayPause,
    onSkipToNext: (endedSubtitleId: string) => {
      // 找到下一个字幕并跳转
      const currentIndex = subtitlesHook.subtitles.findIndex(sub => sub.id === endedSubtitleId);
      if (currentIndex !== -1 && currentIndex < subtitlesHook.subtitles.length - 1) {
        const nextSubtitle = subtitlesHook.subtitles[currentIndex + 1];
        player.seekTo(nextSubtitle.start + subtitlesHook.subtitleDelay);
      }
    },
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
    <div className="flex h-screen bg-[#0a0e1a] flex-col">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between border-b border-white/5 bg-[#0d1117] px-4 py-2">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-medium text-white truncate max-w-md">{title}</h1>
          <span className="text-xs text-muted">{formatTime(player.currentTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button className="px-2 py-1 rounded transition hover:bg-white/5">保存视频</button>
          <button className="px-2 py-1 rounded transition hover:bg-white/5">添加到播放列表</button>
          <button
            onClick={() => setShowSubtitleEditor(true)}
            className="flex items-center gap-1 px-2 py-1 rounded transition hover:bg-white/5"
          >
            <Edit3 size={12} />
            编辑字幕
          </button>
          <SubtitleTranslationButton
            videoId={videoId}
            subtitles={subtitlesHook.subtitles}
            onTranslationComplete={(translatedSubtitles) => {
              subtitlesHook.setSubtitles(translatedSubtitles);
            }}
          />
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧导航 */}
        <NavigationSidebar />

        {/* 中间视频区域 */}
        <main className="flex-1 flex flex-col">
          {/* 视频播放器 */}
          <div className="relative w-[685px] h-[383px] bg-black ml-4 mt-4">
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
      </div>

      {/* 单词翻译弹窗 */}
      {selectedWord && (
        <WordPopupEnhanced
          word={selectedWord.word}
          position={{ x: selectedWord.x, y: selectedWord.y }}
          onClose={() => setSelectedWord(null)}
          context={selectedWord.context}
          timestamp={selectedWord.timestamp}
          videoId={videoId}
          language="en"
        />
      )}

      {/* 字幕编辑器模态框 */}
      {showSubtitleEditor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowSubtitleEditor(false)}
        >
          <div
            className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h2 className="text-lg font-semibold">字幕编辑器</h2>
              <button
                onClick={() => setShowSubtitleEditor(false)}
                className="rounded-lg p-2 transition hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Editor Content */}
            <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <ErrorBoundary>
                <SubtitleEditor
                  initialSubtitles={subtitlesHook.subtitles.map(sub => ({
                    index: parseInt(sub.id),
                    start: sub.start,
                    end: sub.end,
                    text: sub.text
                  }))}
                  onClose={() => setShowSubtitleEditor(false)}
                  onSave={(editedSubtitles) => {
                    // Convert back to Subtitle format and update
                    const updatedSubtitles = editedSubtitles.map(sub => ({
                      id: sub.index.toString(),
                      start: sub.start,
                      end: sub.end,
                      text: sub.text,
                      translation: subtitlesHook.subtitles.find(s => s.id === sub.index.toString())?.translation || ''
                    }));
                    // Note: This would need a method in useSubtitles to update subtitles
                    if (process.env.NODE_ENV === 'development') {
                      console.log('Edited subtitles:', updatedSubtitles);
                    }
                    setShowSubtitleEditor(false);
                  }}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
