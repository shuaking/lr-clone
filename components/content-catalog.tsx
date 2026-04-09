"use client";

import { useState, useEffect } from "react";
import { getAllVideos, categories, difficulties, ContentItem } from "@/lib/content-data";
import { VideoPlayer } from "./video-player";
import { Play, Clock, Eye } from "lucide-react";

export function ContentCatalog() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingVideo, setPlayingVideo] = useState<ContentItem | null>(null);
  const [allVideos, setAllVideos] = useState<ContentItem[]>([]);

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

  const filteredContent = allVideos.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.channel.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

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
      <div>
        <h1 className="text-3xl font-semibold">YouTube 学习内容</h1>
        <p className="mt-2 text-muted">从精选的 YouTube 视频中学习英语</p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="搜索视频或频道..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-brand/50"
        />

        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                selectedCategory === cat
                  ? 'bg-brand text-white'
                  : 'border border-white/10 bg-white/5 text-muted hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {difficulties.map(diff => (
            <button
              key={diff.value}
              onClick={() => setSelectedDifficulty(diff.value)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                selectedDifficulty === diff.value
                  ? 'bg-white text-slate-900'
                  : 'border border-white/10 bg-white/5 text-muted hover:bg-white/10'
              }`}
            >
              {diff.label}
            </button>
          ))}
        </div>
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

              <p className="mb-3 text-sm text-muted">{item.channel}</p>

              <div className="flex items-center justify-between text-xs text-muted">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {item.views}
                  </span>
                  <span className={`font-medium ${getDifficultyColor(item.difficulty)}`}>
                    {item.difficulty}
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
          <p className="text-muted">没有找到匹配的内容</p>
        </div>
      )}

      {/* 视频播放器 */}
      {playingVideo && (
        <VideoPlayer
          videoId={playingVideo.id}
          title={playingVideo.title}
          channel={playingVideo.channel}
          thumbnail={playingVideo.thumbnail}
          duration={playingVideo.duration}
          onClose={() => setPlayingVideo(null)}
        />
      )}
    </div>
  );
}
