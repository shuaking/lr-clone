"use client";

import { useState, useEffect } from "react";
import { getSavedWords, SavedWord } from "@/lib/storage";
import { recordActivity } from "@/lib/learning-stats";
import { PronunciationPractice } from "@/components/pronunciation-practice";
import { Play, Pause, RotateCcw, Volume2, CheckCircle, XCircle, Mic } from "lucide-react";

interface Exercise {
  id: string;
  sentence: string;
  targetWord: SavedWord;
  blankedSentence: string;
  userAnswer: string;
  isCorrect: boolean | null;
}

export function PhrasePump() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showPronunciation, setShowPronunciation] = useState(false);

  useEffect(() => {
    generateExercises();
  }, []);

  const generateExercises = () => {
    const savedWords = getSavedWords();

    if (savedWords.length === 0) {
      return;
    }

    // 为每个保存的单词生成练习
    const newExercises: Exercise[] = savedWords.slice(0, 10).map((word, index) => {
      const sentence = word.context || `This is an example sentence with the word ${word.word}.`;
      const blankedSentence = sentence.replace(
        new RegExp(`\\b${word.word}\\b`, 'gi'),
        '______'
      );

      return {
        id: `ex-${index}`,
        sentence,
        targetWord: word,
        blankedSentence,
        userAnswer: '',
        isCorrect: null
      };
    });

    setExercises(newExercises);
  };

  const currentExercise = exercises[currentIndex];

  const handlePlayAudio = () => {
    if (!currentExercise) return;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentExercise.sentence);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);

      speechSynthesis.speak(utterance);
    }
  };

  const handleSubmit = () => {
    if (!currentExercise || !userInput.trim()) return;

    const isCorrect = userInput.trim().toLowerCase() === currentExercise.targetWord.word.toLowerCase();

    const updatedExercises = [...exercises];
    updatedExercises[currentIndex] = {
      ...currentExercise,
      userAnswer: userInput,
      isCorrect
    };

    setExercises(updatedExercises);
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // 记录练习活动
    recordActivity('practice', 2).catch(console.error); // 异步记录,不阻塞UI
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      setShowPronunciation(false); // 重置发音练习状态
    }
  };

  const handleRestart = () => {
    generateExercises();
    setCurrentIndex(0);
    setUserInput("");
    setScore({ correct: 0, total: 0 });
  };

  if (exercises.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/20">
            <Volume2 className="text-brand" size={32} />
          </div>
          <h2 className="text-xl font-semibold">还没有保存的单词</h2>
          <p className="mt-2 text-muted">先在阅读器中保存一些单词，然后回来练习</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= exercises.length) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/20">
            <CheckCircle className="text-accent" size={40} />
          </div>
          <h2 className="text-2xl font-semibold">练习完成！</h2>
          <p className="mt-2 text-lg text-muted">
            正确率: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
          </p>
          <p className="mt-1 text-muted">
            {score.correct} / {score.total} 题正确
          </p>
          <button
            onClick={handleRestart}
            className="mt-6 rounded-full bg-white px-6 py-3 font-medium text-slate-900 transition hover:opacity-90"
          >
            重新开始
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">PhrasePump 听力练习</h2>
          <p className="mt-1 text-sm text-muted">
            进度: {currentIndex + 1} / {exercises.length}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted">得分</p>
          <p className="text-xl font-semibold">
            {score.correct} / {score.total}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full bg-brand transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
        />
      </div>

      {/* Exercise Card */}
      <div className="panel p-8">
        <div className="mb-6 text-center">
          <button
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand transition hover:opacity-90 disabled:opacity-50"
          >
            {isPlaying ? (
              <Pause size={28} className="text-white" />
            ) : (
              <Play size={28} className="text-white" fill="white" />
            )}
          </button>
          <p className="mt-4 text-sm text-muted">点击播放音频</p>
        </div>

        <div className="mb-6 rounded-2xl bg-white/5 p-6">
          <p className="text-center text-lg leading-relaxed text-slate-200">
            {currentExercise.blankedSentence}
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !currentExercise.isCorrect && handleSubmit()}
            placeholder="输入你听到的单词..."
            disabled={currentExercise.isCorrect !== null}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-lg outline-none transition focus:border-brand/50 disabled:opacity-50"
          />

          {currentExercise.isCorrect === null ? (
            <button
              onClick={handleSubmit}
              disabled={!userInput.trim()}
              className="w-full rounded-full bg-white px-6 py-3 font-medium text-slate-900 transition hover:opacity-90 disabled:opacity-50"
            >
              提交答案
            </button>
          ) : (
            <>
              <div className={`rounded-2xl p-4 ${currentExercise.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <div className="flex items-center gap-3">
                  {currentExercise.isCorrect ? (
                    <CheckCircle className="text-green-400" size={24} />
                  ) : (
                    <XCircle className="text-red-400" size={24} />
                  )}
                  <div className="flex-1">
                    <p className={`font-semibold ${currentExercise.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {currentExercise.isCorrect ? '正确！' : '不正确'}
                    </p>
                    {!currentExercise.isCorrect && (
                      <p className="mt-1 text-sm text-slate-300">
                        正确答案: <span className="font-semibold">{currentExercise.targetWord.word}</span>
                      </p>
                    )}
                    <p className="mt-1 text-sm text-muted">
                      翻译: {currentExercise.targetWord.translation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pronunciation Practice */}
              {showPronunciation ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold">发音练习</h4>
                    <button
                      onClick={() => setShowPronunciation(false)}
                      className="text-sm text-muted hover:text-white"
                    >
                      关闭
                    </button>
                  </div>
                  <PronunciationPractice
                    text={currentExercise.sentence}
                    language="en-US"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowPronunciation(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-6 py-3 font-medium text-brand transition hover:bg-brand/20"
                >
                  <Mic size={20} />
                  练习发音
                </button>
              )}

              <button
                onClick={handleNext}
                className="w-full rounded-full bg-white px-6 py-3 font-medium text-slate-900 transition hover:opacity-90"
              >
                下一题
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hint */}
      <div className="text-center text-sm text-muted">
        <p>💡 提示: 可以多次播放音频来仔细听</p>
      </div>
    </div>
  );
}
