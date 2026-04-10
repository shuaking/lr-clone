/**
 * 语音识别系统
 * 使用 Web Speech API 实现语音转文字
 */

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  alternatives?: Array<{
    transcript: string;
    confidence: number;
  }>;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback?: (result: SpeechRecognitionResult) => void;
  private onErrorCallback?: (error: string) => void;
  private onEndCallback?: () => void;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
      }
    }
  }

  /**
   * 检查浏览器是否支持语音识别
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * 开始语音识别
   */
  start(options: SpeechRecognitionOptions = {}): boolean {
    if (!this.recognition) {
      this.onErrorCallback?.('Speech recognition not supported');
      return false;
    }

    if (this.isListening) {
      return false;
    }

    // 配置识别器
    this.recognition.lang = options.language || 'en-US';
    this.recognition.continuous = options.continuous ?? false;
    this.recognition.interimResults = options.interimResults ?? true;
    this.recognition.maxAlternatives = options.maxAlternatives || 3;

    // 设置事件处理
    this.recognition.onresult = (event: any) => {
      const results = event.results;
      const lastResult = results[results.length - 1];

      const result: SpeechRecognitionResult = {
        transcript: lastResult[0].transcript,
        confidence: lastResult[0].confidence,
        isFinal: lastResult.isFinal,
        alternatives: []
      };

      // 收集备选结果
      for (let i = 0; i < lastResult.length; i++) {
        result.alternatives?.push({
          transcript: lastResult[i].transcript,
          confidence: lastResult[i].confidence
        });
      }

      this.onResultCallback?.(result);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      this.onErrorCallback?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onEndCallback?.();
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      this.onErrorCallback?.('Failed to start recognition');
      return false;
    }
  }

  /**
   * 停止语音识别
   */
  stop(): void {
    if (this.recognition && this.isListening) {
      // 清理事件处理器，防止内存泄漏
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;

      this.recognition.stop();
      this.isListening = false;
    }
  }

  /**
   * 中止语音识别
   */
  abort(): void {
    if (this.recognition && this.isListening) {
      // 清理事件处理器，防止内存泄漏
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;

      this.recognition.abort();
      this.isListening = false;
    }
  }

  /**
   * 设置结果回调
   */
  onResult(callback: (result: SpeechRecognitionResult) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * 设置错误回调
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * 设置结束回调
   */
  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  /**
   * 获取当前状态
   */
  getIsListening(): boolean {
    return this.isListening;
  }
}

/**
 * 比较两个文本的相似度（用于发音评分）
 */
export function calculateSimilarity(text1: string, text2: string): number {
  const s1 = text1.toLowerCase().trim();
  const s2 = text2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  // 使用 Levenshtein 距离计算相似度
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);

  return maxLength === 0 ? 1.0 : 1 - (distance / maxLength);
}

/**
 * Levenshtein 距离算法
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // 删除
          dp[i][j - 1] + 1,     // 插入
          dp[i - 1][j - 1] + 1  // 替换
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * 评估发音质量
 */
export interface PronunciationScore {
  score: number;           // 0-100
  accuracy: number;        // 文本匹配度 0-1
  confidence: number;      // 识别置信度 0-1
  feedback: string;        // 反馈信息
  level: 'excellent' | 'good' | 'fair' | 'poor';
}

export function evaluatePronunciation(
  expected: string,
  recognized: string,
  confidence: number
): PronunciationScore {
  const accuracy = calculateSimilarity(expected, recognized);
  const score = Math.round((accuracy * 0.7 + confidence * 0.3) * 100);

  let level: PronunciationScore['level'];
  let feedback: string;

  if (score >= 90) {
    level = 'excellent';
    feedback = '发音非常准确！';
  } else if (score >= 75) {
    level = 'good';
    feedback = '发音不错，继续保持！';
  } else if (score >= 60) {
    level = 'fair';
    feedback = '发音基本正确，还可以更好。';
  } else {
    level = 'poor';
    feedback = '需要多加练习，注意发音细节。';
  }

  return {
    score,
    accuracy,
    confidence,
    feedback,
    level
  };
}

/**
 * 获取支持的语言列表
 */
export function getSupportedLanguages(): Array<{ code: string; name: string }> {
  return [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'zh-CN', name: '中文（简体）' },
    { code: 'zh-TW', name: '中文（繁體）' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'it-IT', name: 'Italiano' },
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'ru-RU', name: 'Русский' },
    { code: 'ar-SA', name: 'العربية' },
    { code: 'th-TH', name: 'ไทย' }
  ];
}
