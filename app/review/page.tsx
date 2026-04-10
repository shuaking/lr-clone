"use client";

import { useState, useEffect, useRef } from "react";
import { useVocabularyStore } from "@/lib/stores/vocabulary-store";
import { calculateSM2, ReviewQuality, getDueWords, calculateReviewStats } from "@/lib/sm2-algorithm";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, Volume2, RotateCcw } from "lucide-react";

export default function ReviewPage() {
  const { vocabulary, updateWord } = useVocabularyStore();
  const [dueWords, setDueWords] = useState<typeof vocabulary>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const showAnswerButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const due = getDueWords(vocabulary);
    setDueWords(due);
  }, [vocabulary]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!showAnswer && e.key === ' ') {
        e.preventDefault();
        setShowAnswer(true);
      } else if (showAnswer) {
        if (e.key === '1') {
          e.preventDefault();
          handleReview(ReviewQuality.AGAIN);
        } else if (e.key === '2') {
          e.preventDefault();
          handleReview(ReviewQuality.HARD);
        } else if (e.key === '3') {
          e.preventDefault();
          handleReview(ReviewQuality.GOOD);
        } else if (e.key === '4') {
          e.preventDefault();
          handleReview(ReviewQuality.EASY);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAnswer, currentIndex]);

  // Focus management
  useEffect(() => {
    if (!showAnswer && showAnswerButtonRef.current) {
      showAnswerButtonRef.current.focus();
    }
  }, [currentIndex, showAnswer]);

  const currentWord = dueWords[currentIndex];
  const stats = calculateReviewStats(vocabulary);
  const progress = dueWords.length > 0 ? ((reviewedCount / dueWords.length) * 100) : 0;

  const handleReview = async (quality: ReviewQuality) => {
    if (!currentWord) return;

    try {
      // 计算 SM-2 结果
      const result = calculateSM2({
        quality,
        repetitions: currentWord.reviewCount || 0,
        easinessFactor: currentWord.masteryLevel || 2.5,
        interval: 0, // 从数据库计算
      });

      // 更新单词
      await updateWord(currentWord.id, {
        masteryLevel: result.easinessFactor,
        reviewCount: result.repetitions,
        nextReviewAt: result.nextReviewDate.toISOString(),
      });

      // 移动到下一个单词
      setReviewedCount(reviewedCount + 1);
      setShowAnswer(false);

      if (currentIndex < dueWords.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        toast.success(`复习完成！共复习 ${dueWords.length} 个单词`);
      }
    } catch (error) {
      console.error('Review failed:', error);
      toast.error('复习失败，请重试');
    }
  };

  const handleSpeak = () => {
    if (!currentWord || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const handleReset = () => {
    setShowAnswer(false);
  };

  if (dueWords.length === 0) {
    return (
      <div className="min-h-screen bg-[#0d1117]">
        <header className="border-b border-white/5 bg-[#0d1117]">
          <div className="mx-auto max-w-4xl px-6 py-4">
            <Link
              href="/vocabulary"
              className="flex items-center gap-2 text-muted transition hover:text-white"
            >
              <ArrowLeft size={20} />
              <span>返回词汇表</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-6 py-20">
          <div className="text-center">
            <div className="mb-6 text-6xl">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-4">太棒了！</h1>
            <p className="text-lg text-muted mb-8">
              今天没有需要复习的单词
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-muted">新单词</p>
                <p className="text-2xl font-bold text-white">{stats.new}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-muted">学习中</p>
                <p className="text-2xl font-bold text-brand">{stats.learning}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-muted">已掌握</p>
                <p className="text-2xl font-bold text-green-400">{stats.mature}</p>
              </div>
            </div>

            <Link
              href="/vocabulary"
              className="inline-block rounded-lg bg-brand px-6 py-3 text-white transition hover:bg-brand/90"
            >
              返回词汇表
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (currentIndex >= dueWords.length) {
    return (
      <div className="min-h-screen bg-[#0d1117]">
        <header className="border-b border-white/5 bg-[#0d1117]">
          <div className="mx-auto max-w-4xl px-6 py-4">
            <Link
              href="/vocabulary"
              className="flex items-center gap-2 text-muted transition hover:text-white"
            >
              <ArrowLeft size={20} />
              <span>返回词汇表</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-6 py-20">
          <div className="text-center">
            <div className="mb-6 text-6xl">✅</div>
            <h1 className="text-3xl font-bold text-white mb-4">复习完成！</h1>
            <p className="text-lg text-muted mb-8">
              今天复习了 {reviewedCount} 个单词
            </p>

            <Link
              href="/vocabulary"
              className="inline-block rounded-lg bg-brand px-6 py-3 text-white transition hover:bg-brand/90"
            >
              返回词汇表
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* 顶部导航 */}
      <header className="border-b border-white/5 bg-[#0d1117]">
        <nav className="mx-auto max-w-4xl px-6 py-4" aria-label="复习导航">
          <div className="flex items-center justify-between">
            <Link
              href="/vocabulary"
              className="flex items-center gap-2 text-muted transition hover:text-white"
              aria-label="退出复习并返回词汇表"
            >
              <ArrowLeft size={20} aria-hidden="true" />
              <span>退出复习</span>
            </Link>

            <div className="text-sm text-muted" aria-live="polite" aria-atomic="true">
              第 {currentIndex + 1} 个，共 {dueWords.length} 个
            </div>
          </div>

          {/* 进度条 */}
          <div
            className="mt-4 h-2 w-full rounded-full bg-white/5"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="复习进度"
          >
            <div
              className="h-full rounded-full bg-brand transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </nav>
      </header>

      {/* 复习卡片 */}
      <main id="main-content" className="mx-auto max-w-2xl px-6 py-12">
        <div className="rounded-2xl border border-white/10 bg-[#11182b] p-8 shadow-2xl">
          {/* 单词 */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex items-center justify-center gap-4">
              <h2 className="text-4xl font-bold text-white">{currentWord.word}</h2>
              <button
                onClick={handleSpeak}
                className="rounded-xl bg-white/5 p-3 transition hover:bg-white/10"
                aria-label={`朗读单词 ${currentWord.word}`}
              >
                <Volume2 size={24} className="text-brand" aria-hidden="true" />
              </button>
            </div>

            {/* 语境 */}
            {currentWord.context && (
              <div className="rounded-lg bg-white/5 p-4">
                <p className="text-sm text-muted mb-1">例句</p>
                <p className="text-sm italic text-slate-400">{currentWord.context}</p>
              </div>
            )}
          </div>

          {/* 答案区域 */}
          {!showAnswer ? (
            <div className="text-center">
              <button
                ref={showAnswerButtonRef}
                onClick={() => setShowAnswer(true)}
                className="rounded-lg bg-brand px-8 py-3 text-lg font-semibold text-white transition hover:bg-brand/90"
              >
                显示答案 <span className="text-sm opacity-75">(Space)</span>
              </button>
            </div>
          ) : (
            <div>
              {/* 翻译 */}
              <div className="mb-6 rounded-lg bg-white/5 p-6">
                <p className="text-sm text-muted mb-2">翻译</p>
                <p className="text-xl text-white">{currentWord.translation}</p>
              </div>

              {/* 评分按钮 */}
              <div className="space-y-3" role="group" aria-label="复习评分">
                <p className="text-center text-sm text-muted mb-4">你记得这个单词吗？</p>

                <button
                  onClick={() => handleReview(ReviewQuality.AGAIN)}
                  className="w-full rounded-lg bg-red-500/20 px-6 py-3 text-red-400 transition hover:bg-red-500/30"
                  aria-label="再来一次，不到 1 天后复习"
                >
                  <span className="font-semibold">再来一次</span>
                  <span className="ml-2 text-sm opacity-75">&lt; 1 天</span>
                  <span className="ml-2 text-xs opacity-50">(1)</span>
                </button>

                <button
                  onClick={() => handleReview(ReviewQuality.HARD)}
                  className="w-full rounded-lg bg-orange-500/20 px-6 py-3 text-orange-400 transition hover:bg-orange-500/30"
                  aria-label="困难，不到 6 天后复习"
                >
                  <span className="font-semibold">困难</span>
                  <span className="ml-2 text-sm opacity-75">&lt; 6 天</span>
                  <span className="ml-2 text-xs opacity-50">(2)</span>
                </button>

                <button
                  onClick={() => handleReview(ReviewQuality.GOOD)}
                  className="w-full rounded-lg bg-green-500/20 px-6 py-3 text-green-400 transition hover:bg-green-500/30"
                  aria-label="良好，约 10 天后复习"
                >
                  <span className="font-semibold">良好</span>
                  <span className="ml-2 text-sm opacity-75">~10 天</span>
                  <span className="ml-2 text-xs opacity-50">(3)</span>
                </button>

                <button
                  onClick={() => handleReview(ReviewQuality.EASY)}
                  className="w-full rounded-lg bg-blue-500/20 px-6 py-3 text-blue-400 transition hover:bg-blue-500/30"
                  aria-label="简单，超过 14 天后复习"
                >
                  <span className="font-semibold">简单</span>
                  <span className="ml-2 text-sm opacity-75">&gt; 14 天</span>
                  <span className="ml-2 text-xs opacity-50">(4)</span>
                </button>
              </div>

              <button
                onClick={handleReset}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm text-muted transition hover:bg-white/10"
                aria-label="隐藏答案重新思考"
              >
                <RotateCcw size={16} aria-hidden="true" />
                <span>重新思考</span>
              </button>
            </div>
          )}
        </div>

        {/* 统计信息 */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center" role="status" aria-label="复习统计">
          <div>
            <p className="text-sm text-muted">待复习</p>
            <p className="text-2xl font-bold text-white">{stats.due}</p>
          </div>
          <div>
            <p className="text-sm text-muted">学习中</p>
            <p className="text-2xl font-bold text-brand">{stats.learning}</p>
          </div>
          <div>
            <p className="text-sm text-muted">已掌握</p>
            <p className="text-2xl font-bold text-green-400">{stats.mature}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
