"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DictionaryResult } from "@/lib/dictionary-api";
import { saveVocabulary, isWordSaved, removeVocabulary } from "@/lib/vocabulary-storage";
import { recordActivity } from "@/lib/learning-stats";
import { BookmarkPlus, BookmarkCheck, Volume2 } from "lucide-react";

interface WordPopupProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  context?: string;
  timestamp?: number;
  videoId?: string;
}

export function WordPopup({ word, position, onClose, context, timestamp, videoId }: WordPopupProps) {
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [savedItemId, setSavedItemId] = useState<string | null>(null);

  useEffect(() => {
    if (videoId) {
      setSaved(isWordSaved(word, videoId));
    }

    async function fetchTranslation() {
      setLoading(true);
      try {
        const { translateWord } = await import("@/lib/dictionary-api");
        const data = await translateWord(word);
        setResult(data);
      } catch (error) {
        console.error("Translation error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTranslation();
  }, [word, videoId]);

  const handleSave = () => {
    if (!videoId || !context || timestamp === undefined) {
      toast.error('无法保存：缺少视频信息');
      return;
    }

    try {
      if (saved && savedItemId) {
        removeVocabulary(savedItemId);
        setSaved(false);
        setSavedItemId(null);
        toast.success('已取消保存');
      } else {
        const item = saveVocabulary({
          word,
          translation: result?.translation || word,
          context,
          timestamp,
          videoId
        });
        setSaved(true);
        setSavedItemId(item.id);
        recordActivity('word', 1);
        toast.success('已保存到词汇表');
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'STORAGE_QUOTA_EXCEEDED') {
          toast.error('存储空间已满，请删除一些旧词汇');
        } else if (error.message === 'STORAGE_DISABLED') {
          toast.error('浏览器禁用了本地存储，请检查隐私设置');
        } else {
          toast.error('保存失败，请重试');
        }
      }
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-80 rounded-2xl border border-white/10 bg-[#11182b] p-5 shadow-2xl"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%) translateY(-10px)'
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : result ? (
          <>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{result.word}</h3>
                {result.phonetic && (
                  <p className="mt-1 text-sm text-muted">{result.phonetic}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSpeak}
                  className="rounded-xl bg-white/5 p-2 transition hover:bg-white/10"
                  title="发音"
                >
                  <Volume2 size={16} className="text-brand" />
                </button>
                <button
                  onClick={handleSave}
                  className="rounded-xl bg-white/5 p-2 transition hover:bg-white/10"
                  title={saved ? "已保存" : "保存单词"}
                >
                  {saved ? (
                    <BookmarkCheck size={16} className="text-accent" />
                  ) : (
                    <BookmarkPlus size={16} className="text-brand" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted">翻译</p>
                <p className="mt-1 text-base text-white">{result.translation}</p>
              </div>

              {result.definitions && result.definitions.length > 0 && (
                <div>
                  <p className="text-sm text-muted">释义</p>
                  <ul className="mt-1 space-y-1">
                    {result.definitions.map((def, i) => (
                      <li key={i} className="text-sm text-slate-300">• {def}</li>
                    ))}
                  </ul>
                </div>
              )}

              {context && (
                <div>
                  <p className="text-sm text-muted">语境</p>
                  <p className="mt-1 text-sm italic text-slate-400">{context}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="py-4 text-center text-sm text-muted">加载失败</p>
        )}
      </div>
    </>
  );
}
