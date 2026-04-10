import { ChevronLeft, ChevronRight, RefreshCw, Type, Repeat } from 'lucide-react';
import { SubtitleMode } from '@/hooks/useSubtitles';
import { usePlayerSettingsStore } from '@/lib/stores/player-settings-store';

export interface VideoControlsProps {
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  subtitleDelay: number;
  onSubtitleDelayChange: (delta: number) => void;
  onResetDelay: () => void;
  subtitleMode: SubtitleMode;
  onSubtitleModeChange: (mode: SubtitleMode) => void;
  autoPauseEnabled: boolean;
  onAutoPauseChange: (enabled: boolean) => void;
  onReload: () => void;
  isLoading: boolean;
  onPrevSubtitle: () => void;
  onNextSubtitle: () => void;
}

export function VideoControls({
  playbackRate,
  onPlaybackRateChange,
  subtitleDelay,
  onSubtitleDelayChange,
  onResetDelay,
  subtitleMode,
  onSubtitleModeChange,
  autoPauseEnabled,
  onAutoPauseChange,
  onReload,
  isLoading,
  onPrevSubtitle,
  onNextSubtitle
}: VideoControlsProps) {
  const fontSize = usePlayerSettingsStore((state) => state.fontSize);
  const setFontSize = usePlayerSettingsStore((state) => state.setFontSize);
  const loopEnabled = usePlayerSettingsStore((state) => state.loopEnabled);
  const setLoopEnabled = usePlayerSettingsStore((state) => state.setLoopEnabled);

  return (
    <div className="flex items-center justify-between border-b border-white/5 bg-[#0d1117] px-4 py-3">
      {/* 左侧：字幕导航 */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevSubtitle}
          className="rounded-lg bg-white/5 p-2 transition hover:bg-white/10"
          aria-label="上一句字幕"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm text-muted">字幕导航</span>
        <button
          onClick={onNextSubtitle}
          className="rounded-lg bg-white/5 p-2 transition hover:bg-white/10"
          aria-label="下一句字幕"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 右侧：控制选项 */}
      <div className="flex items-center gap-4">
        {/* 自动暂停 */}
        <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={autoPauseEnabled}
            onChange={(e) => onAutoPauseChange(e.target.checked)}
            className="rounded"
          />
          每句后自动暂停
        </label>

        {/* 播放速度 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">播放速度:</span>
          <select
            value={playbackRate}
            onChange={(e) => onPlaybackRateChange(Number(e.target.value))}
            className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white transition hover:bg-white/10 cursor-pointer border border-white/10"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>

        {/* 字幕延迟 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">字幕延迟:</span>
          <button
            onClick={() => onSubtitleDelayChange(-0.5)}
            className="rounded-lg bg-white/5 px-2 py-1 text-sm transition hover:bg-white/10"
          >
            -0.5s
          </button>
          <span className="min-w-[3rem] text-center text-sm text-white">
            {subtitleDelay > 0 ? '+' : ''}{subtitleDelay.toFixed(1)}s
          </span>
          <button
            onClick={() => onSubtitleDelayChange(0.5)}
            className="rounded-lg bg-white/5 px-2 py-1 text-sm transition hover:bg-white/10"
          >
            +0.5s
          </button>
          {subtitleDelay !== 0 && (
            <button
              onClick={onResetDelay}
              className="rounded-lg bg-white/5 px-2 py-1 text-xs text-muted transition hover:bg-white/10"
            >
              重置
            </button>
          )}
        </div>

        {/* 字幕模式 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">字幕模式:</span>
          <button
            onClick={() => onSubtitleModeChange('both')}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              subtitleMode === 'both'
                ? 'bg-brand text-white'
                : 'bg-white/5 text-muted hover:bg-white/10'
            }`}
          >
            双语
          </button>
          <button
            onClick={() => onSubtitleModeChange('original')}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              subtitleMode === 'original'
                ? 'bg-brand text-white'
                : 'bg-white/5 text-muted hover:bg-white/10'
            }`}
          >
            原文
          </button>
          <button
            onClick={() => onSubtitleModeChange('translation')}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              subtitleMode === 'translation'
                ? 'bg-brand text-white'
                : 'bg-white/5 text-muted hover:bg-white/10'
            }`}
          >
            译文
          </button>
        </div>

        {/* 循环当前句子 */}
        <button
          onClick={() => setLoopEnabled(!loopEnabled)}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
            loopEnabled
              ? 'bg-brand text-white'
              : 'bg-white/5 text-muted hover:bg-white/10'
          }`}
          aria-label="循环当前句子"
        >
          <Repeat size={14} />
          循环
        </button>

        {/* 字体大小控制 */}
        <div className="flex items-center gap-2 border-l border-white/5 pl-4">
          <Type size={14} className="text-muted" />
          <span className="text-sm text-muted">字体:</span>
          <input
            type="range"
            min="12"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand"
            aria-label="调整字幕字体大小"
          />
          <span className="text-sm text-white min-w-[2.5rem] text-center">{fontSize}px</span>
          {fontSize !== 15 && (
            <button
              onClick={() => setFontSize(15)}
              className="text-xs text-muted hover:text-white transition"
              aria-label="重置字体大小"
            >
              重置
            </button>
          )}
        </div>

        {/* 重新加载 */}
        <button
          onClick={onReload}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm transition hover:bg-white/10 disabled:opacity-50"
          aria-label="重新加载字幕"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          重新加载
        </button>
      </div>
    </div>
  );
}
