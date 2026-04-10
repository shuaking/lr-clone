"use client";

import { useState } from "react";
import { useLanguagePairStore } from "@/lib/stores/language-pair-store";
import { LANGUAGE_PAIRS } from "@/lib/language-pairs";
import { Languages, Check } from "lucide-react";

export function LanguagePairSelector() {
  const { currentPairId, setLanguagePair } = useLanguagePairStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentPair = LANGUAGE_PAIRS.find(p => p.id === currentPairId);

  // 按源语言分组
  const groupedPairs = LANGUAGE_PAIRS.reduce((acc, pair) => {
    if (!acc[pair.sourceCode]) {
      acc[pair.sourceCode] = [];
    }
    acc[pair.sourceCode].push(pair);
    return acc;
  }, {} as Record<string, typeof LANGUAGE_PAIRS>);

  const handleSelect = (pairId: string) => {
    setLanguagePair(pairId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-panel border border-line rounded-lg hover:bg-white/5 transition"
        aria-label="选择学习语言对"
      >
        <Languages className="w-4 h-4 text-muted" />
        <span className="text-sm text-ink">{currentPair?.flag}</span>
        <span className="text-xs text-muted hidden sm:inline">
          {currentPair?.sourceName} → {currentPair?.targetName}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-panel border border-line rounded-xl shadow-2xl z-50">
            <div className="p-3 border-b border-line">
              <h3 className="text-sm font-semibold text-ink">选择学习语言对</h3>
              <p className="text-xs text-muted mt-1">
                选择你要学习的语言和翻译目标语言
              </p>
            </div>

            <div className="p-2">
              {Object.entries(groupedPairs).map(([sourceCode, pairs]) => (
                <div key={sourceCode} className="mb-3 last:mb-0">
                  <div className="px-2 py-1 text-xs font-medium text-muted">
                    学习 {pairs[0].sourceName}
                  </div>
                  <div className="space-y-1">
                    {pairs.map((pair) => (
                      <button
                        key={pair.id}
                        onClick={() => handleSelect(pair.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
                          currentPairId === pair.id
                            ? 'bg-brand/10 text-brand'
                            : 'hover:bg-white/5 text-ink'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{pair.flag}</span>
                          <div className="text-left">
                            <div className="text-sm font-medium">
                              {pair.sourceName} → {pair.targetName}
                            </div>
                          </div>
                        </div>
                        {currentPairId === pair.id && (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
