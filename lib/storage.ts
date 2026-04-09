/**
 * 本地存储管理（localStorage）
 * 用于未登录用户的词汇保存
 */

export interface SavedWord {
  id: string;
  word: string;
  translation: string;
  context?: string;
  source?: string;
  createdAt: string;
}

const STORAGE_KEY = 'lr-saved-words';

/**
 * 获取所有已保存的单词
 */
export function getSavedWords(): SavedWord[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load saved words:', error);
    return [];
  }
}

/**
 * 保存单词
 */
export function saveWord(word: Omit<SavedWord, 'id' | 'createdAt'>): SavedWord {
  const savedWords = getSavedWords();

  // 检查是否已存在
  const existing = savedWords.find(w => w.word.toLowerCase() === word.word.toLowerCase());
  if (existing) {
    return existing;
  }

  const newWord: SavedWord = {
    ...word,
    id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };

  savedWords.push(newWord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedWords));

  return newWord;
}

/**
 * 删除单词
 */
export function deleteWord(id: string): void {
  const savedWords = getSavedWords();
  const filtered = savedWords.filter(w => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * 检查单词是否已保存
 */
export function isWordSaved(word: string): boolean {
  const savedWords = getSavedWords();
  return savedWords.some(w => w.word.toLowerCase() === word.toLowerCase());
}

/**
 * 导出为 Anki CSV 格式
 */
export function exportToAnkiCSV(): string {
  const savedWords = getSavedWords();

  // CSV 格式: 单词,翻译,语境,来源
  const header = 'Word,Translation,Context,Source\n';
  const rows = savedWords.map(w =>
    `"${w.word}","${w.translation}","${w.context || ''}","${w.source || ''}"`
  ).join('\n');

  return header + rows;
}

/**
 * 下载 CSV 文件
 */
export function downloadAnkiCSV(): void {
  const csv = exportToAnkiCSV();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `language-reactor-words-${Date.now()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
