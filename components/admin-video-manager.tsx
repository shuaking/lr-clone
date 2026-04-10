"use client";

import { useState, useEffect } from "react";
import { getAdminVideos, addAdminVideo, deleteAdminVideo, AdminVideo } from "@/lib/admin-videos";
import { getVideoDetails, searchVideos, extractVideoId, getThumbnailUrl } from "@/lib/youtube-api";
import { categories, difficulties } from "@/lib/content-data";
import { Search, Plus, Trash2, Video, AlertCircle, CheckCircle } from "lucide-react";

type Tab = "manual" | "search" | "manage";

export function AdminVideoManager() {
  const [activeTab, setActiveTab] = useState<Tab>("manual");
  const [adminVideos, setAdminVideos] = useState<AdminVideo[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 手动添加状态
  const [manualForm, setManualForm] = useState({
    videoId: '',
    title: '',
    channel: '',
    duration: '',
    views: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category: 'Conversation'
  });

  // 搜索状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // URL 添加状态
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  useEffect(() => {
    loadAdminVideos();
  }, []);

  const loadAdminVideos = () => {
    setAdminVideos(getAdminVideos());
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 手动添加视频
  const handleManualAdd = () => {
    try {
      if (!manualForm.videoId || !manualForm.title) {
        showMessage('error', '请填写视频 ID 和标题');
        return;
      }

      addAdminVideo({
        id: manualForm.videoId,
        title: manualForm.title,
        thumbnail: getThumbnailUrl(manualForm.videoId),
        duration: manualForm.duration || '0:00',
        views: manualForm.views || '0',
        difficulty: manualForm.difficulty,
        channel: manualForm.channel || 'Unknown',
        category: manualForm.category
      });

      showMessage('success', '视频添加成功！');
      setManualForm({
        videoId: '',
        title: '',
        channel: '',
        duration: '',
        views: '',
        difficulty: 'beginner',
        category: 'Conversation'
      });
      loadAdminVideos();
    } catch (error: any) {
      showMessage('error', error.message || '添加失败');
    }
  };

  // 通过 URL 添加
  const handleUrlAdd = async () => {
    try {
      setIsLoadingUrl(true);
      const videoId = extractVideoId(videoUrl);

      if (!videoId) {
        showMessage('error', '无效的 YouTube URL');
        return;
      }

      const details = await getVideoDetails(videoId);

      if (!details) {
        showMessage('error', '无法获取视频信息，请检查 API Key 配置');
        return;
      }

      // 自动填充表单
      setManualForm({
        videoId: details.id,
        title: details.title,
        channel: details.channel,
        duration: details.duration,
        views: details.views,
        difficulty: 'beginner',
        category: 'Conversation'
      });

      setVideoUrl('');
      setActiveTab('manual');
      showMessage('success', '视频信息已加载，请选择难度和分类后添加');
    } catch (error: any) {
      showMessage('error', error.message || '加载失败');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // 搜索视频
  const handleSearch = async () => {
    try {
      setIsSearching(true);
      const results = await searchVideos(searchQuery, 12);

      if (results.length === 0) {
        showMessage('error', '未找到视频，请检查 API Key 配置');
      }

      setSearchResults(results);
    } catch (error: any) {
      showMessage('error', error.message || '搜索失败');
    } finally {
      setIsSearching(false);
    }
  };

  // 从搜索结果添加
  const handleAddFromSearch = (video: any) => {
    setManualForm({
      videoId: video.id,
      title: video.title,
      channel: video.channel,
      duration: video.duration,
      views: video.views,
      difficulty: 'beginner',
      category: 'Conversation'
    });
    setActiveTab('manual');
    showMessage('success', '视频信息已加载，请选择难度和分类后添加');
  };

  // 删除视频
  const handleDelete = (videoId: string) => {
    if (confirm('确定要删除这个视频吗？')) {
      deleteAdminVideo(videoId);
      loadAdminVideos();
      showMessage('success', '视频已删除');
    }
  };

  return (
    <div className="space-y-6">
      {/* 消息提示 */}
      {message && (
        <div className={`rounded-2xl p-4 ${
          message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <p>{message.text}</p>
          </div>
        </div>
      )}

      {/* 标签页 */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('manual')}
          className={`rounded-2xl px-6 py-3 transition ${
            activeTab === 'manual'
              ? 'bg-brand text-white'
              : 'bg-white/5 text-muted hover:bg-white/10'
          }`}
        >
          手动添加
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`rounded-2xl px-6 py-3 transition ${
            activeTab === 'search'
              ? 'bg-brand text-white'
              : 'bg-white/5 text-muted hover:bg-white/10'
          }`}
        >
          搜索添加
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`rounded-2xl px-6 py-3 transition ${
            activeTab === 'manage'
              ? 'bg-brand text-white'
              : 'bg-white/5 text-muted hover:bg-white/10'
          }`}
        >
          管理视频 ({adminVideos.length})
        </button>
      </div>

      {/* 手动添加 */}
      {activeTab === 'manual' && (
        <div className="space-y-6">
          <div className="panel p-6">
            <h2 className="mb-4 text-xl font-semibold">手动添加视频</h2>

            {/* URL 快速加载 */}
            <div className="mb-6 rounded-2xl bg-white/5 p-4">
              <label className="mb-2 block text-sm text-muted">快速加载（需要 API Key）</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="粘贴 YouTube 视频 URL..."
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-brand"
                />
                <button
                  onClick={handleUrlAdd}
                  disabled={isLoadingUrl || !videoUrl}
                  className="rounded-2xl bg-brand px-6 py-2 transition hover:bg-brand/90 disabled:opacity-50"
                >
                  {isLoadingUrl ? '加载中...' : '加载'}
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-muted">视频 ID *</label>
                <input
                  type="text"
                  value={manualForm.videoId}
                  onChange={(e) => setManualForm({ ...manualForm, videoId: e.target.value })}
                  placeholder="dQw4w9WgXcQ"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted">标题 *</label>
                <input
                  type="text"
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  placeholder="视频标题"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted">频道</label>
                <input
                  type="text"
                  value={manualForm.channel}
                  onChange={(e) => setManualForm({ ...manualForm, channel: e.target.value })}
                  placeholder="频道名称"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted">时长</label>
                <input
                  type="text"
                  value={manualForm.duration}
                  onChange={(e) => setManualForm({ ...manualForm, duration: e.target.value })}
                  placeholder="10:30"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted">观看次数</label>
                <input
                  type="text"
                  value={manualForm.views}
                  onChange={(e) => setManualForm({ ...manualForm, views: e.target.value })}
                  placeholder="1.5M"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-muted">难度 *</label>
                <select
                  value={manualForm.difficulty}
                  onChange={(e) => setManualForm({ ...manualForm, difficulty: e.target.value as any })}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-brand"
                >
                  {difficulties.filter(d => d.value !== 'all').map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-muted">分类 *</label>
                <select
                  value={manualForm.category}
                  onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 outline-none focus:border-brand"
                >
                  {categories.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleManualAdd}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-3 transition hover:bg-brand/90"
            >
              <Plus size={20} />
              添加视频
            </button>
          </div>
        </div>
      )}

      {/* 搜索添加 */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="panel p-6">
            <h2 className="mb-4 text-xl font-semibold">搜索 YouTube 视频</h2>
            <p className="mb-4 text-sm text-muted">需要配置 YouTube API Key</p>

            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索英语学习视频..."
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-brand"
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery}
                className="flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 transition hover:bg-brand/90 disabled:opacity-50"
              >
                <Search size={20} />
                {isSearching ? '搜索中...' : '搜索'}
              </button>
            </div>
          </div>

          {/* 搜索结果 */}
          {searchResults.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {searchResults.map(video => (
                <div key={video.id} className="panel overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="mb-2 font-semibold line-clamp-2">{video.title}</h3>
                    <p className="mb-3 text-sm text-muted">{video.channel}</p>
                    <div className="mb-3 flex items-center gap-3 text-xs text-muted">
                      <span>{video.duration}</span>
                      <span>{video.views} views</span>
                    </div>
                    <button
                      onClick={() => handleAddFromSearch(video)}
                      className="w-full rounded-2xl bg-brand px-4 py-2 text-sm transition hover:bg-brand/90"
                    >
                      选择此视频
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 管理视频 */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          {adminVideos.length === 0 ? (
            <div className="panel flex min-h-[40vh] items-center justify-center p-12">
              <div className="text-center">
                <Video size={48} className="mx-auto mb-4 text-muted" />
                <p className="text-lg text-muted">还没有添加任何视频</p>
                <p className="mt-2 text-sm text-muted">使用"手动添加"或"搜索添加"来添加视频</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {adminVideos.map(video => (
                <div key={video.id} className="panel overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    loading="lazy"
                    className="aspect-video w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="mb-2 font-semibold line-clamp-2">{video.title}</h3>
                    <p className="mb-2 text-sm text-muted">{video.channel}</p>
                    <div className="mb-3 flex items-center gap-2 text-xs">
                      <span className="rounded-full bg-white/5 px-2 py-1">{video.difficulty}</span>
                      <span className="rounded-full bg-white/5 px-2 py-1">{video.category}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/30"
                    >
                      <Trash2 size={16} />
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
