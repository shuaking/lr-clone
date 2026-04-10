import React, { useRef, useEffect } from 'react';
import { Subtitle, SubtitleMode } from '@/hooks/useSubtitles';
import { SubtitleItem } from './SubtitleItem';

export interface SubtitlePanelProps {
  subtitles: Subtitle[];
  currentSubtitle: Subtitle | null;
  selectedSubtitle: string | null;
  subtitleMode: SubtitleMode;
  isLoading: boolean;
  onSubtitleClick: (subtitle: Subtitle) => void;
  onWordClick: (word: string, event: React.MouseEvent, context: string) => void;
}

const VIRTUAL_SCROLL_THRESHOLD = 150;

export function SubtitlePanel({
  subtitles,
  currentSubtitle,
  selectedSubtitle,
  subtitleMode,
  isLoading,
  onSubtitleClick,
  onWordClick
}: SubtitlePanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const subtitleRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 自动滚动到当前字幕
  useEffect(() => {
    if (!currentSubtitle) return;

    const element = subtitleRefs.current[currentSubtitle.id];
    const container = scrollContainerRef.current;

    if (element && container) {
      const elementTop = element.offsetTop;
      const containerHeight = container.clientHeight;
      const scrollPosition = elementTop - containerHeight / 2 + element.clientHeight / 2;

      container.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  }, [currentSubtitle]);

  // 检查是否需要虚拟滚动
  const shouldUseVirtualScroll = subtitles.length > VIRTUAL_SCROLL_THRESHOLD;

  if (shouldUseVirtualScroll) {
    // TODO: 实现虚拟滚动版本
    // 当前先使用简单列表,性能测试后如果需要再实现
    console.warn(`字幕数量 (${subtitles.length}) 超过阈值 (${VIRTUAL_SCROLL_THRESHOLD}),建议启用虚拟滚动`);
  }

  return (
    <aside className="w-[420px] border-l border-white/5 bg-[#0d1117] flex flex-col">
      {/* 标题 */}
      <div className="border-b border-white/5 p-4">
        <h2 className="font-semibold text-white">字幕文本</h2>
        <p className="mt-1 text-sm text-muted">
          {isLoading ? '正在加载字幕...' : '当前播放会自动高亮'}
        </p>
      </div>

      {/* 字幕列表 */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {isLoading ? (
          // 加载状态
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : subtitles.length === 0 ? (
          // 空状态
          <div className="flex items-center justify-center py-12">
            <div className="text-center text-muted">
              <p>没有字幕数据</p>
            </div>
          </div>
        ) : (
          // 字幕列表
          subtitles.map((subtitle) => (
            <div
              key={subtitle.id}
              ref={(el) => {
                subtitleRefs.current[subtitle.id] = el;
              }}
            >
              <SubtitleItem
                subtitle={subtitle}
                isCurrent={currentSubtitle?.id === subtitle.id}
                isSelected={selectedSubtitle === subtitle.id}
                subtitleMode={subtitleMode}
                onClick={() => onSubtitleClick(subtitle)}
                onWordClick={(word, event) => onWordClick(word, event, subtitle.text)}
              />
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
