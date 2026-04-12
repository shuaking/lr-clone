"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { VideoLearningInterface } from "@/components/video-learning-interface-sync";
import { SavedWordsList } from "@/components/saved-words-list";
import { FavoriteVideosList } from "@/components/favorite-videos-list";
import { ApiSettings } from "@/components/api-settings";
import { getAllVideos } from "@/lib/content-data";
import { ArrowLeft, BookOpen, Heart, History, Settings } from "lucide-react";

type View = "video" | "saved" | "favorites" | "history" | "settings";

export default function AppPage() {
  const t = useTranslations('catalog');
  const tSettings = useTranslations('settings');
  const tCommon = useTranslations('common');
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<View>("video");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [showVideoList, setShowVideoList] = useState(true);
  const [allVideos, setAllVideos] = useState<any[]>([]);

  // 在客户端加载视频列表
  useEffect(() => {
    setAllVideos(getAllVideos());
  }, []);

  // 从 URL 参数读取 videoId 并自动加载视频
  useEffect(() => {
    if (allVideos.length === 0) return;

    const videoId = searchParams.get('videoId');
    if (videoId && !selectedVideo) {
      const video = allVideos.find(v => v.id === videoId);
      if (video) {
        setSelectedVideo(video);
        setShowVideoList(false);
      }
    }
  }, [searchParams, allVideos, selectedVideo]);

  // 如果没有选择视频，显示视频选择界面
  if (!selectedVideo && currentView === "video") {
    return (
      <main className="min-h-screen bg-[#090e18] p-4 text-white md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Link href="/" className="mb-4 inline-flex items-center gap-2 text-muted transition hover:text-white">
                <ArrowLeft size={20} />
                {tCommon('cancel')}
              </Link>
              <h1 className="text-3xl font-semibold">选择学习视频</h1>
              <p className="mt-2 text-muted">选择一个视频开始学习</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => {
                  setSelectedVideo(video);
                  setShowVideoList(false);
                }}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition hover:border-white/10 hover:bg-white/[0.07]"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-800">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('mqdefault')) {
                        target.src = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
                      }
                    }}
                  />
                  <div className="absolute bottom-2 right-2 rounded-lg bg-black/80 px-2 py-1 text-xs">
                    {video.duration}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="mb-2 font-semibold line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-muted">{video.channel}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-white/5 px-2 py-1 text-xs">{video.difficulty}</span>
                    <span className="rounded-full bg-white/5 px-2 py-1 text-xs">{video.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // 显示视频学习界面
  if (currentView === "video" && selectedVideo) {
    return (
      <div className="relative">
        {/* 返回按钮 */}
        <button
          onClick={() => setSelectedVideo(null)}
          className="absolute left-4 top-4 z-50 flex items-center gap-2 rounded-xl bg-black/80 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-black/90"
        >
          <ArrowLeft size={16} />
          选择其他视频
        </button>

        <VideoLearningInterface
          videoId={selectedVideo.id}
          title={selectedVideo.title}
        />
      </div>
    );
  }

  // 其他视图（保存的单词、收藏等）
  return (
    <main className="min-h-screen bg-[#090e18] p-4 text-white md:p-6">
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 xl:grid-cols-[260px_1fr]">
        <aside className="panel p-5">
          <Link href="/" className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/20 text-brand">LR</div>
            <div><p className="text-sm text-muted">Workspace</p><p className="font-semibold">Study dashboard</p></div>
          </Link>
          <nav className="space-y-2 text-sm">
            <button
              onClick={() => setCurrentView("video")}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                currentView === "video" ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <BookOpen size={18} />
              视频学习
            </button>
            <button
              onClick={() => setCurrentView("saved")}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                currentView === "saved" ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <BookOpen size={18} />
              Saved words
            </button>
            <button
              onClick={() => setCurrentView("favorites")}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                currentView === "favorites" ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <Heart size={18} />
              Favorite videos
            </button>
            <button
              onClick={() => setCurrentView("history")}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                currentView === "history" ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <History size={18} />
              History
            </button>
            <button
              onClick={() => setCurrentView("settings")}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                currentView === "settings" ? 'bg-white text-slate-900' : 'bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <Settings size={18} />
              {tSettings('title')}
            </button>
          </nav>
        </aside>

        <section className="panel overflow-hidden p-4 md:p-5">
          {currentView === "saved" && <SavedWordsList />}
          {currentView === "favorites" && <FavoriteVideosList />}
          {currentView === "history" && (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <p className="text-lg text-muted">学习历史功能即将推出</p>
              </div>
            </div>
          )}
          {currentView === "settings" && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">设置</h2>
              <ApiSettings />
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
