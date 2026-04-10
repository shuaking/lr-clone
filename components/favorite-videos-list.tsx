"use client";

import { useState, useEffect } from "react";
import { getFavoriteVideos, removeFavoriteVideo, FavoriteVideo } from "@/lib/video-favorites";
import { VideoLearningInterface } from "./video-learning-interface-sync";
import { Trash2, Play, Heart } from "lucide-react";

export function FavoriteVideosList() {
  const [favorites, setFavorites] = useState<FavoriteVideo[]>([]);
  const [playingVideo, setPlayingVideo] = useState<FavoriteVideo | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    setFavorites(getFavoriteVideos());
  };

  const handleDelete = (videoId: string) => {
    if (confirm("确定要取消收藏这个视频吗？")) {
      removeFavoriteVideo(videoId);
      loadFavorites();
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20">
            <Heart className="text-red-400" size={32} />
          </div>
          <h2 className="text-xl font-semibold">还没有收藏的视频</h2>
          <p className="mt-2 text-muted">在内容目录中点击视频播放，然后收藏喜欢的视频</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-semibold">收藏的视频</h2>
            <p className="mt-1 text-sm text-muted">共 {favorites.length} 个视频</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((video) => (
            <div
              key={video.id}
              className="panel overflow-hidden transition hover:border-white/10 hover:bg-white/[0.07]"
            >
              <div
                className="group relative cursor-pointer"
                onClick={() => setPlayingVideo(video)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="aspect-video w-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand">
                    <Play size={24} className="text-white" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 rounded-lg bg-black/80 px-2 py-1 text-xs text-white">
                  {video.duration}
                </div>
              </div>

              <div className="p-4">
                <h3 className="mb-2 font-semibold line-clamp-2">{video.title}</h3>
                <p className="mb-3 text-sm text-muted">{video.channel}</p>

                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{new Date(video.addedAt).toLocaleDateString()}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(video.videoId);
                    }}
                    className="rounded-xl bg-white/5 p-2 transition hover:bg-red-500/20"
                    title="取消收藏"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 视频播放器 */}
      {playingVideo && (
        <VideoLearningInterface
          videoId={playingVideo.videoId}
          title={playingVideo.title}
        />
      )}
    </>
  );
}
