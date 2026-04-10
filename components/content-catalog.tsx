"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { getAllVideos, categories, difficulties, ContentItem } from "@/lib/content-data";
import { VideoLearningInterface } from "./video-learning-interface-sync";
import { useSubtitlePreloader } from "@/hooks/useSubtitlePreloader";
import { AdvancedSearch, AdvancedSearchFilters } from "./advanced-search";
import { Play, Clock, Eye, Users } from "lucide-react";

export function ContentCatalog() {
  const t = useTranslations('catalog');
  const [playingVideo, setPlayingVideo] = useState<ContentItem | null>(null);
  const [allVideos, setAllVideos] = useState<ContentItem[]>([]);

  // 高级搜索筛选状态
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    searchQuery: '',
    selectedCategory: 'All',
    selectedDifficulty: 'all',
    selectedTags: [],
    durationFilter: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  // 加载视频
  const loadVideos = () => {
    setAllVideos(getAllVideos());
  };

  useEffect(() => {
    // 初始加载
    loadVideos();

    // 监听 storage 事件（跨标签页同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_videos') {
        loadVideos();
      }
    };

    // 监听自定义事件（同标签页内更新）
    const handleAdminVideoChange = () => {
      loadVideos();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('admin-video-changed', handleAdminVideoChange);

    // 页面获得焦点时重新加载
    const handleFocus = () => {
      loadVideos();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('admin-video-changed', handleAdminVideoChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // 提取所有可用标签
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allVideos.forEach(video => {
      video.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [allVideos]);

  // 解析视频时长（分钟）
  const parseDuration = (duration: string): number => {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // MM:SS
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
    }
    return 0;
  };

  // 解析观看次数
  const parseViews = (views: string): number => {
    const num = parseFloat(views);
    if (views.includes('B')) return num * 1000000000;
    if (views.includes('M')) return num * 1000000;
    if (views.includes('K')) return num * 1000;
    return num;
  };

  // 应用筛选和排序
  const filteredContent = useMemo(() => {
    let result = allVideos.filter(item => {
      // 分类筛选
      const matchesCategory = filters.selectedCategory === 'All' || item.category === filters.selectedCategory;

      // 难度筛选
      const matchesDifficulty = filters.selectedDifficulty === 'all' || item.difficulty === filters.selectedDifficulty;

      // 搜索筛选
      const matchesSearch = !filters.searchQuery ||
        item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.channel.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()));

      // 标签筛选
      const matchesTags = filters.selectedTags.length === 0 ||
        filters.selectedTags.every(tag => item.tags?.includes(tag));

      // 时长筛选
      let matchesDuration = true;
      if (filters.durationFilter !== 'all') {
        const durationSeconds = parseDuration(item.duration);
        if (filters.durationFilter === 'short') {
          matchesDuration = durationSeconds < 300; // < 5分钟
        } else if (filters.durationFilter === 'medium') {
          matchesDuration = durationSeconds >= 300 && durationSeconds <= 900; // 5-15分钟
        } else if (filters.durationFilter === 'long') {
          matchesDuration = durationSeconds > 900; // > 15分钟
        }
      }

      return matchesCategory && matchesDifficulty && matchesSearch && matchesTags && matchesDuration;
    });

    // 排序
    if (filters.sortBy !== 'relevance') {
      result.sort((a, b) => {
        let comparison = 0;

        if (filters.sortBy === 'views') {
          comparison = parseViews(a.views) - parseViews(b.views);
        } else if (filters.sortBy === 'duration') {
          comparison = parseDuration(a.duration) - parseDuration(b.duration);
        } else if (filters.sortBy === 'difficulty') {
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        }

        return filters.sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [allVideos, filters]);

  // 预加载前 5 个视频的字幕
  const preloadVideoIds = useMemo(() => {
    return filteredContent.slice(0, 5).map(item => item.id);
  }, [filteredContent]);

  useSubtitlePreloader(preloadVideoIds);

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return t('beginner');
      case 'intermediate': return t('intermediate');
      case 'advanced': return t('advanced');
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{t('title')}</h1>
          <p className="mt-2 text-muted">{t('subtitle')}</p>
        </div>
        <Link
          href="/channels"
          className="flex items-center gap-2 px-4 py-2 bg-brand/10 hover:bg-brand/20 text-brand rounded-xl transition"
        >
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">浏览频道</span>
        </Link>
      </div>

      {/* 高级搜索 */}
      <AdvancedSearch
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={availableTags}
        categories={categories}
        difficulties={difficulties}
      />

      {/* 结果统计 */}
      <div className="flex items-center justify-between text-sm text-muted">
        <span>找到 {filteredContent.length} 个视频</span>
        {filters.sortBy !== 'relevance' && (
          <span>
            按{filters.sortBy === 'views' ? '观看次数' : filters.sortBy === 'duration' ? '时长' : '难度'}排序
          </span>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredContent.map(item => (
          <div
            key={item.id}
            onClick={() => setPlayingVideo(item)}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition hover:border-white/10 hover:bg-white/[0.07]"
          >
            <div className="relative aspect-video overflow-hidden bg-slate-800">
              <img
                src={item.thumbnail}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition group-hover:scale-105"
                onError={(e) => {
                  // 如果缩略图加载失败，使用备用图片
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('mqdefault')) {
                    target.src = `https://img.youtube.com/vi/${item.id}/mqdefault.jpg`;
                  }
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand">
                  <Play size={24} className="text-white" fill="white" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 rounded-lg bg-black/80 px-2 py-1 text-xs text-white">
                {item.duration}
              </div>
            </div>

            <div className="p-4">
              <h3 className="mb-2 font-semibold text-white line-clamp-2">
                {item.title}
              </h3>

              <p className="mb-2 text-sm text-muted">{item.channel}</p>

              {/* 标签 */}
              {item.tags && item.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {item.views}
                  </span>
                  <span className={`font-medium ${getDifficultyColor(item.difficulty)}`}>
                    {getDifficultyLabel(item.difficulty)}
                  </span>
                </div>
                <span className="rounded-full bg-white/5 px-2 py-1">
                  {item.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-muted">{t('noResults')}</p>
        </div>
      )}

      {/* 视频播放器 */}
      {playingVideo && (
        <VideoLearningInterface
          videoId={playingVideo.id}
          title={playingVideo.title}
        />
      )}
    </div>
  );
}
