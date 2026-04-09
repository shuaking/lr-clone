/**
 * Anki 导出功能
 *
 * 生成 CSV 格式的文件，可以直接导入到 Anki
 * 格式: 单词, 翻译, 上下文, 视频ID, 时间戳
 */

import type { VocabularyItem } from '@/lib/stores/vocabulary-store';

/**
 * 转义 CSV 字段
 */
function escapeCSV(text: string): string {
  // 如果包含逗号、引号或换行符，需要用引号包裹
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    // 引号需要转义为两个引号
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * 生成 CSV 内容
 */
export function generateAnkiCSV(vocabulary: VocabularyItem[]): string {
  // CSV 头部
  const headers = ['单词', '翻译', '上下文', '笔记', '视频ID', '时间戳'];
  const rows = [headers.join(',')];

  // 添加每个单词
  vocabulary.forEach((item) => {
    const row = [
      escapeCSV(item.word),
      escapeCSV(item.translation),
      escapeCSV(item.context),
      escapeCSV(item.notes || ''),
      escapeCSV(item.videoId),
      item.timestamp.toString(),
    ];
    rows.push(row.join(','));
  });

  return rows.join('\n');
}

/**
 * 下载 CSV 文件
 */
export function downloadAnkiCSV(vocabulary: VocabularyItem[], filename: string = 'vocabulary.csv') {
  const csv = generateAnkiCSV(vocabulary);
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * 生成 Anki 卡片格式的 HTML
 * 用于高级导出（包含样式）
 */
export function generateAnkiHTML(item: VocabularyItem): {
  front: string;
  back: string;
} {
  const front = `
    <div class="card">
      <div class="word">${item.word}</div>
      <div class="context">${item.context}</div>
    </div>
  `;

  const back = `
    <div class="card">
      <div class="word">${item.word}</div>
      <div class="translation">${item.translation}</div>
      <div class="context">${item.context}</div>
      ${item.notes ? `<div class="notes">${item.notes}</div>` : ''}
      <div class="meta">
        <span>视频: ${item.videoId}</span>
        <span>时间: ${Math.floor(item.timestamp / 60)}:${(item.timestamp % 60).toString().padStart(2, '0')}</span>
      </div>
    </div>
  `;

  return { front, back };
}

/**
 * 生成 Anki 导入说明
 */
export function getAnkiImportInstructions(): string {
  return `
# Anki 导入说明

## 方法 1: CSV 导入（推荐）

1. 打开 Anki
2. 点击 "文件" → "导入"
3. 选择下载的 CSV 文件
4. 设置字段映射：
   - 字段 1 → 正面（单词）
   - 字段 2 → 背面（翻译）
   - 字段 3 → 额外字段（上下文）
   - 字段 4 → 额外字段（笔记）
   - 字段 5 → 标签（视频ID）
   - 字段 6 → 额外字段（时间戳）
5. 选择或创建牌组
6. 点击 "导入"

## 方法 2: 手动创建卡片

如果导入失败，可以手动创建：
1. 在 Anki 中创建新牌组
2. 添加笔记类型：基础（正面和背面）
3. 逐个复制粘贴单词和翻译

## 提示

- 建议创建专门的牌组，如 "Language Reactor - 英语词汇"
- 可以在 Anki 中进一步编辑卡片样式
- 支持添加音频和图片（需手动添加）
  `.trim();
}

/**
 * 批量导出选中的单词
 */
export function exportSelectedWords(
  vocabulary: VocabularyItem[],
  selectedIds: Set<string>
): void {
  const selected = vocabulary.filter((item) => selectedIds.has(item.id));

  if (selected.length === 0) {
    throw new Error('请至少选择一个单词');
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `vocabulary_${timestamp}_${selected.length}words.csv`;

  downloadAnkiCSV(selected, filename);
}

/**
 * 导出全部单词
 */
export function exportAllWords(vocabulary: VocabularyItem[]): void {
  if (vocabulary.length === 0) {
    throw new Error('没有可导出的单词');
  }

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `vocabulary_${timestamp}_all.csv`;

  downloadAnkiCSV(vocabulary, filename);
}

/**
 * 按日期范围导出
 */
export function exportByDateRange(
  vocabulary: VocabularyItem[],
  startDate: Date,
  endDate: Date
): void {
  const filtered = vocabulary.filter((item) => {
    const savedDate = new Date(item.savedAt);
    return savedDate >= startDate && savedDate <= endDate;
  });

  if (filtered.length === 0) {
    throw new Error('该日期范围内没有单词');
  }

  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  const filename = `vocabulary_${start}_to_${end}.csv`;

  downloadAnkiCSV(filtered, filename);
}
