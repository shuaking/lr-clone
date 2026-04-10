"use client";

import { useState, useEffect } from "react";
import { InteractiveText } from "./interactive-text";
import { splitIntoSentences, Sentence } from "@/lib/text-processor";
import { translateSentence } from "@/lib/dictionary-api";
import { recordActivity } from "@/lib/learning-stats";
import { Upload, FileText } from "lucide-react";

export function TextReader() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [translations, setTranslations] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const [showInput, setShowInput] = useState(true);

  const handleImportText = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    const parsed = splitIntoSentences(inputText);
    setSentences(parsed);

    // 翻译所有句子
    const translationMap = new Map<string, string>();
    for (const sentence of parsed) {
      try {
        const translation = await translateSentence(sentence.text);
        translationMap.set(sentence.id, translation);
      } catch (error) {
        console.error("Translation error:", error);
        translationMap.set(sentence.id, "翻译失败");
      }
    }

    setTranslations(translationMap);
    setLoading(false);
    setShowInput(false);

    // 记录阅读活动
    recordActivity('text', 5).catch(console.error); // 异步记录,不阻塞UI
  };

  const handleReset = () => {
    setSentences([]);
    setTranslations(new Map());
    setInputText("");
    setShowInput(true);
  };

  if (showInput) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-3xl space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/20">
              <FileText className="text-brand" size={32} />
            </div>
            <h2 className="text-2xl font-semibold">导入文本开始学习</h2>
            <p className="mt-2 text-muted">粘贴任何英文文章、书籍段落或字幕文本</p>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="粘贴英文文本..."
            className="h-64 w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed outline-none transition focus:border-brand/50"
          />

          <button
            onClick={handleImportText}
            disabled={!inputText.trim() || loading}
            className="w-full rounded-full bg-white px-6 py-3 font-medium text-slate-900 transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "处理中..." : "开始阅读"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-semibold">阅读模式</h2>
          <p className="mt-1 text-sm text-muted">点击任意单词查看翻译和释义</p>
        </div>
        <button
          onClick={handleReset}
          className="rounded-full border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
        >
          导入新文本
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 原文 */}
        <div className="rounded-[1.25rem] border border-white/5 bg-white/5 p-4">
          <p className="mb-4 text-sm text-muted">原文</p>
          <div className="space-y-3">
            {sentences.map((sentence) => (
              <div
                key={sentence.id}
                className="rounded-2xl border border-white/5 bg-[#11182b] px-4 py-3"
              >
                {sentence.timestamp && (
                  <span className="text-xs text-brand">{sentence.timestamp}</span>
                )}
                <InteractiveText
                  text={sentence.text}
                  source="Reader"
                  className="mt-2 text-[15px] leading-7 text-slate-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 翻译 */}
        <div className="rounded-[1.25rem] border border-white/5 bg-white/5 p-4">
          <p className="mb-4 text-sm text-muted">翻译</p>
          <div className="space-y-3">
            {sentences.map((sentence) => (
              <div
                key={sentence.id}
                className="rounded-2xl border border-white/5 bg-[#0d1322] px-4 py-3"
              >
                {sentence.timestamp && (
                  <span className="text-xs text-accent">{sentence.timestamp}</span>
                )}
                <p className="mt-2 text-[15px] leading-7 text-slate-300">
                  {translations.get(sentence.id) || "翻译中..."}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
