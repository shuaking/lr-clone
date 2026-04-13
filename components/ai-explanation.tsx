"use client";

import { useState } from 'react';
import { explainSentence, AIExplanation, getAIStatus } from '@/lib/ai-assistant';
import { Sparkles, Loader2, BookOpen, MessageSquare, Info } from 'lucide-react';

interface AIExplanationProps {
  sentence: string;
  onClose: () => void;
}

export function AIExplanationPanel({ sentence, onClose }: AIExplanationProps) {
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aiStatus = getAIStatus();

  const handleExplain = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await explainSentence(sentence);
      setExplanation(result);
    } catch (err) {
      setError('解释失败，请重试');
      console.error('AI explanation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-brand" />
            <h2 className="text-lg font-semibold">AI 句子解释</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {/* Status Banner */}
          {aiStatus.provider === 'mock' && (
            <div className="mb-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-yellow-500 mt-0.5" />
                <p className="text-sm text-yellow-200">{aiStatus.message}</p>
              </div>
            </div>
          )}

          {/* Original Sentence */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted mb-2">原句</h3>
            <p className="text-lg leading-relaxed">{sentence}</p>
          </div>

          {/* Explain Button */}
          {!explanation && !isLoading && (
            <button
              onClick={handleExplain}
              disabled={isLoading}
              className="w-full rounded-lg bg-brand px-4 py-3 font-medium transition hover:opacity-90 disabled:opacity-50"
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles size={18} />
                获取 AI 解释
              </div>
            </button>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin text-brand" />
                <p className="text-sm text-muted">AI 正在分析...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Explanation Result */}
          {explanation && (
            <div className="space-y-6">
              {/* Translation */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                  <MessageSquare size={16} />
                  翻译
                </h3>
                <p className="text-base leading-relaxed">{explanation.translation}</p>
              </div>

              {/* Grammar */}
              {explanation.grammar.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-medium text-muted mb-2">
                    <BookOpen size={16} />
                    语法要点
                  </h3>
                  <ul className="space-y-2">
                    {explanation.grammar.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-brand mt-1">•</span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Vocabulary */}
              {explanation.vocabulary.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted mb-3">关键词汇</h3>
                  <div className="space-y-3">
                    {explanation.vocabulary.map((vocab, index) => (
                      <div key={index} className="rounded-lg bg-white/5 p-3">
                        <div className="font-medium text-brand mb-1">{vocab.word}</div>
                        <div className="text-sm text-muted mb-1">{vocab.meaning}</div>
                        <div className="text-xs text-muted/70">{vocab.usage}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Notes */}
              {explanation.culturalNotes && (
                <div>
                  <h3 className="text-sm font-medium text-muted mb-2">文化注释</h3>
                  <p className="text-sm leading-relaxed text-muted/90">
                    {explanation.culturalNotes}
                  </p>
                </div>
              )}

              {/* Retry Button */}
              <button
                onClick={handleExplain}
                className="w-full rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
              >
                重新解释
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
