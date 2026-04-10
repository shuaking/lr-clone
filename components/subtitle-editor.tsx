"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle,
  FileText,
  Clock,
  Edit3
} from "lucide-react";
import {
  parseSubtitleFile,
  exportToSRT,
  exportToVTT,
  exportToJSON,
  validateSubtitles,
  mergeShortSubtitles,
  adjustSubtitleTiming,
  type ParsedSubtitle
} from "@/lib/subtitle-parser";

interface SubtitleEditorProps {
  videoId?: string;
  initialSubtitles?: ParsedSubtitle[];
  onSave?: (subtitles: ParsedSubtitle[]) => void;
  onClose?: () => void;
}

export function SubtitleEditor({
  videoId,
  initialSubtitles = [],
  onSave,
  onClose
}: SubtitleEditorProps) {
  const [subtitles, setSubtitles] = useState<ParsedSubtitle[]>(initialSubtitles);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 上传字幕文件
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const parsed = parseSubtitleFile(content, file.name);

      if (parsed.length === 0) {
        showMessage('error', '无法解析字幕文件');
        return;
      }

      const validation = validateSubtitles(parsed);
      if (!validation.valid) {
        showMessage('error', `字幕验证失败: ${validation.errors[0]}`);
        return;
      }

      setSubtitles(parsed);
      showMessage('success', `成功加载 ${parsed.length} 条字幕`);
    } catch (error: any) {
      showMessage('error', error.message || '文件读取失败');
    }

    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 导出字幕
  const handleExport = (format: 'srt' | 'vtt' | 'json') => {
    try {
      let content: string;
      let filename: string;

      switch (format) {
        case 'srt':
          content = exportToSRT(subtitles);
          filename = `subtitles_${videoId || 'export'}.srt`;
          break;
        case 'vtt':
          content = exportToVTT(subtitles);
          filename = `subtitles_${videoId || 'export'}.vtt`;
          break;
        case 'json':
          content = exportToJSON(subtitles);
          filename = `subtitles_${videoId || 'export'}.json`;
          break;
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      showMessage('success', '字幕导出成功');
    } catch (error) {
      showMessage('error', '导出失败');
    }
  };

  // 添加新字幕
  const handleAdd = () => {
    const lastSub = subtitles[subtitles.length - 1];
    const newStart = lastSub ? lastSub.end + 1 : 0;

    const newSubtitle: ParsedSubtitle = {
      index: subtitles.length + 1,
      start: newStart,
      end: newStart + 3,
      text: '新字幕'
    };

    setSubtitles([...subtitles, newSubtitle]);
    setEditingIndex(subtitles.length);
  };

  // 删除字幕
  const handleDelete = (index: number) => {
    const updated = subtitles.filter((_, i) => i !== index);
    // 重新编号
    const renumbered = updated.map((sub, i) => ({ ...sub, index: i + 1 }));
    setSubtitles(renumbered);
    showMessage('success', '字幕已删除');
  };

  // 更新字幕
  const handleUpdate = (index: number, field: keyof ParsedSubtitle, value: any) => {
    const updated = [...subtitles];
    updated[index] = { ...updated[index], [field]: value };
    setSubtitles(updated);
  };

  // 合并短字幕
  const handleMerge = () => {
    const merged = mergeShortSubtitles(subtitles);
    setSubtitles(merged);
    showMessage('success', `合并后剩余 ${merged.length} 条字幕`);
  };

  // 调整时间偏移
  const handleAdjustTiming = () => {
    if (timeOffset === 0) return;
    const adjusted = adjustSubtitleTiming(subtitles, timeOffset);
    setSubtitles(adjusted);
    showMessage('success', `时间已调整 ${timeOffset > 0 ? '+' : ''}${timeOffset} 秒`);
    setTimeOffset(0);
  };

  // 保存
  const handleSave = () => {
    const validation = validateSubtitles(subtitles);
    if (!validation.valid) {
      showMessage('error', `验证失败: ${validation.errors[0]}`);
      return;
    }

    if (onSave) {
      onSave(subtitles);
      showMessage('success', '字幕已保存');
    }
  };

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-color))]"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-[rgb(var(--border-color))] p-6">
          <div>
            <h2 className="text-2xl font-semibold">字幕编辑器</h2>
            <p className="mt-1 text-sm text-muted">
              {subtitles.length} 条字幕
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-muted hover:bg-white/5 transition"
          >
            关闭
          </button>
        </div>

        {/* 消息提示 */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mx-6 mt-4 rounded-xl p-4 ${
                message.type === 'success'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <p>{message.text}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 工具栏 */}
        <div className="border-b border-[rgb(var(--border-color))] p-6 space-y-4">
          <div className="flex flex-wrap gap-3">
            {/* 上传 */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".srt,.vtt,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm transition hover:bg-brand/90"
            >
              <Upload size={16} />
              上传字幕
            </button>

            {/* 导出 */}
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('srt')}
                disabled={subtitles.length === 0}
                className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10 disabled:opacity-50"
              >
                <Download size={16} />
                导出 SRT
              </button>
              <button
                onClick={() => handleExport('vtt')}
                disabled={subtitles.length === 0}
                className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10 disabled:opacity-50"
              >
                <Download size={16} />
                导出 VTT
              </button>
              <button
                onClick={() => handleExport('json')}
                disabled={subtitles.length === 0}
                className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10 disabled:opacity-50"
              >
                <Download size={16} />
                导出 JSON
              </button>
            </div>

            {/* 添加 */}
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
            >
              <Plus size={16} />
              添加字幕
            </button>

            {/* 合并 */}
            <button
              onClick={handleMerge}
              disabled={subtitles.length === 0}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10 disabled:opacity-50"
            >
              <FileText size={16} />
              合并短字幕
            </button>

            {/* 保存 */}
            {onSave && (
              <button
                onClick={handleSave}
                disabled={subtitles.length === 0}
                className="flex items-center gap-2 rounded-xl bg-green-500/20 px-4 py-2 text-sm text-green-400 transition hover:bg-green-500/30 disabled:opacity-50"
              >
                <Save size={16} />
                保存
              </button>
            )}
          </div>

          {/* 时间调整 */}
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-muted" />
            <span className="text-sm text-muted">时间偏移:</span>
            <input
              type="number"
              value={timeOffset}
              onChange={(e) => setTimeOffset(parseFloat(e.target.value) || 0)}
              step="0.1"
              className="w-24 rounded-xl border border-[rgb(var(--border-color))] bg-white/5 px-3 py-1 text-sm outline-none focus:border-brand"
            />
            <span className="text-sm text-muted">秒</span>
            <button
              onClick={handleAdjustTiming}
              disabled={timeOffset === 0 || subtitles.length === 0}
              className="rounded-xl bg-white/5 px-3 py-1 text-sm transition hover:bg-white/10 disabled:opacity-50"
            >
              应用
            </button>
          </div>
        </div>

        {/* 字幕列表 */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 300px)' }}>
          {subtitles.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-4 text-muted" />
                <p className="text-lg text-muted">还没有字幕</p>
                <p className="mt-2 text-sm text-muted">
                  上传字幕文件或点击"添加字幕"开始
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {subtitles.map((subtitle, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-[rgb(var(--border-color))] bg-white/5 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-brand">
                      #{subtitle.index}
                    </span>
                    <button
                      onClick={() => handleDelete(index)}
                      className="rounded-lg p-1 text-red-400 transition hover:bg-red-500/20"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    {/* 开始时间 */}
                    <div>
                      <label className="mb-1 block text-xs text-muted">开始时间</label>
                      <input
                        type="number"
                        value={subtitle.start}
                        onChange={(e) =>
                          handleUpdate(index, 'start', parseFloat(e.target.value) || 0)
                        }
                        step="0.1"
                        className="w-full rounded-xl border border-[rgb(var(--border-color))] bg-white/5 px-3 py-2 text-sm outline-none focus:border-brand"
                      />
                      <p className="mt-1 text-xs text-muted">{formatTime(subtitle.start)}</p>
                    </div>

                    {/* 结束时间 */}
                    <div>
                      <label className="mb-1 block text-xs text-muted">结束时间</label>
                      <input
                        type="number"
                        value={subtitle.end}
                        onChange={(e) =>
                          handleUpdate(index, 'end', parseFloat(e.target.value) || 0)
                        }
                        step="0.1"
                        className="w-full rounded-xl border border-[rgb(var(--border-color))] bg-white/5 px-3 py-2 text-sm outline-none focus:border-brand"
                      />
                      <p className="mt-1 text-xs text-muted">{formatTime(subtitle.end)}</p>
                    </div>

                    {/* 时长 */}
                    <div>
                      <label className="mb-1 block text-xs text-muted">时长</label>
                      <div className="flex h-10 items-center rounded-xl border border-[rgb(var(--border-color))] bg-white/5 px-3 text-sm text-muted">
                        {(subtitle.end - subtitle.start).toFixed(2)}s
                      </div>
                    </div>
                  </div>

                  {/* 文本 */}
                  <div className="mt-3">
                    <label className="mb-1 block text-xs text-muted">字幕文本</label>
                    <textarea
                      value={subtitle.text}
                      onChange={(e) => handleUpdate(index, 'text', e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-[rgb(var(--border-color))] bg-white/5 px-3 py-2 text-sm outline-none focus:border-brand resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
