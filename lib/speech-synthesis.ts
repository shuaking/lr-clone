/**
 * 增强的发音功能
 *
 * 支持多种口音、语速调节、音标显示
 */

export enum VoiceAccent {
  US = 'en-US',      // 美式英语
  GB = 'en-GB',      // 英式英语
  AU = 'en-AU',      // 澳式英语
  IN = 'en-IN',      // 印度英语
}

export interface SpeechOptions {
  accent: VoiceAccent;
  rate: number;      // 语速 0.5 - 2.0
  pitch: number;     // 音调 0.5 - 2.0
  volume: number;    // 音量 0.0 - 1.0
}

const DEFAULT_OPTIONS: SpeechOptions = {
  accent: VoiceAccent.US,
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

/**
 * 检查浏览器是否支持语音合成
 */
export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window;
}

/**
 * 获取可用的语音列表
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * 根据口音选择最佳语音
 */
export function selectVoiceByAccent(accent: VoiceAccent): SpeechSynthesisVoice | null {
  const voices = getAvailableVoices();

  // 优先选择指定口音的语音
  const preferredVoice = voices.find(
    (voice) => voice.lang === accent && voice.localService
  );

  if (preferredVoice) return preferredVoice;

  // 备选：任何匹配口音的语音
  const fallbackVoice = voices.find((voice) => voice.lang === accent);

  if (fallbackVoice) return fallbackVoice;

  // 最后备选：任何英语语音
  return voices.find((voice) => voice.lang.startsWith('en')) || null;
}

/**
 * 朗读单词
 */
export function speakWord(
  word: string,
  options: Partial<SpeechOptions> = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSpeechSupported()) {
      reject(new Error('浏览器不支持语音合成'));
      return;
    }

    const finalOptions = { ...DEFAULT_OPTIONS, ...options };

    // 停止当前播放
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);

    // 设置语音
    const voice = selectVoiceByAccent(finalOptions.accent);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = finalOptions.accent;

    // 设置参数
    utterance.rate = finalOptions.rate;
    utterance.pitch = finalOptions.pitch;
    utterance.volume = finalOptions.volume;

    // 事件监听
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`语音合成失败: ${event.error}`));

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * 停止当前播放
 */
export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * 暂停播放
 */
export function pauseSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.pause();
  }
}

/**
 * 恢复播放
 */
export function resumeSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.resume();
  }
}

/**
 * 检查是否正在播放
 */
export function isSpeaking(): boolean {
  if (!isSpeechSupported()) return false;
  return window.speechSynthesis.speaking;
}

/**
 * 获取音标（简化版，实际应该使用 API）
 */
export function getPhonetic(word: string): string | null {
  // 这里应该调用音标 API，如 Oxford Dictionary API
  // 目前返回 null，由翻译 API 提供音标
  return null;
}

/**
 * 口音选项配置
 */
export const ACCENT_OPTIONS = [
  { value: VoiceAccent.US, label: '美式英语', flag: '🇺🇸' },
  { value: VoiceAccent.GB, label: '英式英语', flag: '🇬🇧' },
  { value: VoiceAccent.AU, label: '澳式英语', flag: '🇦🇺' },
  { value: VoiceAccent.IN, label: '印度英语', flag: '🇮🇳' },
];

/**
 * 语速选项
 */
export const RATE_OPTIONS = [
  { value: 0.5, label: '0.5x（慢速）' },
  { value: 0.75, label: '0.75x' },
  { value: 1.0, label: '1.0x（正常）' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x（快速）' },
  { value: 2.0, label: '2.0x（极快）' },
];

/**
 * 保存用户偏好设置
 */
export function saveSpeechPreferences(options: Partial<SpeechOptions>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('speech-preferences', JSON.stringify(options));
}

/**
 * 加载用户偏好设置
 */
export function loadSpeechPreferences(): Partial<SpeechOptions> {
  if (typeof window === 'undefined') return {};

  try {
    const saved = localStorage.getItem('speech-preferences');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}
