"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getGrammarInfo,
  analyzeSentenceGrammar,
  detectGrammarErrors,
  getPOSName,
  type GrammarInfo,
  type PartOfSpeech
} from "@/lib/grammar-analyzer";
import {
  BookOpen,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Tag,
  MessageSquare
} from "lucide-react";

interface GrammarPanelProps {
  word: string;
  context?: string;
  language?: string;
}

export function GrammarPanel({ word, context, language = 'zh' }: GrammarPanelProps) {
  const [grammarInfo, setGrammarInfo] = useState<GrammarInfo | null>(null);
  const [sentenceAnalysis, setSentenceAnalysis] = useState<any[]>([]);
  const [grammarErrors, setGrammarErrors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGrammarInfo();
  }, [word, context]);

  const loadGrammarInfo = async () => {
    setIsLoading(true);
    try {
      const info = await getGrammarInfo(word, context, language);
      setGrammarInfo(info);

      if (context) {
        const analysis = analyzeSentenceGrammar(context);
        setSentenceAnalysis(analysis);

        const errors = detectGrammarErrors(context);
        setGrammarErrors(errors);
      }
    } catch (error) {
      console.error('Failed to load grammar info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPOSColor = (pos: PartOfSpeech): string => {
    const colors: Record<PartOfSpeech, string> = {
      noun: 'bg-blue-500/20 text-blue-400',
      verb: 'bg-green-500/20 text-green-400',
      adjective: 'bg-purple-500/20 text-purple-400',
      adverb: 'bg-yellow-500/20 text-yellow-400',
      pronoun: 'bg-pink-500/20 text-pink-400',
      preposition: 'bg-orange-500/20 text-orange-400',
      conjunction: 'bg-cyan-500/20 text-cyan-400',
      interjection: 'bg-red-500/20 text-red-400',
      article: 'bg-indigo-500/20 text-indigo-400',
      unknown: 'bg-gray-500/20 text-gray-400'
    };
    return colors[pos] || colors.unknown;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!grammarInfo) {
    return (
      <div className="py-8 text-center text-muted">
        <BookOpen className="mx-auto mb-2 h-8 w-8" />
        <p>无法加载语法信息</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 词性标注 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-[rgb(var(--border-color))] bg-white/5 p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <Tag className="h-4 w-4 text-brand" />
          <h3 className="font-semibold">词性</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-lg px-3 py-1 text-sm font-medium ${getPOSColor(grammarInfo.partOfSpeech)}`}>
            {getPOSName(grammarInfo.partOfSpeech)}
          </span>
          <p className="text-sm text-muted">{grammarInfo.explanation}</p>
        </div>
      </motion.div>

      {/* 示例句子 */}
      {grammarInfo.examples.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-[rgb(var(--border-color))] bg-white/5 p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-brand" />
            <h3 className="font-semibold">例句</h3>
          </div>
          <div className="space-y-2">
            {grammarInfo.examples.map((example, index) => (
              <div key={index} className="rounded-lg bg-white/5 p-3 text-sm">
                {example}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 常见搭配 */}
      {grammarInfo.collocations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-[rgb(var(--border-color))] bg-white/5 p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-brand" />
            <h3 className="font-semibold">常见搭配</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {grammarInfo.collocations.map((collocation, index) => (
              <span
                key={index}
                className="rounded-lg bg-brand/10 px-3 py-1 text-sm text-brand"
              >
                {collocation}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* 常见错误 */}
      {grammarInfo.commonMistakes && grammarInfo.commonMistakes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <h3 className="font-semibold text-red-400">常见错误</h3>
          </div>
          <div className="space-y-2">
            {grammarInfo.commonMistakes.map((mistake, index) => (
              <div key={index} className="text-sm text-red-300">
                {mistake}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 句子分析 */}
      {sentenceAnalysis.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-[rgb(var(--border-color))] bg-white/5 p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-brand" />
            <h3 className="font-semibold">句子分析</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {sentenceAnalysis.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-sm">{item.word}</span>
                <span className={`rounded px-2 py-0.5 text-xs ${getPOSColor(item.pos)}`}>
                  {item.posName}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 语法错误检测 */}
      {grammarErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <h3 className="font-semibold text-yellow-400">可能的语法问题</h3>
          </div>
          <div className="space-y-2">
            {grammarErrors.map((error, index) => (
              <div key={index} className="text-sm">
                <span className="text-yellow-300">⚠️ {error.error}</span>
                <br />
                <span className="text-yellow-200">{error.suggestion}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 无错误提示 */}
      {context && grammarErrors.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-green-500/20 bg-green-500/10 p-4"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400">未检测到明显的语法错误</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
