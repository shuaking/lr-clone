"use client";

import { useState } from 'react';
import { useWordLookup, useTranslate } from '@/hooks/useAdvancedDictionary';
import { WordPopupEnhanced } from '@/components/word-popup-enhanced';
import { ApiSettings } from '@/components/api-settings';

export default function TranslationTestPage() {
  const [testWord, setTestWord] = useState('hello');
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);

  const { loading, error, result } = useWordLookup(testWord, 'en');
  const { translate } = useTranslate();

  const [translationResult, setTranslationResult] = useState<string>('');
  const [translating, setTranslating] = useState(false);

  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const result = await translate('Hello, how are you?', 'en', 'zh');
      setTranslationResult(result.translatedText);
    } catch (err) {
      setTranslationResult('Translation failed: ' + (err as Error).message);
    } finally {
      setTranslating(false);
    }
  };

  const handleWordClick = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopupPosition({ x: rect.left, y: rect.bottom });
    setShowPopup(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="mb-6 text-3xl font-bold">翻译和词典功能测试</h1>

      {/* API 设置 */}
      <section className="mb-8 rounded-xl bg-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">API 配置</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700"
          >
            {showSettings ? '隐藏设置' : '显示设置'}
          </button>
        </div>
        {showSettings && <ApiSettings />}
      </section>

      {/* 词典测试 */}
      <section className="mb-8 rounded-xl bg-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-4">词典查询测试</h2>

        <div className="mb-4">
          <label className="block mb-2">测试单词：</label>
          <input
            type="text"
            value={testWord}
            onChange={(e) => setTestWord(e.target.value)}
            className="rounded-lg bg-gray-700 px-4 py-2 text-white w-64"
            placeholder="输入英文单词"
          />
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">状态：{loading ? '查询中...' : '就绪'}</p>
          {error && <p className="text-red-400">错误：{error}</p>}
        </div>

        {result && (
          <div className="rounded-lg bg-gray-700 p-4">
            <h3 className="font-semibold mb-2">查询结果：</h3>
            <pre className="text-sm overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-4">
          <p className="mb-2">点击下面的单词测试弹窗：</p>
          <span
            onClick={handleWordClick}
            className="cursor-pointer text-blue-400 hover:text-blue-300 text-xl font-semibold"
          >
            {testWord}
          </span>
        </div>
      </section>

      {/* 翻译测试 */}
      <section className="mb-8 rounded-xl bg-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-4">翻译服务测试</h2>

        <button
          onClick={handleTranslate}
          disabled={translating}
          className="rounded-lg bg-green-600 px-4 py-2 hover:bg-green-700 disabled:opacity-50"
        >
          {translating ? '翻译中...' : '测试翻译 (EN → ZH)'}
        </button>

        {translationResult && (
          <div className="mt-4 rounded-lg bg-gray-700 p-4">
            <h3 className="font-semibold mb-2">翻译结果：</h3>
            <p>{translationResult}</p>
          </div>
        )}
      </section>

      {/* 功能说明 */}
      <section className="rounded-xl bg-blue-900 p-6">
        <h2 className="text-xl font-semibold mb-4">测试说明</h2>
        <ul className="list-disc list-inside space-y-2 text-sm">
          <li>点击"显示设置"配置 API keys（可选，默认使用免费服务）</li>
          <li>在"词典查询测试"中输入单词查看查询结果</li>
          <li>点击蓝色单词测试增强弹窗功能</li>
          <li>点击"测试翻译"按钮测试翻译服务</li>
          <li>开发环境默认使用 Mock 提供商</li>
        </ul>
      </section>

      {/* 单词弹窗 */}
      {showPopup && (
        <WordPopupEnhanced
          word={testWord}
          position={popupPosition}
          onClose={() => setShowPopup(false)}
          context="This is a test context"
          language="en"
        />
      )}
    </div>
  );
}
