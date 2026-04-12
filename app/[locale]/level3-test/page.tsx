"use client";

import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { useSubtitles } from '@/hooks/useSubtitles';
import { useSubtitleSync } from '@/hooks/useSubtitleSync';
import { useCallback, useRef } from 'react';

export default function Level3TestPage() {
  // 完整的 hooks 组合，但最简化的 UI
  const player = useYouTubePlayer({
    videoId: 'dQw4w9WgXcQ',
    onReady: () => {
      console.log('[Level3] Player ready');
    },
    onStateChange: (isPlaying) => {
      console.log('[Level3] Playing state:', isPlaying);
    }
  });

  const subtitlesHook = useSubtitles({
    videoId: 'dQw4w9WgXcQ',
    initialSubtitles: []
  });

  const subtitlesRef = useRef<any[]>([]);
  subtitlesRef.current = subtitlesHook.subtitles;

  const handleSubtitleClick = useCallback((subtitle: any) => {
    console.log('[Level3] Subtitle clicked, seeking to:', subtitle.start);
    player.seekTo(subtitle.start + subtitlesHook.subtitleDelay);
  }, [player, subtitlesHook.subtitleDelay]);

  const sync = useSubtitleSync({
    subtitles: subtitlesHook.subtitles,
    currentTime: player.currentTime,
    subtitleDelay: subtitlesHook.subtitleDelay,
    autoPauseEnabled: false, // 关键：禁用自动暂停
    onAutoPause: player.togglePlayPause,
    // 不传递 onSkipToNext
  });

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="mb-4 text-2xl font-bold">Level 3 测试 - 完整 Hooks 组合</h1>

      <div className="mb-4 rounded-lg bg-gray-800 p-4">
        <p>当前时间: {player.currentTime.toFixed(2)}s</p>
        <p>播放状态: {player.isPlaying ? '✅ 播放中' : '⏸️ 已暂停'}</p>
        <p>字幕数量: {subtitlesHook.subtitles.length}</p>
        <p>当前字幕: {sync.currentSubtitle?.text || '无'}</p>
        <p>自动暂停: ❌ 已禁用</p>
      </div>

      <div className="mb-4">
        <div id="youtube-player" className="aspect-video bg-black"></div>
      </div>

      <div className="mb-4 rounded-lg bg-green-900 p-4">
        <h3 className="font-bold mb-2">✅ 这个测试包含:</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>useYouTubePlayer hook</li>
          <li>useSubtitles hook</li>
          <li>useSubtitleSync hook（autoPauseEnabled: false）</li>
          <li>handleSubtitleClick 函数（但没有 UI 触发）</li>
          <li>所有核心逻辑，但没有复杂的 UI</li>
        </ul>
      </div>

      <div className="rounded-lg bg-blue-900 p-4">
        <h3 className="font-bold mb-2">🎯 测试目的:</h3>
        <p className="text-sm mb-2">
          这是最接近完整应用的测试。如果这个页面：
        </p>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li><strong>正常播放</strong> → 问题在 UI 层（VideoControls、SubtitlePanel 等）</li>
          <li><strong>自动暂停</strong> → 问题在核心 hooks 的交互中</li>
        </ul>
      </div>

      <div className="mt-4 rounded-lg bg-yellow-900 p-4">
        <h3 className="font-bold mb-2">📊 调试信息:</h3>
        <p className="text-xs font-mono">
          打开控制台查看详细日志，特别注意：
        </p>
        <ul className="list-disc list-inside text-xs font-mono space-y-1 mt-2">
          <li>[useYouTubePlayer] PAUSE CALL STACK</li>
          <li>[useSubtitleSync] autoPauseEnabled</li>
          <li>[Level3] 开头的所有日志</li>
        </ul>
      </div>
    </div>
  );
}
