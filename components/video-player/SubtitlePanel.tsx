import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Subtitle, SubtitleMode } from '@/hooks/useSubtitles';
import { SubtitleItem } from './SubtitleItem';
import { usePlayerSettingsStore } from '@/lib/stores/player-settings-store';
import { VirtualScroll } from '@/components/virtual-scroll';

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

  const sidebarWidth = usePlayerSettingsStore((state) => state.sidebarWidth);
  const setSidebarWidth = usePlayerSettingsStore((state) => state.setSidebarWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [containerHeight, setContainerHeight] = useState(600);

  // 计算当前字幕的索引（用于虚拟滚动）
  const currentSubtitleIndex = useMemo(() => {
    if (!currentSubtitle) return undefined;
    return subtitles.findIndex(s => s.id === currentSubtitle.id);
  }, [currentSubtitle, subtitles]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setSidebarWidth]);

  // 测量容器高度
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateHeight = () => {
      setContainerHeight(container.clientHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // 自动滚动到当前字幕（非虚拟滚动模式）
  useEffect(() => {
    if (!currentSubtitle || shouldUseVirtualScroll) return;

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

  // 渲染单个字幕项
  const renderSubtitleItem = useCallback((subtitle: Subtitle, index: number) => {
    return (
      <SubtitleItem
        subtitle={subtitle}
        isCurrent={currentSubtitle?.id === subtitle.id}
        isSelected={selectedSubtitle === subtitle.id}
        subtitleMode={subtitleMode}
        onClick={() => onSubtitleClick(subtitle)}
        onWordClick={(word, event) => onWordClick(word, event, subtitle.text)}
      />
    );
  }, [currentSubtitle, selectedSubtitle, subtitleMode, onSubtitleClick, onWordClick]);

  return (
    <aside
      className="border-l border-white/5 bg-[#0d1117] flex flex-col relative"
      style={{ width: `${sidebarWidth}px` }}
    >
      {/* 拖拽调整宽度手柄 */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-brand/50 transition-colors z-10"
        aria-label="调整字幕面板宽度"
      />
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
        ) : shouldUseVirtualScroll ? (
          // 虚拟滚动模式（>150 字幕）
          <VirtualScroll
            items={subtitles}
            itemHeight={120}
            containerHeight={containerHeight}
            renderItem={renderSubtitleItem}
            overscan={5}
            scrollToIndex={currentSubtitleIndex}
          />
        ) : (
          // 普通列表模式（≤150 字幕）
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
