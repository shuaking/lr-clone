"use client";

import { useState, useRef } from "react";
import { WordPopup } from "./word-popup";
import { splitIntoWords } from "@/lib/text-processor";

interface InteractiveTextProps {
  text: string;
  source?: string;
  className?: string;
}

export function InteractiveText({ text, source, className = "" }: InteractiveTextProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const textRef = useRef<HTMLDivElement>(null);

  const handleWordClick = (word: string, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setSelectedWord(word);
  };

  const words = splitIntoWords(text);
  const wordSet = new Set(words);

  // 将文本分割成单词和非单词部分
  const parts: Array<{ type: 'word' | 'other'; content: string }> = [];
  let lastIndex = 0;

  const wordRegex = /[\u4e00-\u9fa5]+|[a-zA-Z]+('[a-zA-Z]+)?/g;
  let match;

  while ((match = wordRegex.exec(text)) !== null) {
    // 添加单词之前的内容
    if (match.index > lastIndex) {
      parts.push({
        type: 'other',
        content: text.slice(lastIndex, match.index)
      });
    }

    // 添加单词
    parts.push({
      type: 'word',
      content: match[0]
    });

    lastIndex = match.index + match[0].length;
  }

  // 添加剩余内容
  if (lastIndex < text.length) {
    parts.push({
      type: 'other',
      content: text.slice(lastIndex)
    });
  }

  return (
    <>
      <div ref={textRef} className={className}>
        {parts.map((part, index) => {
          if (part.type === 'word') {
            return (
              <span
                key={`word-${index}-${part.content}`}
                onClick={(e) => handleWordClick(part.content, e)}
                className="cursor-pointer transition hover:text-brand hover:underline"
              >
                {part.content}
              </span>
            );
          }
          return <span key={`other-${index}`}>{part.content}</span>;
        })}
      </div>

      {selectedWord && (
        <WordPopup
          word={selectedWord}
          position={popupPosition}
          onClose={() => setSelectedWord(null)}
          context={text}
        />
      )}
    </>
  );
}
