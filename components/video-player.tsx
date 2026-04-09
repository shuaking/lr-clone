"use client";

import { useState, useEffect } from "react";
import { getEmbedUrl } from "@/lib/youtube-api";
import { addFavoriteVideo, removeFavoriteVideo, isVideoFavorited } from "@/lib/video-favorites";
import { X, Heart, ExternalLink, BookmarkPlus } from "lucide-react";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
  onClose: () => void;
}

export function VideoPlayer({ videoId, title, channel, thumbnail, duration, onClose }: VideoPlayerProps) {
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    setIsFavorited(isVideoFavorited(videoId));
  }, [videoId]);

  const handleToggleFavorite = () => {
    if (isFavorited) {
      removeFavoriteVideo(videoId);
      setIsFavorited(false);
    } else {
      addFavoriteVideo({
        videoId,
        title,
        thumbnail,
        channel,
        duration
      });
      setIsFavorited(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-5xl">
        <div className="panel overflow-hidden">
          {/* 头部 */}
          <div className="flex items-center justify-between border-b border-white/5 p-4">
            <div className="flex-1">
              <h2 className="font-semibold line-clamp-1">{title}</h2>
              <p className="text-sm text-muted">{channel}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`rounded-xl p-2 transition ${
                  isFavorited
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-white/5 text-muted hover:bg-white/10'
                }`}
                title={isFavorited ? "取消收藏" : "收藏视频"}
              >
                <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
              </button>

              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-white/5 p-2 transition hover:bg-white/10"
                title="在 YouTube 打开"
              >
                <ExternalLink size={20} />
              </a>

              <button
                onClick={onClose}
                className="rounded-xl bg-white/5 p-2 transition hover:bg-white/10"
                title="关闭"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* 视频播放器 */}
          <div className="relative aspect-video bg-black">
            <iframe
              src={getEmbedUrl(videoId)}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>

          {/* 提示 */}
          <div className="border-t border-white/5 p-4">
            <div className="flex items-start gap-3 rounded-2xl bg-brand/10 p-4">
              <BookmarkPlus className="text-brand" size={20} />
              <div className="flex-1 text-sm">
                <p className="font-medium text-white">学习提示</p>
                <p className="mt-1 text-muted">
                  观看视频时，注意生词和有用的表达。可以暂停视频，使用文本阅读器导入字幕进行学习。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
