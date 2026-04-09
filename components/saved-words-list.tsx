"use client";

import { useState, useEffect } from "react";
import { getSavedWords, deleteWord, downloadAnkiCSV, SavedWord } from "@/lib/storage";
import { Trash2, Download, BookOpen } from "lucide-react";

export function SavedWordsList() {
  const [words, setWords] = useState<SavedWord[]>([]);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = () => {
    setWords(getSavedWords());
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个单词吗？")) {
      deleteWord(id);
      loadWords();
    }
  };

  const handleExport = () => {
    downloadAnkiCSV();
  };

  const filteredWords = filter
    ? words.filter(w =>
        w.word.toLowerCase().includes(filter.toLowerCase()) ||
        w.translation.toLowerCase().includes(filter.toLowerCase())
      )
    : words;

  if (words.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/20">
            <BookOpen className="text-brand" size={32} />
          </div>
          <h2 className="text-xl font-semibold">还没有保存的单词</h2>
          <p className="mt-2 text-muted">在阅读器中点击单词即可保存</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-semibold">已保存的单词</h2>
          <p className="mt-1 text-sm text-muted">共 {words.length} 个单词</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="搜索单词..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none transition focus:border-brand/50"
          />
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            <Download size={16} />
            导出 Anki
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredWords.map((word) => (
          <div
            key={word.id}
            className="rounded-2xl border border-white/5 bg-white/5 p-4 transition hover:border-white/10 hover:bg-white/[0.07]"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{word.word}</h3>
                <p className="mt-1 text-sm text-slate-300">{word.translation}</p>
              </div>
              <button
                onClick={() => handleDelete(word.id)}
                className="rounded-xl bg-white/5 p-2 transition hover:bg-red-500/20"
                title="删除"
              >
                <Trash2 size={14} className="text-red-400" />
              </button>
            </div>

            {word.context && (
              <p className="mb-2 text-xs italic text-slate-400 line-clamp-2">
                "{word.context}"
              </p>
            )}

            <div className="flex items-center justify-between text-xs text-muted">
              <span>{word.source || "Reader"}</span>
              <span>{new Date(word.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
