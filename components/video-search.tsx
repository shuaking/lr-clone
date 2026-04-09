"use client";

import { useState } from "react";
import { searchVideos, getVideoDetails, extractVideoId, YouTubeVideo } from "@/lib/youtube-api";
import { Search, Plus, Loader2, ExternalLink } from "lucide-react";

export function VideoSearch() {
  const [query, setQuery] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const videos = await searchVideos(query, 12);
      setResults(videos);

      if (videos.length === 0) {
        setError("未找到相关视频");
      }
    } catch (err) {
      setError("搜索失败，请检查 API 配置");
    } finally {
      setLoading(false);
    }
  };

  const handleAddByUrl = async () => {
    if (!videoUrl.trim()) return;

    setLoading(true);
    setError("");

    try {
      const videoId = extractVideoId(videoUrl);

      if (!videoId) {
        setError("无效的 YouTube URL");
        setLoading(false);
        return;
      }

      const video = await getVideoDetails(videoId);

      if (video) {
        setResults([video]);
        setVideoUrl("");
      } else {
        setError("无法获取视频信息");
      }
    } catch (err) {
      setError("获取视频失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (video: YouTubeVideo) => {
    const code = `{
  id: 'yt-${Date.now()}',
  title: '${video.title.replace(/'/g, "\\'")}',
  thumbnail: '${video.thumbnail}',
  duration: '${video.duration}',
  views: '${video.views}',
  difficulty: 'intermediate',  // 请手动设置
  channel: '${video.channel}',
  category: 'Conversation'  // 请手动设置
},`;

    navigator.clipboard.writeText(code);
    alert("代码已复制到剪贴板！");
  };

  return (
    <div className="space-y-6">
      {/* 搜索区域 */}
      <div className="panel p-6">
        <h2 className="mb-4 text-xl font-semibold">搜索 YouTube 视频</h2>

        <div className="space-y-4">
          {/* 关键词搜索 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索英语学习视频..."
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-brand/50"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
              搜索
            </button>
          </div>

          {/* URL 添加 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddByUrl()}
              placeholder="或粘贴 YouTube 视频 URL..."
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-brand/50"
            />
            <button
              onClick={handleAddByUrl}
              disabled={loading || !videoUrl.trim()}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-medium transition hover:bg-white/10 disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              添加
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
        </div>
      </div>

      {/* 搜索结果 */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">搜索结果</h3>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((video) => (
              <div key={video.id} className="panel overflow-hidden p-4">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="mb-3 aspect-video w-full rounded-xl object-cover"
                />

                <h4 className="mb-2 font-semibold line-clamp-2">{video.title}</h4>

                <div className="mb-3 flex items-center justify-between text-sm text-muted">
                  <span>{video.channel}</span>
                  <span>{video.duration}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyCode(video)}
                    className="flex-1 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    复制代码
                  </button>

                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/10 bg-white/5 p-2 transition hover:bg-white/10"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="panel p-6">
        <h3 className="mb-3 font-semibold">使用说明</h3>
        <ol className="space-y-2 text-sm text-muted">
          <li>1. 搜索或粘贴 YouTube 视频 URL</li>
          <li>2. 点击"复制代码"获取视频配置</li>
          <li>3. 打开 <code className="rounded bg-white/10 px-2 py-1">lib/content-data.ts</code></li>
          <li>4. 将代码粘贴到 <code className="rounded bg-white/10 px-2 py-1">mockYouTubeContent</code> 数组中</li>
          <li>5. 手动设置 <code className="rounded bg-white/10 px-2 py-1">difficulty</code> 和 <code className="rounded bg-white/10 px-2 py-1">category</code></li>
        </ol>
      </div>
    </div>
  );
}
