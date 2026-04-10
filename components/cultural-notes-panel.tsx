"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getCulturalNote,
  detectCulturalTerms,
  getRelatedCulturalNotes,
  getTypeName,
  type CulturalNote
} from "@/lib/cultural-notes";
import {
  Globe,
  BookOpen,
  MessageSquare,
  MapPin,
  History,
  Lightbulb,
  Link as LinkIcon
} from "lucide-react";

interface CulturalNotesPanelProps {
  word: string;
  context?: string;
  language?: string;
}

export function CulturalNotesPanel({ word, context, language = 'zh' }: CulturalNotesPanelProps) {
  const [culturalNote, setCulturalNote] = useState<CulturalNote | null>(null);
  const [contextNotes, setContextNotes] = useState<CulturalNote[]>([]);
  const [relatedNotes, setRelatedNotes] = useState<CulturalNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCulturalNotes();
  }, [word, context]);

  const loadCulturalNotes = () => {
    setIsLoading(true);
    try {
      // 获取单词的文化注释
      const note = getCulturalNote(word);
      setCulturalNote(note);

      // 检测上下文中的文化词汇
      if (context) {
        const detected = detectCulturalTerms(context);
        setContextNotes(detected);
      }

      // 获取相关术语
      if (note) {
        const related = getRelatedCulturalNotes(word);
        setRelatedNotes(related);
      }
    } catch (error) {
      console.error('Failed to load cultural notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: CulturalNote['type']): string => {
    const colors: Record<CulturalNote['type'], string> = {
      idiom: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      slang: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      cultural: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      regional: 'bg-green-500/20 text-green-400 border-green-500/30',
      historical: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[type];
  };

  const getTypeIcon = (type: CulturalNote['type']) => {
    const icons: Record<CulturalNote['type'], React.ReactNode> = {
      idiom: <Lightbulb className="h-4 w-4" />,
      slang: <MessageSquare className="h-4 w-4" />,
      cultural: <Globe className="h-4 w-4" />,
      regional: <MapPin className="h-4 w-4" />,
      historical: <History className="h-4 w-4" />
    };
    return icons[type];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!culturalNote && contextNotes.length === 0) {
    return (
      <div className="py-8 text-center text-muted">
        <Globe className="mx-auto mb-2 h-8 w-8" />
        <p>暂无文化注释</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 主要文化注释 */}
      {culturalNote && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[rgb(var(--border-color))] bg-white/5 p-4"
        >
          {/* 类型标签 */}
          <div className="mb-3 flex items-center gap-2">
            <span className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-sm font-medium ${getTypeColor(culturalNote.type)}`}>
              {getTypeIcon(culturalNote.type)}
              {getTypeName(culturalNote.type, language)}
            </span>
            {culturalNote.regions && culturalNote.regions.length > 0 && (
              <div className="flex items-center gap-1">
                {culturalNote.regions.map(region => (
                  <span key={region} className="rounded bg-white/10 px-2 py-0.5 text-xs text-muted">
                    {region}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 解释 */}
          <div className="mb-3">
            <h3 className="mb-1 font-semibold">{culturalNote.word}</h3>
            <p className="text-sm text-muted">{culturalNote.explanation}</p>
          </div>

          {/* 起源 */}
          {culturalNote.origin && (
            <div className="mb-3 rounded-lg bg-white/5 p-3">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium">
                <History className="h-4 w-4 text-brand" />
                <span>起源</span>
              </div>
              <p className="text-sm text-muted">{culturalNote.origin}</p>
            </div>
          )}

          {/* 用法 */}
          <div className="mb-3">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-brand" />
              <span>用法</span>
            </div>
            <p className="text-sm text-muted">{culturalNote.usage}</p>
          </div>

          {/* 例句 */}
          {culturalNote.examples.length > 0 && (
            <div className="mb-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-brand" />
                <span>例句</span>
              </div>
              <div className="space-y-2">
                {culturalNote.examples.map((example, index) => (
                  <div key={index} className="rounded-lg bg-white/5 p-3 text-sm">
                    {example}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 替代词 */}
          {culturalNote.alternatives && culturalNote.alternatives.length > 0 && (
            <div className="mb-3">
              <div className="mb-2 text-sm font-medium">替代表达</div>
              <div className="flex flex-wrap gap-2">
                {culturalNote.alternatives.map((alt, index) => (
                  <span key={index} className="rounded-lg bg-brand/10 px-3 py-1 text-sm text-brand">
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 相关术语 */}
          {relatedNotes.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <LinkIcon className="h-4 w-4 text-brand" />
                <span>相关术语</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {relatedNotes.map((note, index) => (
                  <span
                    key={index}
                    className="cursor-pointer rounded-lg bg-white/10 px-3 py-1 text-sm transition hover:bg-white/20"
                    title={note.explanation}
                  >
                    {note.word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* 上下文中的文化词汇 */}
      {contextNotes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-[rgb(var(--border-color))] bg-white/5 p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand" />
            <h3 className="font-semibold">句子中的文化词汇</h3>
          </div>
          <div className="space-y-3">
            {contextNotes.map((note, index) => (
              <div key={index} className="rounded-lg border border-[rgb(var(--border-color))] bg-white/5 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-medium">{note.word}</span>
                  <span className={`rounded px-2 py-0.5 text-xs ${getTypeColor(note.type)}`}>
                    {getTypeName(note.type, language)}
                  </span>
                </div>
                <p className="text-sm text-muted">{note.explanation}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
