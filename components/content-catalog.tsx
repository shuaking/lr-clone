"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getAllVideos, categories, difficulties, ContentItem } from "@/lib/content-data";
import { VideoLearningInterface } from "./video-learning-interface-sync";
import { useSubtitlePreloader } from "@/hooks/useSubtitlePreloader";
import { AdvancedSearch, AdvancedSearchFilters } from "./advanced-search";
import { staggerContainer, staggerItem, cardHover } from "@/lib/animations";
import { detectVideoLanguage, getLanguageName, suggestLanguagePair, type DetectedLanguage } from "@/lib/language-detection";
import { useLanguagePairStore } from "@/lib/stores/language-pair-store";
import { getLanguagePair } from "@/lib/language-pairs";
import { Play, Clock, Eye, Users, Globe, Lightbulb, X } from "lucide-react";

export function ContentCatalog() {
  const t = useTranslations('catalog');
  const { currentPair, setLanguagePair } = useLanguagePairStore();
  const [playingVideo, setPlayingVideo] = useState<ContentItem | null>(null);
  const [allVideos, setAllVideos] = useState<ContentItem[]>([]);
  const [showSuggestion, setShowSuggestion] = useState(true);

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

  // 检测所有视频的语言
  const videoLanguages = useMemo(() => {
    const languageMap = new Map<string, DetectedLanguage>();
    allVideos.forEach(video => {
      const detectedLang = detectVideoLanguage(video.title, video.channel);
      languageMap.set(video.id, detectedLang);
    });
    return languageMap;
  }, [allVideos]);

  // 分析筛选后视频的主要语言并提供建议
  const languageSuggestion = useMemo(() => {
    if (filteredContent.length === 0) return null;

    // 统计各语言出现次数
    const langCounts = new Map<DetectedLanguage, number>();
    filteredContent.forEach(video => {
      const lang = videoLanguages.get(video.id);
      if (lang && lang !== 'unknown') {
        langCounts.set(lang, (langCounts.get(lang) || 0) + 1);
      }
    });

    // 找出最常见的语言
    let dominantLang: DetectedLanguage | null = null;
    let maxCount = 0;
    langCounts.forEach((count, lang) => {
      if (count > maxCount) {
        maxCount = count;
        dominantLang = lang;
      }
    });

    // 如果主要语言与当前源语言不同，且占比超过50%，则建议切换
    if (dominantLang && dominantLang !== currentPair.sourceCode && maxCount / filteredContent.length > 0.5) {
      const suggestedPairId = suggestLanguagePair(dominantLang, currentPair.targetCode);
      if (suggestedPairId) {
        const suggestedPair = getLanguagePair(suggestedPairId);
        if (suggestedPair) {
          return {
            dominantLang,
            dominantLangName: getLanguageName(dominantLang),
            percentage: Math.round((maxCount / filteredContent.length) * 100),
            suggestedPair
          };
        }
      }
    }

    return null;
  }, [filteredContent, videoLanguages, currentPair]);

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

      {/* 语言建议 */}
      {languageSuggestion && showSuggestion && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex items-start gap-3 p-4 bg-brand/10 border border-brand/20 rounded-xl"
        >
          <Lightbulb className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-ink">
              检测到 <span className="font-semibold text-brand">{languageSuggestion.percentage}%</span> 的视频是{' '}
              <span className="font-semibold">{languageSuggestion.dominantLangName}</span>，
              建议切换到 <span className="font-semibold">{languageSuggestion.suggestedPair.sourceName} → {languageSuggestion.suggestedPair.targetName}</span> 语言对以获得更好的学习体验。
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  setLanguagePair(languageSuggestion.suggestedPair.id);
                  setShowSuggestion(false);
                }}
                className="px-3 py-1 bg-brand hover:bg-brand/90 text-white rounded-lg text-sm font-medium transition"
              >
                切换语言对
              </button>
              <button
                onClick={() => setShowSuggestion(false)}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-muted rounded-lg text-sm transition"
              >
                保持当前设置
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowSuggestion(false)}
            className="text-muted hover:text-ink transition"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

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
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence mode="popLayout">
          {filteredContent.map((item, index) => {
            const detectedLang = videoLanguages.get(item.id) || 'unknown';
            const langName = getLanguageName(detectedLang);

            return (
              <motion.div
              key={item.id}
              variants={staggerItem}
              custom={index}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              whileHover="hover"
              whileTap="tap"
              onClick={() => setPlayingVideo(item)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition-colors hover:border-white/10 hover:bg-white/[0.07]"
            >
              <div className="relative aspect-video overflow-hidden bg-slate-800">
                <motion.img
                  src={item.thumbnail}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('mqdefault')) {
                      target.src = `https://img.youtube.com/vi/${item.id}/mqdefault.jpg`;
                    }
                  }}
                />
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black/40"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-brand"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play size={24} className="text-white" fill="white" />
                  </motion.div>
                </motion.div>
                <div className="absolute bottom-2 right-2 rounded-lg bg-black/80 px-2 py-1 text-xs text-white">
                  {item.duration}
                </div>
                {detectedLang !== 'unknown' && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded-lg bg-black/80 px-2 py-1 text-xs text-white">
                    <Globe size={12} />
                    <span>{langName}</span>
                  </div>
                )}
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
            </motion.div>
          );
        })}
        </AnimatePresence>
      </motion.div>

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
