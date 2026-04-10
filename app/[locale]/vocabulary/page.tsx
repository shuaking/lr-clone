"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import Link from "next/link";
import { ArrowLeft, BookOpen, Brain, Download } from "lucide-react";
import { useVocabularyStore } from "@/lib/stores/vocabulary-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { DataMigrationTool } from "@/components/data-migration-tool";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { VocabularyItem } from "@/components/vocabulary-item";
import { getDueWords, calculateReviewStats } from "@/lib/sm2-algorithm";
import { exportAllWords } from "@/lib/anki-export";
import { toast } from "sonner";

export default function VocabularyPage() {
  const t = useTranslations('vocabulary');
  const tCommon = useTranslations('common');
  const { vocabulary, loadVocabulary, removeWord } = useVocabularyStore();
  const { user, initialize } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'recent'>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string; word: string }>({
    isOpen: false,
    id: '',
    word: '',
  });

  useEffect(() => {
    initialize();
    loadVocabulary();
  }, [initialize, loadVocabulary]);

  const handleDeleteClick = (id: string, word: string) => {
    setDeleteDialog({ isOpen: true, id, word });
  };

  const handleDeleteConfirm = async () => {
    await removeWord(deleteDialog.id);
    setDeleteDialog({ isOpen: false, id: '', word: '' });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, id: '', word: '' });
  };

  const filteredVocabulary = filter === 'recent'
    ? vocabulary.slice(0, 50)
    : vocabulary;

  const dueWords = getDueWords(vocabulary);
  const reviewStats = calculateReviewStats(vocabulary);

  const handleExport = () => {
    try {
      exportAllWords(vocabulary);
      toast.success(t('total', { count: vocabulary.length }) + ' 导出成功');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(tCommon('error'));
      }
    }
  };

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
        <nav className="mx-auto max-w-6xl px-6 py-4" aria-label="主导航">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-muted transition hover:text-white"
                aria-label={tCommon('cancel')}
              >
                <ArrowLeft size={20} aria-hidden="true" />
                <span>{tCommon('cancel')}</span>
              </Link>
              <div className="h-6 w-px bg-white/10" aria-hidden="true" />
              <h1 className="text-xl font-semibold text-white">{t('title')}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted" aria-live="polite">
                <BookOpen size={16} aria-hidden="true" />
                <span>{t('total', { count: vocabulary.length })}</span>
              </div>
              {vocabulary.length > 0 && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm text-muted transition hover:bg-white/10 hover:text-white"
                  aria-label="导出到 Anki (CSV 格式)"
                >
                  <Download size={16} aria-hidden="true" />
                  <span>{tCommon('save')}</span>
                </button>
              )}
              {dueWords.length > 0 && (
                <Link
                  href="/review"
                  className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
                >
                  <Brain size={16} aria-hidden="true" />
                  <span>开始复习 ({dueWords.length})</span>
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* 主内容 */}
      <main id="main-content" className="mx-auto max-w-6xl px-6 py-8">
        {/* 数据迁移工具 */}
        {user && (
          <div className="mb-6">
            <DataMigrationTool />
          </div>
        )}

        {/* 复习统计 */}
        {vocabulary.length > 0 && (
          <div className="mb-6 grid grid-cols-4 gap-4">
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-muted">待复习</p>
              <p className="text-2xl font-bold text-brand">{reviewStats.due}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-muted">新单词</p>
              <p className="text-2xl font-bold text-white">{reviewStats.new}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-muted">学习中</p>
              <p className="text-2xl font-bold text-orange-400">{reviewStats.learning}</p>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-sm text-muted">已掌握</p>
              <p className="text-2xl font-bold text-green-400">{reviewStats.mature}</p>
            </div>
          </div>
        )}

        {/* 筛选器 */}
        <div className="mb-6 flex items-center gap-3" role="group" aria-label="词汇筛选">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              filter === 'all'
                ? 'bg-brand text-white'
                : 'bg-white/5 text-muted hover:bg-white/10'
            }`}
            aria-pressed={filter === 'all'}
          >
            {t('filter.all')}
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              filter === 'recent'
                ? 'bg-brand text-white'
                : 'bg-white/5 text-muted hover:bg-white/10'
            }`}
            aria-pressed={filter === 'recent'}
          >
            最近 50 个
          </button>
        </div>

        {/* 词汇列表 */}
        {filteredVocabulary.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen size={48} className="text-muted" aria-hidden="true" />
            <p className="mt-4 text-lg text-muted">{t('empty')}</p>
            <p className="mt-2 text-sm text-muted">{t('emptyHint')}</p>
            <Link
              href="/"
              className="mt-6 rounded-lg bg-brand px-6 py-3 text-white transition hover:bg-brand/90"
            >
              开始学习
            </Link>
          </div>
        ) : (
          <div className="space-y-3" role="list" aria-label="已保存的词汇">
            {filteredVocabulary.map((item) => (
              <VocabularyItem
                key={item.id}
                item={item}
                onDelete={handleDeleteClick}
                formatTimestamp={formatTimestamp}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title={tCommon('delete')}
        message={`确定要删除单词"${deleteDialog.word}"吗？此操作无法撤销。`}
        confirmLabel={tCommon('delete')}
        cancelLabel={tCommon('cancel')}
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
