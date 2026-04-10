'use client';

import { Trash2, Video, Clock } from 'lucide-react';
import { getWordFrequency } from '@/lib/word-frequency';
import type { SavedVocabulary } from '@/lib/vocabulary-storage';

interface VocabularyItemProps {
  item: SavedVocabulary;
  onDelete: (id: string, word: string) => void;
  formatTimestamp: (seconds: number) => string;
  formatDate: (timestamp: number) => string;
}

export function VocabularyItem({
  item,
  onDelete,
  formatTimestamp,
  formatDate,
}: VocabularyItemProps) {
  const freq = getWordFrequency(item.word);

  return (
    <div
      className="rounded-2xl border border-white/5 bg-white/5 p-5 transition hover:border-white/10 hover:bg-white/[0.07]"
      role="listitem"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-white">{item.word}</h3>
            <span
              className="rounded-md px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${freq.color}20`,
                color: freq.color,
              }}
              title={freq.description}
            >
              {freq.label}
            </span>
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
              <Video size={14} aria-hidden="true" />
              <span>视频 ID: {item.videoId}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} aria-hidden="true" />
              <span>{formatTimestamp(item.timestamp)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => onDelete(item.id, item.word)}
          className="ml-4 rounded-lg bg-white/5 p-2 text-muted transition hover:bg-red-500/20 hover:text-red-400"
          aria-label={`删除单词 ${item.word}`}
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
