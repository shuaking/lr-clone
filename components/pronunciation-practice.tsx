"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SpeechRecognitionService,
  evaluatePronunciation,
  getSupportedLanguages,
  type SpeechRecognitionResult,
  type PronunciationScore
} from "@/lib/speech-recognition";
import {
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Play
} from "lucide-react";

interface PronunciationPracticeProps {
  text: string;
  language?: string;
  onComplete?: (score: PronunciationScore) => void;
}

export function PronunciationPractice({
  text,
  language = 'en-US',
  onComplete
}: PronunciationPracticeProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [score, setScore] = useState<PronunciationScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [showSettings, setShowSettings] = useState(false);

  const recognitionService = useRef<SpeechRecognitionService | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    recognitionService.current = new SpeechRecognitionService();
    setIsSupported(recognitionService.current.isSupported());

    if (recognitionService.current) {
      recognitionService.current.onResult((result: SpeechRecognitionResult) => {
        if (result.isFinal) {
          setRecognizedText(result.transcript);
          setInterimText('');

          // 评估发音
          const evaluation = evaluatePronunciation(
            text,
            result.transcript,
            result.confidence
          );
          setScore(evaluation);
          onComplete?.(evaluation);

          // 停止监听
          recognitionService.current?.stop();
          setIsListening(false);
        } else {
          setInterimText(result.transcript);
        }
      });

      recognitionService.current.onError((err: string) => {
        setError(err);
        setIsListening(false);
      });

      recognitionService.current.onEnd(() => {
        setIsListening(false);
      });
    }

    return () => {
      recognitionService.current?.abort();
      if (synthRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text, onComplete]);

  const startListening = () => {
    if (!recognitionService.current) return;

    setError(null);
    setRecognizedText('');
    setInterimText('');
    setScore(null);

    const started = recognitionService.current.start({
      language: selectedLanguage,
      continuous: false,
      interimResults: true,
      maxAlternatives: 3
    });

    if (started) {
      setIsListening(true);
    } else {
      setError('无法启动语音识别');
    }
  };

  const stopListening = () => {
    recognitionService.current?.stop();
    setIsListening(false);
  };

  const playAudio = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // 取消之前的播放
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.rate = 0.9; // 稍慢一点，便于学习
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const reset = () => {
    setRecognizedText('');
    setInterimText('');
    setScore(null);
    setError(null);
  };

  const getScoreColor = (level: PronunciationScore['level']) => {
    const colors = {
      excellent: 'text-green-400',
      good: 'text-blue-400',
      fair: 'text-yellow-400',
      poor: 'text-red-400'
    };
    return colors[level];
  };

  const getScoreIcon = (level: PronunciationScore['level']) => {
    const icons = {
      excellent: <CheckCircle className="h-8 w-8 text-green-400" />,
      good: <CheckCircle className="h-8 w-8 text-blue-400" />,
      fair: <AlertCircle className="h-8 w-8 text-yellow-400" />,
      poor: <XCircle className="h-8 w-8 text-red-400" />
    };
    return icons[level];
  };

  if (!isSupported) {
    return (
      <div className="rounded-xl border border-[rgb(var(--border-color))] bg-white/5 p-6 text-center">
        <MicOff className="mx-auto mb-3 h-12 w-12 text-muted" />
        <p className="text-muted">您的浏览器不支持语音识别功能</p>
        <p className="mt-2 text-sm text-muted">
          请使用 Chrome、Edge 或 Safari 浏览器
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 设置按钮 */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition hover:bg-white/10"
        >
          <Settings className="h-4 w-4" />
          设置
        </button>
      </div>

      {/* 语言设置 */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-[rgb(var(--border-color))] bg-white/5 p-4"
          >
            <label className="mb-2 block text-sm font-medium">识别语言</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full rounded-lg border border-[rgb(var(--border-color))] bg-white/5 px-3 py-2 transition focus:border-brand focus:outline-none"
            >
              {getSupportedLanguages().map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 练习文本 */}
      <div className="rounded-xl border border-[rgb(var(--border-color))] bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold">练习文本</h3>
          <button
            onClick={playAudio}
            className="flex items-center gap-2 rounded-lg bg-brand/10 px-3 py-1.5 text-sm text-brand transition hover:bg-brand/20"
          >
            <Volume2 className="h-4 w-4" />
            播放示范
          </button>
        </div>
        <p className="text-lg leading-relaxed">{text}</p>
      </div>

      {/* 录音控制 */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isListening ? stopListening : startListening}
          className={`flex h-20 w-20 items-center justify-center rounded-full transition ${
            isListening
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-brand hover:bg-brand/80'
          }`}
        >
          {isListening ? (
            <MicOff className="h-8 w-8 text-white" />
          ) : (
            <Mic className="h-8 w-8 text-white" />
          )}
        </motion.button>
      </div>

      <p className="text-center text-sm text-muted">
        {isListening ? '正在录音...' : '点击麦克风开始录音'}
      </p>

      {/* 实时识别文本 */}
      {interimText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[rgb(var(--border-color))] bg-white/5 p-4"
        >
          <p className="text-sm text-muted">识别中...</p>
          <p className="mt-2 text-muted/70">{interimText}</p>
        </motion.div>
      )}

      {/* 识别结果 */}
      {recognizedText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[rgb(var(--border-color))] bg-white/5 p-4"
        >
          <p className="mb-2 text-sm font-medium">您的发音</p>
          <p className="text-lg">{recognizedText}</p>
        </motion.div>
      )}

      {/* 评分结果 */}
      <AnimatePresence>
        {score && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="rounded-xl border border-[rgb(var(--border-color))] bg-white/5 p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getScoreIcon(score.level)}
                <div>
                  <p className={`text-2xl font-bold ${getScoreColor(score.level)}`}>
                    {score.score} 分
                  </p>
                  <p className="text-sm text-muted">{score.feedback}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">准确度</span>
                <span className="font-medium">
                  {Math.round(score.accuracy * 100)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score.accuracy * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full bg-brand"
                />
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted">置信度</span>
                <span className="font-medium">
                  {Math.round(score.confidence * 100)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score.confidence * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="h-full bg-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={reset}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[rgb(var(--border-color))] px-4 py-2 transition hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4" />
                重新练习
              </button>
              <button
                onClick={playAudio}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand/10 px-4 py-2 text-brand transition hover:bg-brand/20"
              >
                <Play className="h-4 w-4" />
                再听一遍
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 错误提示 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-4"
        >
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
