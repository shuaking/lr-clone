/**
 * 字幕文件解析器
 * 支持 SRT, VTT, JSON 格式
 */

export interface ParsedSubtitle {
  index: number;
  start: number;
  end: number;
  text: string;
}

/**
 * 解析 SRT 格式字幕
 */
export function parseSRT(content: string): ParsedSubtitle[] {
  const subtitles: ParsedSubtitle[] = [];
  const blocks = content.trim().split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    const index = parseInt(lines[0]);
    const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);

    if (!timeMatch) continue;

    const start = parseTime(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]);
    const end = parseTime(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]);
    const text = lines.slice(2).join('\n').trim();

    subtitles.push({ index, start, end, text });
  }

  return subtitles;
}

/**
 * 解析 VTT 格式字幕
 */
export function parseVTT(content: string): ParsedSubtitle[] {
  const subtitles: ParsedSubtitle[] = [];

  // 移除 WEBVTT 头部
  const cleanContent = content.replace(/^WEBVTT\s*\n\n?/, '');
  const blocks = cleanContent.trim().split(/\n\s*\n/);

  let index = 1;
  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;

    // VTT 可能有可选的 cue identifier
    let timeLineIndex = 0;
    if (!lines[0].includes('-->')) {
      timeLineIndex = 1;
    }

    const timeMatch = lines[timeLineIndex].match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);

    if (!timeMatch) continue;

    const start = parseTime(timeMatch[1], timeMatch[2], timeMatch[3], timeMatch[4]);
    const end = parseTime(timeMatch[5], timeMatch[6], timeMatch[7], timeMatch[8]);
    const text = lines.slice(timeLineIndex + 1).join('\n').trim();

    subtitles.push({ index: index++, start, end, text });
  }

  return subtitles;
}

/**
 * 解析 JSON 格式字幕
 */
export function parseJSON(content: string): ParsedSubtitle[] {
  try {
    const data = JSON.parse(content);

    if (Array.isArray(data)) {
      return data.map((item, index) => ({
        index: item.index || index + 1,
        start: item.start || item.startTime || 0,
        end: item.end || item.endTime || 0,
        text: item.text || item.content || ''
      }));
    }

    return [];
  } catch (error) {
    console.error('Failed to parse JSON subtitles:', error);
    return [];
  }
}

/**
 * 自动检测并解析字幕文件
 */
export function parseSubtitleFile(content: string, filename: string): ParsedSubtitle[] {
  const ext = filename.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'srt':
      return parseSRT(content);
    case 'vtt':
      return parseVTT(content);
    case 'json':
      return parseJSON(content);
    default:
      // 尝试自动检测
      if (content.startsWith('WEBVTT')) {
        return parseVTT(content);
      } else if (content.includes('-->') && content.match(/\d{2}:\d{2}:\d{2}/)) {
        return parseSRT(content);
      } else if (content.trim().startsWith('[') || content.trim().startsWith('{')) {
        return parseJSON(content);
      }
      throw new Error('无法识别的字幕格式');
  }
}

/**
 * 将字幕导出为 SRT 格式
 */
export function exportToSRT(subtitles: ParsedSubtitle[]): string {
  return subtitles
    .map(sub => {
      const start = formatSRTTime(sub.start);
      const end = formatSRTTime(sub.end);
      return `${sub.index}\n${start} --> ${end}\n${sub.text}\n`;
    })
    .join('\n');
}

/**
 * 将字幕导出为 VTT 格式
 */
export function exportToVTT(subtitles: ParsedSubtitle[]): string {
  const header = 'WEBVTT\n\n';
  const content = subtitles
    .map(sub => {
      const start = formatVTTTime(sub.start);
      const end = formatVTTTime(sub.end);
      return `${start} --> ${end}\n${sub.text}\n`;
    })
    .join('\n');
  return header + content;
}

/**
 * 将字幕导出为 JSON 格式
 */
export function exportToJSON(subtitles: ParsedSubtitle[]): string {
  return JSON.stringify(subtitles, null, 2);
}

/**
 * 验证字幕数据
 */
export function validateSubtitles(subtitles: ParsedSubtitle[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (subtitles.length === 0) {
    errors.push('字幕为空');
    return { valid: false, errors };
  }

  for (let i = 0; i < subtitles.length; i++) {
    const sub = subtitles[i];

    if (sub.start < 0) {
      errors.push(`字幕 ${sub.index}: 开始时间不能为负数`);
    }

    if (sub.end <= sub.start) {
      errors.push(`字幕 ${sub.index}: 结束时间必须大于开始时间`);
    }

    if (!sub.text || sub.text.trim().length === 0) {
      errors.push(`字幕 ${sub.index}: 文本不能为空`);
    }

    // 检查时间重叠
    if (i > 0) {
      const prevSub = subtitles[i - 1];
      if (sub.start < prevSub.end) {
        errors.push(`字幕 ${sub.index}: 与前一条字幕时间重叠`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 合并相邻的短字幕
 */
export function mergeShortSubtitles(
  subtitles: ParsedSubtitle[],
  minDuration: number = 1.5
): ParsedSubtitle[] {
  const merged: ParsedSubtitle[] = [];
  let current: ParsedSubtitle | null = null;

  for (const sub of subtitles) {
    const duration = sub.end - sub.start;

    if (!current) {
      current = { ...sub };
      continue;
    }

    const currentDuration = current.end - current.start;

    // 如果当前字幕太短且与下一条字幕间隔小于 0.5 秒，则合并
    if (currentDuration < minDuration && sub.start - current.end < 0.5) {
      current.end = sub.end;
      current.text += ' ' + sub.text;
    } else {
      merged.push(current);
      current = { ...sub };
    }
  }

  if (current) {
    merged.push(current);
  }

  // 重新编号
  return merged.map((sub, index) => ({
    ...sub,
    index: index + 1
  }));
}

/**
 * 调整字幕时间偏移
 */
export function adjustSubtitleTiming(
  subtitles: ParsedSubtitle[],
  offsetSeconds: number
): ParsedSubtitle[] {
  return subtitles.map(sub => ({
    ...sub,
    start: Math.max(0, sub.start + offsetSeconds),
    end: Math.max(0, sub.end + offsetSeconds)
  }));
}

// 辅助函数

function parseTime(hours: string, minutes: string, seconds: string, milliseconds: string): number {
  return (
    parseInt(hours) * 3600 +
    parseInt(minutes) * 60 +
    parseInt(seconds) +
    parseInt(milliseconds) / 1000
  );
}

function formatSRTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(ms, 3)}`;
}

function formatVTTTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}.${pad(ms, 3)}`;
}

function pad(num: number, length: number = 2): string {
  return num.toString().padStart(length, '0');
}
