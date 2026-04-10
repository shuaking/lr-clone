"use client";

import { useState, useMemo } from "react";
import { CHANNELS, CHANNEL_CATEGORIES, getChannelsByLanguage, getChannelsByCategory, getChannelsByDifficulty, type Channel } from "@/lib/channels-data";
import { useLanguagePairStore } from "@/lib/stores/language-pair-store";
import { Search, Users, Video, Filter } from "lucide-react";

export function ChannelBrowser() {
  const { currentPair } = useLanguagePairStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // 根据当前语言对筛选频道
  const languageFilteredChannels = useMemo(() => {
    return getChannelsByLanguage(currentPair.sourceCode);
  }, [currentPair.sourceCode]);

  // 应用所有筛选条件
  const filteredChannels = useMemo(() => {
    let channels = languageFilteredChannels;

    // 分类筛选
    if (selectedCategory !== "All") {
      channels = channels.filter(c => c.category === selectedCategory);
    }

    // 难度筛选
    if (selectedDifficulty !== "All") {
      channels = channels.filter(c => c.difficulty === selectedDifficulty);
    }

    // 搜索筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      channels = channels.filter(
        c =>
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return channels;
  }, [languageFilteredChannels, selectedCategory, selectedDifficulty, searchQuery]);

  const difficulties = ["All", "beginner", "intermediate", "advanced"];

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <div className="space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="搜索频道名称、描述或标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-panel border border-line rounded-xl text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
        </div>

        {/* 筛选器 */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted" />
            <span className="text-sm text-muted">筛选:</span>
          </div>

          {/* 分类筛选 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-panel border border-line rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {CHANNEL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "所有分类" : cat}
              </option>
            ))}
          </select>

          {/* 难度筛选 */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1.5 bg-panel border border-line rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff === "All" ? "所有难度" : diff === "beginner" ? "初级" : diff === "intermediate" ? "中级" : "高级"}
              </option>
            ))}
          </select>
        </div>

        {/* 当前语言提示 */}
        <div className="flex items-center gap-2 text-sm text-muted">
          <span>当前学习语言:</span>
          <span className="px-2 py-1 bg-brand/10 text-brand rounded-lg font-medium">
            {currentPair.sourceName}
          </span>
          <span className="text-xs">
            (共 {languageFilteredChannels.length} 个频道)
          </span>
        </div>
      </div>

      {/* 频道列表 */}
      {filteredChannels.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted">没有找到匹配的频道</p>
          <p className="text-sm text-muted mt-1">尝试调整筛选条件或搜索关键词</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredChannels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelCard({ channel }: { channel: Channel }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-line bg-panel transition hover:border-brand/50 hover:bg-white/5">
      {/* 频道头部 */}
      <div className="p-4 border-b border-line">
        <div className="flex items-start gap-3">
          <img
            src={channel.thumbnail}
            alt={channel.name}
            className="w-16 h-16 rounded-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=5b7dd4&color=fff&size=128`;
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-ink line-clamp-1">{channel.name}</h3>
            <p className="text-sm text-muted">{channel.handle}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {channel.subscribers}
              </span>
              <span className="flex items-center gap-1">
                <Video className="w-3 h-3" />
                {channel.videoCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 频道信息 */}
      <div className="p-4 space-y-3">
        <p className="text-sm text-muted line-clamp-2">{channel.description}</p>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-1 rounded-lg text-xs ${
            channel.difficulty === 'beginner' ? 'bg-green-500/10 text-green-400' :
            channel.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-red-500/10 text-red-400'
          }`}>
            {channel.difficulty === 'beginner' ? '初级' : channel.difficulty === 'intermediate' ? '中级' : '高级'}
          </span>
          <span className="px-2 py-1 bg-white/5 rounded-lg text-xs text-muted">
            {channel.category}
          </span>
        </div>

        {/* 标签云 */}
        <div className="flex flex-wrap gap-1">
          {channel.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-white/5 rounded text-xs text-muted">
              #{tag}
            </span>
          ))}
        </div>

        {/* 访问按钮 */}
        <a
          href={`https://www.youtube.com/${channel.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-2 text-center bg-brand/10 hover:bg-brand/20 text-brand rounded-lg text-sm font-medium transition"
        >
          访问频道
        </a>
      </div>
    </div>
  );
}
