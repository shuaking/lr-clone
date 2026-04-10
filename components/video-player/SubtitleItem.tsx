import React from 'react';
import { Subtitle, SubtitleMode } from '@/hooks/useSubtitles';
import { usePlayerSettingsStore } from '@/lib/stores/player-settings-store';
import { Check, X } from 'lucide-react';

export interface SubtitleItemProps {
  subtitle: Subtitle;
  isCurrent: boolean;
  isSelected: boolean;
  subtitleMode: SubtitleMode;
  onClick: () => void;
  onWordClick: (word: string, event: React.MouseEvent) => void;
}

type Token = {
  type: 'word' | 'punctuation' | 'space';
  value: string;
};

// 分词函数：将文本分割为单词和标点符号
function tokenizeText(text: string): Token[] {
  const tokens: Token[] = [];
  // 匹配单词（字母、数字、连字符、撇号）或标点符号
  const regex = /([a-zA-Z0-9'-]+)|([.,!?;:"""''()[\]{}—…])|(\s+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      tokens.push({ type: 'word', value: match[1] });
    } else if (match[2]) {
      tokens.push({ type: 'punctuation', value: match[2] });
    } else if (match[3]) {
      tokens.push({ type: 'space', value: match[3] });
    }
  }

  return tokens;
}

export const SubtitleItem = React.memo(function SubtitleItem({
  subtitle,
  isCurrent,
  isSelected,
  subtitleMode,
  onClick,
  onWordClick
}: SubtitleItemProps) {
  const fontSize = usePlayerSettingsStore((state) => state.fontSize);
  const isSentenceKnown = usePlayerSettingsStore((state) => state.isSentenceKnown(subtitle.id));
  const markSentenceAsKnown = usePlayerSettingsStore((state) => state.markSentenceAsKnown);
  const unmarkSentenceAsKnown = usePlayerSettingsStore((state) => state.unmarkSentenceAsKnown);

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border p-4 transition relative group ${
        isSentenceKnown
          ? 'border-white/5 bg-white/[0.02] opacity-50'
          : isCurrent
          ? 'border-brand bg-brand/20 shadow-lg shadow-brand/20'
          : isSelected
          ? 'border-brand/50 bg-brand/10'
          : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/[0.07]'
      }`}
    >
      {/* 已知/未知标记按钮 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isSentenceKnown) {
            unmarkSentenceAsKnown(subtitle.id);
          } else {
            markSentenceAsKnown(subtitle.id);
          }
        }}
        className={`absolute top-2 right-2 p-1.5 rounded-lg transition opacity-0 group-hover:opacity-100 ${
          isSentenceKnown
            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
            : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
        }`}
        aria-label={isSentenceKnown ? '标记为未知' : '标记为已知'}
      >
        {isSentenceKnown ? <X size={14} /> : <Check size={14} />}
      </button>
      {/* 原文 */}
      {(subtitleMode === 'both' || subtitleMode === 'original') && (
        <p
          className={`leading-relaxed ${
            isCurrent ? 'text-white font-medium' : 'text-white'
          }`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {tokenizeText(subtitle.text).map((token, idx) => {
            if (token.type === 'word') {
              return (
                <span
                  key={idx}
                  className="cursor-pointer transition hover:text-brand hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onWordClick(token.value, e);
                  }}
                >
                  {token.value}
                </span>
              );
            } else {
              return <span key={idx}>{token.value}</span>;
            }
          })}
        </p>
      )}

      {/* 译文 */}
      {(subtitleMode === 'both' || subtitleMode === 'translation') && subtitle.translation && (
        <p className={`text-sm text-muted leading-relaxed ${
          subtitleMode === 'both' ? 'mt-2' : ''
        }`}>
          {subtitle.translation}
        </p>
      )}
    </div>
  );
});
