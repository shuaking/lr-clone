"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X, TrendingUp, Clock, Star } from "lucide-react";

export interface AdvancedSearchFilters {
  searchQuery: string;
  selectedCategory: string;
  selectedDifficulty: string;
  selectedTags: string[];
  durationFilter: 'all' | 'short' | 'medium' | 'long';
  sortBy: 'relevance' | 'views' | 'duration' | 'difficulty';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  filters: AdvancedSearchFilters;
  onFiltersChange: (filters: AdvancedSearchFilters) => void;
  availableTags: string[];
  categories: string[];
  difficulties: { value: string; label: string }[];
}

export function AdvancedSearch({
  filters,
  onFiltersChange,
  availableTags,
  categories,
  difficulties
}: AdvancedSearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof AdvancedSearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.selectedTags.includes(tag)
      ? filters.selectedTags.filter(t => t !== tag)
      : [...filters.selectedTags, tag];
    updateFilter('selectedTags', newTags);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchQuery: '',
      selectedCategory: 'All',
      selectedDifficulty: 'all',
      selectedTags: [],
      durationFilter: 'all',
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  const activeFiltersCount =
    (filters.selectedCategory !== 'All' ? 1 : 0) +
    (filters.selectedDifficulty !== 'all' ? 1 : 0) +
    filters.selectedTags.length +
    (filters.durationFilter !== 'all' ? 1 : 0) +
    (filters.sortBy !== 'relevance' ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type="text"
          placeholder="搜索视频标题、频道、标签..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-panel border border-line rounded-xl text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
        />
      </div>

      {/* 快速筛选和高级选项 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {/* 分类筛选 */}
          <div className="flex gap-2 flex-shrink-0">
            {categories.slice(0, 5).map(cat => (
              <button
                key={cat}
                onClick={() => updateFilter('selectedCategory', cat)}
                className={`rounded-full px-3 py-1.5 text-sm transition whitespace-nowrap ${
                  filters.selectedCategory === cat
                    ? 'bg-brand text-white'
                    : 'border border-line bg-panel text-muted hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 高级筛选按钮 */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition whitespace-nowrap ${
            showAdvanced || activeFiltersCount > 0
              ? 'bg-brand text-white'
              : 'border border-line bg-panel text-muted hover:bg-white/5'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm">高级筛选</span>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* 高级筛选面板 */}
      {showAdvanced && (
        <div className="p-4 bg-panel border border-line rounded-xl space-y-4">
          {/* 难度筛选 */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">难度</label>
            <div className="flex gap-2">
              {difficulties.map(diff => (
                <button
                  key={diff.value}
                  onClick={() => updateFilter('selectedDifficulty', diff.value)}
                  className={`rounded-lg px-3 py-2 text-sm transition ${
                    filters.selectedDifficulty === diff.value
                      ? 'bg-brand text-white'
                      : 'border border-line bg-white/5 text-muted hover:bg-white/10'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* 时长筛选 */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">视频时长</label>
            <div className="flex gap-2">
              {[
                { value: 'all', label: '全部', icon: null },
                { value: 'short', label: '短视频 (<5分钟)', icon: Clock },
                { value: 'medium', label: '中等 (5-15分钟)', icon: Clock },
                { value: 'long', label: '长视频 (>15分钟)', icon: Clock }
              ].map(duration => (
                <button
                  key={duration.value}
                  onClick={() => updateFilter('durationFilter', duration.value)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition ${
                    filters.durationFilter === duration.value
                      ? 'bg-brand text-white'
                      : 'border border-line bg-white/5 text-muted hover:bg-white/10'
                  }`}
                >
                  {duration.icon && <duration.icon className="w-3.5 h-3.5" />}
                  {duration.label}
                </button>
              ))}
            </div>
          </div>

          {/* 标签筛选 */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                标签 {filters.selectedTags.length > 0 && `(${filters.selectedTags.length})`}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`rounded-lg px-3 py-1.5 text-sm transition ${
                      filters.selectedTags.includes(tag)
                        ? 'bg-brand text-white'
                        : 'border border-line bg-white/5 text-muted hover:bg-white/10'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 排序 */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">排序方式</label>
            <div className="flex gap-2">
              {[
                { value: 'relevance', label: '相关度', icon: Star },
                { value: 'views', label: '观看次数', icon: TrendingUp },
                { value: 'duration', label: '时长', icon: Clock },
                { value: 'difficulty', label: '难度', icon: SlidersHorizontal }
              ].map(sort => (
                <button
                  key={sort.value}
                  onClick={() => {
                    if (filters.sortBy === sort.value) {
                      updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      updateFilter('sortBy', sort.value);
                      updateFilter('sortOrder', 'desc');
                    }
                  }}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition ${
                    filters.sortBy === sort.value
                      ? 'bg-brand text-white'
                      : 'border border-line bg-white/5 text-muted hover:bg-white/10'
                  }`}
                >
                  <sort.icon className="w-3.5 h-3.5" />
                  {sort.label}
                  {filters.sortBy === sort.value && (
                    <span className="text-xs">
                      {filters.sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 清除筛选 */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 transition"
            >
              <X className="w-4 h-4" />
              清除所有筛选
            </button>
          )}
        </div>
      )}

      {/* 已选筛选标签 */}
      {activeFiltersCount > 0 && !showAdvanced && (
        <div className="flex flex-wrap gap-2">
          {filters.selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand/10 text-brand rounded-lg text-sm">
              分类: {filters.selectedCategory}
              <button
                onClick={() => updateFilter('selectedCategory', 'All')}
                className="hover:bg-brand/20 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.selectedDifficulty !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand/10 text-brand rounded-lg text-sm">
              难度: {difficulties.find(d => d.value === filters.selectedDifficulty)?.label}
              <button
                onClick={() => updateFilter('selectedDifficulty', 'all')}
                className="hover:bg-brand/20 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.selectedTags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-brand/10 text-brand rounded-lg text-sm">
              #{tag}
              <button
                onClick={() => toggleTag(tag)}
                className="hover:bg-brand/20 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
