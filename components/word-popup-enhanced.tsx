/**
 * 增强版单词弹窗组件
 * 使用高级词典服务显示详细信息
 */

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useVocabularyStore } from "@/lib/stores/vocabulary-store";
import { recordActivity } from "@/lib/learning-stats";
import { getWordFrequency } from "@/lib/word-frequency";
import { speakWord, VoiceAccent } from "@/lib/speech-synthesis";
import { GrammarPanel } from "@/components/grammar-panel";
import { CulturalNotesPanel } from "@/components/cultural-notes-panel";
import { useWordLookup, useTranslate } from "@/hooks/useAdvancedDictionary";
import { BookmarkPlus, BookmarkCheck, Volume2, BookOpen, Globe, Play, ChevronDown, ChevronUp } from "lucide-react";

type TabType = 'dictionary' | 'grammar' | 'culture';

interface WordPopupProps {
  word: string;
  position: { x: number; y: number };
  onClose: () => void;
  context?: string;
  timestamp?: number;
  videoId?: string;
  language?: string;
}

export function WordPopupEnhanced({
  word,
  position,
  onClose,
  context,
  timestamp,
  videoId,
  language = 'en'
}: WordPopupProps) {
  const [saved, setSaved] = useState(false);
  const [savedItemId, setSavedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dictionary');
  const [translation, setTranslation] = useState<string>('');
  const [translating, setTranslating] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    definitions: true,
    examples: false,
    forms: false
  });

  const { saveWord, removeWord, isWordSaved } = useVocabularyStore();
  const { loading, error, result } = useWordLookup(word, language);
  const { translate } = useTranslate();
  const frequencyInfo = getWordFrequency(word);

  useEffect(() => {
    if (videoId) {
      setSaved(isWordSaved(word, videoId));
    }
  }, [word, videoId, isWordSaved]);

  // 获取翻译
  useEffect(() => {
    if (!result) return;

    const fetchTranslation = async () => {
      setTranslating(true);
      try {
        const translationResult = await translate(word, language, 'zh', context);
        setTranslation(translationResult.translatedText);
      } catch (err) {
        console.error('Translation error:', err);
        setTranslation('翻译失败');
      } finally {
        setTranslating(false);
      }
    };

    fetchTranslation();
  }, [word, language, context, result, translate]);

  const handleSave = async () => {
    if (!videoId || !context || timestamp === undefined) {
      toast.error('无法保存：缺少视频信息');
      return;
    }

    try {
      if (saved && savedItemId) {
        await removeWord(savedItemId);
        setSaved(false);
        setSavedItemId(null);
        toast.success('已取消保存');
      } else {
        const item = await saveWord({
          word,
          translation: translation || word,
          context,
          timestamp,
          videoId
        });
        setSaved(true);
        setSavedItemId(item.id);
        recordActivity('word', 1).catch(console.error);
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

  const handleSpeak = async () => {
    try {
      await speakWord(word, { accent: VoiceAccent.US, rate: 0.9 });
    } catch (error) {
      console.error('Speech error:', error);
      toast.error('发音失败');
    }
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(err => {
      console.error('Audio playback error:', err);
      toast.error('音频播放失败');
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="fixed z-50 w-[520px] max-h-[700px] overflow-y-auto rounded-2xl border border-white/10 bg-[#11182b] shadow-2xl"
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
        ) : error ? (
          <p className="py-4 text-center text-sm text-red-400">{error}</p>
        ) : result ? (
          <>
            {/* Header */}
            <div className="border-b border-white/10 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-white">{result.word}</h3>
                    <span
                      className="rounded-md px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${frequencyInfo.color}20`,
                        color: frequencyInfo.color,
                      }}
                      title={frequencyInfo.description}
                    >
                      {frequencyInfo.label}
                    </span>
                  </div>
                  {result.phonetic && (
                    <p className="mt-1 text-sm text-muted">{result.phonetic}</p>
                  )}
                  {result.sources && result.sources.length > 0 && (
                    <p className="mt-1 text-xs text-muted">
                      来源: {result.sources.join(', ')}
                    </p>
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

              {/* Tabs */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setActiveTab('dictionary')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                    activeTab === 'dictionary'
                      ? 'bg-brand/20 text-brand'
                      : 'text-muted hover:bg-white/5'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  词典
                </button>
                <button
                  onClick={() => setActiveTab('grammar')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                    activeTab === 'grammar'
                      ? 'bg-brand/20 text-brand'
                      : 'text-muted hover:bg-white/5'
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  语法
                </button>
                <button
                  onClick={() => setActiveTab('culture')}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                    activeTab === 'culture'
                      ? 'bg-brand/20 text-brand'
                      : 'text-muted hover:bg-white/5'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  文化
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              {activeTab === 'dictionary' && (
                <div className="space-y-4">
                  {/* 翻译 */}
                  <div>
                    <p className="text-sm font-medium text-muted">翻译</p>
                    {translating ? (
                      <div className="mt-1 flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                        <span className="text-sm text-muted">翻译中...</span>
                      </div>
                    ) : (
                      <p className="mt-1 text-base text-white">{translation}</p>
                    )}
                  </div>

                  {/* 发音音频 */}
                  {result.pronunciations && result.pronunciations.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted">发音</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.pronunciations.map((pron, i) => (
                          pron.audio && (
                            <button
                              key={i}
                              onClick={() => playAudio(pron.audio!)}
                              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm transition hover:bg-white/10"
                            >
                              <Play size={14} className="text-brand" />
                              {pron.dialect || '发音'}
                              {pron.text && <span className="text-muted">({pron.text})</span>}
                            </button>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 定义 */}
                  {result.definitions && result.definitions.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleSection('definitions')}
                        className="flex w-full items-center justify-between text-sm font-medium text-muted hover:text-white transition"
                      >
                        <span>释义 ({result.definitions.length})</span>
                        {expandedSections.definitions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedSections.definitions && (
                        <div className="mt-2 space-y-3">
                          {result.definitions.map((def, i) => (
                            <div key={i} className="rounded-lg bg-white/5 p-3">
                              <div className="flex items-start gap-2">
                                <span className="rounded bg-brand/20 px-2 py-0.5 text-xs font-medium text-brand">
                                  {def.partOfSpeech}
                                </span>
                                <p className="flex-1 text-sm text-white">{def.definition}</p>
                              </div>
                              {def.example && (
                                <p className="mt-2 text-xs italic text-slate-400">例: {def.example}</p>
                              )}
                              {def.synonyms && def.synonyms.length > 0 && (
                                <p className="mt-2 text-xs text-muted">
                                  同义词: {def.synonyms.join(', ')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 例句 */}
                  {result.examples && result.examples.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleSection('examples')}
                        className="flex w-full items-center justify-between text-sm font-medium text-muted hover:text-white transition"
                      >
                        <span>例句 ({result.examples.length})</span>
                        {expandedSections.examples ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedSections.examples && (
                        <div className="mt-2 space-y-2">
                          {result.examples.map((ex, i) => (
                            <div key={i} className="rounded-lg bg-white/5 p-3">
                              <p className="text-sm text-white">{ex.sentence}</p>
                              {ex.translation && (
                                <p className="mt-1 text-xs text-slate-400">{ex.translation}</p>
                              )}
                              {ex.source && (
                                <p className="mt-1 text-xs text-muted">— {ex.source}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 词形变化 */}
                  {result.lemma && (
                    <div>
                      <button
                        onClick={() => toggleSection('forms')}
                        className="flex w-full items-center justify-between text-sm font-medium text-muted hover:text-white transition"
                      >
                        <span>词形变化</span>
                        {expandedSections.forms ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {expandedSections.forms && (
                        <div className="mt-2 rounded-lg bg-white/5 p-3">
                          <p className="text-sm text-muted">原形: <span className="text-white">{result.lemma.lemma}</span></p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {result.lemma.forms.map((form, i) => (
                              <span key={i} className="rounded bg-white/10 px-2 py-1 text-xs text-slate-300">
                                {form}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 语境 */}
                  {context && (
                    <div>
                      <p className="text-sm font-medium text-muted">语境</p>
                      <p className="mt-1 text-sm italic text-slate-400">{context}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'grammar' && (
                <GrammarPanel word={word} context={context} language="zh" />
              )}

              {activeTab === 'culture' && (
                <CulturalNotesPanel word={word} context={context} language="zh" />
              )}
            </div>
          </>
        ) : (
          <p className="py-4 text-center text-sm text-muted">未找到词典数据</p>
        )}
      </div>
    </>
  );
}
