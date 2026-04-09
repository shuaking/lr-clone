"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, BookOpen, Clock, Video } from "lucide-react";
import { useVocabularyStore } from "@/lib/stores/vocabulary-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { DataMigrationTool } from "@/components/data-migration-tool";

export default function VocabularyPage() {
  const { vocabulary, loadVocabulary, removeWord } = useVocabularyStore();
  const { user, initialize } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'recent'>('all');

  useEffect(() => {
    initialize();
    loadVocabulary();
  }, [initialize, loadVocabulary]);

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个单词吗？')) {
      await removeWord(id);
    }
  };

  const filteredVocabulary = filter === 'recent'
    ? vocabulary.slice(0, 50)
    : vocabulary;

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* 顶部导航 */}
      <header className="border-b border-white/5 bg-[#0d1117]">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-muted transition hover:text-white"
              >
                <ArrowLeft size={20} />
                <span>返回</span>
              </Link>
              <div className="h-6 w-px bg-white/10" />
              <h1 className="text-xl font-semibold text-white">我的词汇表</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted">
              <BookOpen size={16} />
              <span>{vocabulary.length} 个单词</span>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* 数据迁移工具 */}
        {user && (
          <div className="mb-6">
            <DataMigrationTool />
          </div>
        )}

        {/* 筛选器 */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              filter === 'all'
                ? 'bg-brand text-white'
                : 'bg-white/5 text-muted hover:bg-white/10'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              filter === 'recent'
                ? 'bg-brand text-white'
                : 'bg-white/5 text-muted hover:bg-white/10'
            }`}
          >
            最近 50 个
          </button>
        </div>

        {/* 词汇列表 */}
        {filteredVocabulary.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen size={48} className="text-muted" />
            <p className="mt-4 text-lg text-muted">还没有保存任何单词</p>
            <p className="mt-2 text-sm text-muted">在视频学习时点击单词即可保存</p>
            <Link
              href="/"
              className="mt-6 rounded-lg bg-brand px-6 py-3 text-white transition hover:bg-brand/90"
            >
              开始学习
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVocabulary.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/5 bg-white/5 p-5 transition hover:border-white/10 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-white">{item.word}</h3>
                      <span className="text-sm text-muted">{formatDate(item.savedAt)}</span>
                    </div>
                    <p className="mt-2 text-base text-slate-300">{item.translation}</p>

                    {item.context && (
                      <div className="mt-3 rounded-lg bg-white/5 p-3">
                        <p className="text-sm text-muted">语境</p>
                        <p className="mt-1 text-sm italic text-slate-400">{item.context}</p>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                      <div className="flex items-center gap-1">
                        <Video size={14} />
                        <span>视频 ID: {item.videoId}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{formatTimestamp(item.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="ml-4 rounded-lg bg-white/5 p-2 text-muted transition hover:bg-red-500/20 hover:text-red-400"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
