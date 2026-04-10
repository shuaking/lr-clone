"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getSavedVocabularySync } from '@/lib/vocabulary-storage';
import { getLearningStatsSync } from '@/lib/learning-stats';
import { usePlayerSettingsStore } from '@/lib/stores/player-settings-store';
import { batchUploadVocabulary } from '@/lib/supabase/vocabulary-sync';
import { batchUploadStats } from '@/lib/supabase/stats-sync';
import { mergeLocalSettingsToCloud } from '@/lib/supabase/settings-sync';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const MIGRATION_KEY = 'lr-migration-completed';

export function DataMigrationTool() {
  const { user } = useAuthStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 3 });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // 检查是否需要显示迁移提示
    if (!user) {
      setShowPrompt(false);
      return;
    }

    // 检查是否已经迁移过
    const migrationCompleted = localStorage.getItem(MIGRATION_KEY);
    if (migrationCompleted === 'true') {
      setShowPrompt(false);
      return;
    }

    // 检查是否有本地数据
    const hasLocalData = checkLocalData();
    setShowPrompt(hasLocalData);
  }, [user]);

  const checkLocalData = (): boolean => {
    const vocabulary = getSavedVocabularySync();
    const stats = getLearningStatsSync();
    const settings = usePlayerSettingsStore.getState();

    return (
      vocabulary.length > 0 ||
      stats.totalDays > 0 ||
      Object.keys(stats.dailyActivity).length > 0 ||
      settings.knownSentences.size > 0
    );
  };

  const handleMigrate = async () => {
    setMigrating(true);
    setStatus('migrating');
    setProgress({ current: 0, total: 3 });

    try {
      // 步骤 1: 迁移词汇表
      setProgress({ current: 1, total: 3 });
      const vocabulary = getSavedVocabularySync();
      if (vocabulary.length > 0) {
        await batchUploadVocabulary(vocabulary);
      }

      // 步骤 2: 迁移学习统计
      setProgress({ current: 2, total: 3 });
      const stats = getLearningStatsSync();
      if (Object.keys(stats.dailyActivity).length > 0) {
        await batchUploadStats(stats.dailyActivity);
      }

      // 步骤 3: 迁移播放器设置
      setProgress({ current: 3, total: 3 });
      const settings = usePlayerSettingsStore.getState();
      await mergeLocalSettingsToCloud({
        fontSize: settings.fontSize,
        sidebarWidth: settings.sidebarWidth,
        loopEnabled: settings.loopEnabled,
        knownSentences: settings.knownSentences,
      });

      // 标记迁移完成
      localStorage.setItem(MIGRATION_KEY, 'true');
      setStatus('success');

      // 3秒后自动关闭
      setTimeout(() => {
        setShowPrompt(false);
      }, 3000);
    } catch (error: any) {
      console.error('Migration failed:', error);
      setStatus('error');
      setErrorMessage(error.message || '迁移失败，请稍后重试');
    } finally {
      setMigrating(false);
    }
  };

  const handleSkip = () => {
    // 标记为已完成（跳过）
    localStorage.setItem(MIGRATION_KEY, 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#11182b] p-6 shadow-2xl">
        {/* 关闭按钮 */}
        {status !== 'migrating' && (
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 rounded-lg p-1 text-muted transition hover:bg-white/5 hover:text-white"
            aria-label="关闭"
          >
            <X size={20} />
          </button>
        )}

        {/* 标题 */}
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-brand/20 p-2">
            <Upload className="text-brand" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">数据迁移</h2>
            <p className="text-sm text-muted">将本地数据同步到云端</p>
          </div>
        </div>

        {/* 内容 */}
        {status === 'idle' && (
          <>
            <div className="mb-6 space-y-3 rounded-xl bg-white/5 p-4">
              <p className="text-sm text-slate-300">
                检测到您有本地保存的学习数据。立即迁移到云端，即可：
              </p>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-brand">✓</span>
                  <span>跨设备同步词汇表和学习进度</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand">✓</span>
                  <span>数据安全备份，永不丢失</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand">✓</span>
                  <span>保留所有学习记录和设置</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleMigrate}
                className="flex-1 rounded-xl bg-brand py-3 font-semibold text-white transition hover:bg-brand/90"
              >
                立即迁移
              </button>
              <button
                onClick={handleSkip}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm text-muted transition hover:bg-white/5 hover:text-white"
              >
                跳过
              </button>
            </div>
          </>
        )}

        {status === 'migrating' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand/30 border-t-brand" />
            </div>
            <div className="text-center">
              <p className="text-white">正在迁移数据...</p>
              <p className="mt-2 text-sm text-muted">
                步骤 {progress.current} / {progress.total}
              </p>
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-500/20 p-3">
                <CheckCircle className="text-green-400" size={48} />
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-white">迁移成功！</p>
              <p className="mt-2 text-sm text-muted">
                您的数据已安全同步到云端
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-500/20 p-3">
                <AlertCircle className="text-red-400" size={48} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-white">迁移失败</p>
              <p className="mt-2 text-sm text-muted">{errorMessage}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleMigrate}
                className="flex-1 rounded-xl bg-brand py-3 font-semibold text-white transition hover:bg-brand/90"
              >
                重试
              </button>
              <button
                onClick={handleSkip}
                className="rounded-xl border border-white/10 px-4 py-3 text-sm text-muted transition hover:bg-white/5 hover:text-white"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
