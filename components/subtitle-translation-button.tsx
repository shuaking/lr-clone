/**
 * 字幕翻译按钮和进度对话框
 */

'use client';

import { useState } from 'react';
import { Languages, Loader2, Check, X, AlertCircle } from 'lucide-react';
import { getSubtitleTranslationService, SubtitleTranslationProgress } from '@/lib/subtitle-translation-service';
import { Subtitle } from '@/hooks/useSubtitles';
import { useLanguagePairStore } from '@/lib/stores/language-pair-store';
import { toast } from 'sonner';

interface SubtitleTranslationButtonProps {
  videoId: string;
  subtitles: Subtitle[];
  onTranslationComplete: (translatedSubtitles: Subtitle[]) => void;
}

export function SubtitleTranslationButton({
  videoId,
  subtitles,
  onTranslationComplete
}: SubtitleTranslationButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [progress, setProgress] = useState<SubtitleTranslationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { currentPair } = useLanguagePairStore();

  const handleTranslate = async () => {
    if (subtitles.length === 0) {
      toast.error('没有可翻译的字幕');
      return;
    }

    setShowDialog(true);
    setIsTranslating(true);
    setError(null);
    setProgress(null);

    try {
      const service = getSubtitleTranslationService();

      // 检查是否已有缓存的翻译
      const cached = service.loadTranslatedSubtitles(videoId);
      if (cached && cached.length === subtitles.length) {
        const useCache = confirm('检测到已翻译的字幕，是否使用缓存？\n\n点击"确定"使用缓存，点击"取消"重新翻译。');
        if (useCache) {
          onTranslationComplete(cached);
          toast.success('已加载缓存的翻译');
          setShowDialog(false);
          setIsTranslating(false);
          return;
        }
      }

      // 翻译字幕
      const translatedSubtitles = await service.translateSubtitlesBatch(
        subtitles,
        currentPair.sourceCode,
        currentPair.targetCode,
        10, // 每批 10 条
        (prog) => setProgress(prog)
      );

      // 保存到缓存
      service.saveTranslatedSubtitles(videoId, translatedSubtitles);

      // 通知父组件
      onTranslationComplete(translatedSubtitles);

      toast.success(`成功翻译 ${translatedSubtitles.length} 条字幕`);
      setShowDialog(false);
    } catch (err) {
      console.error('Translation error:', err);
      setError(err instanceof Error ? err.message : '翻译失败');
      toast.error('字幕翻译失败');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCancel = () => {
    if (isTranslating) {
      const confirmCancel = confirm('翻译正在进行中，确定要取消吗？');
      if (!confirmCancel) return;
    }
    setShowDialog(false);
    setIsTranslating(false);
    setProgress(null);
    setError(null);
  };

  return (
    <>
      {/* 翻译按钮 */}
      <button
        onClick={handleTranslate}
        disabled={isTranslating || subtitles.length === 0}
        className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
        title="翻译字幕"
      >
        <Languages size={14} />
        翻译字幕
      </button>

      {/* 翻译进度对话框 */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1117] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">翻译字幕</h3>
              {!isTranslating && (
                <button
                  onClick={handleCancel}
                  className="rounded-lg p-1 transition hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {error ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-400">翻译失败</p>
                    <p className="text-sm text-red-300/80 mt-1">{error}</p>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="w-full rounded-lg bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
                >
                  关闭
                </button>
              </div>
            ) : isTranslating && progress ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">进度</span>
                    <span className="font-medium text-white">
                      {progress.completed} / {progress.total} ({progress.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-brand transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-white/5 p-4">
                  <Loader2 className="animate-spin text-brand" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">正在翻译...</p>
                    <p className="text-xs text-muted mt-1">
                      当前: 第 {progress.currentIndex + 1} 条字幕
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted text-center">
                  翻译可能需要几分钟，请耐心等待
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-brand/10 border border-brand/20 p-4">
                  <Check className="text-brand flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">翻译完成</p>
                    <p className="text-xs text-muted mt-1">
                      已翻译 {subtitles.length} 条字幕
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand/90"
                >
                  完成
                </button>
              </div>
            )}

            <div className="mt-4 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
              <p className="text-xs text-blue-200">
                <strong>提示：</strong>翻译结果会自动缓存，下次打开同一视频时可直接使用。
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
