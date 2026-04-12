"use client";

import { useState } from 'react';

export default function SimpleTranslationTestPage() {
  const [testResult, setTestResult] = useState<string>('');

  const testDictionaryImport = async () => {
    try {
      const { getDictionaryService } = await import('@/lib/dictionary');
      const service = getDictionaryService();
      const result = await service.lookup('hello', 'en');
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult('Error: ' + (error as Error).message + '\n' + (error as Error).stack);
    }
  };

  const testTranslationImport = async () => {
    try {
      const { getTranslationService } = await import('@/lib/translation');
      const service = getTranslationService();
      const result = await service.translate({
        text: 'Hello',
        sourceLang: 'en',
        targetLang: 'zh'
      });
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult('Error: ' + (error as Error).message + '\n' + (error as Error).stack);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <h1 className="mb-6 text-3xl font-bold">简单翻译测试</h1>

      <div className="space-y-4">
        <button
          onClick={testDictionaryImport}
          className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700"
        >
          测试词典服务
        </button>

        <button
          onClick={testTranslationImport}
          className="rounded-lg bg-green-600 px-4 py-2 hover:bg-green-700 ml-4"
        >
          测试翻译服务
        </button>
      </div>

      {testResult && (
        <div className="mt-6 rounded-lg bg-gray-800 p-4">
          <h2 className="font-semibold mb-2">测试结果：</h2>
          <pre className="text-sm overflow-auto max-h-96 whitespace-pre-wrap">
            {testResult}
          </pre>
        </div>
      )}

      <div className="mt-8 rounded-lg bg-blue-900 p-4">
        <h2 className="font-semibold mb-2">说明：</h2>
        <p className="text-sm">这是一个简化的测试页面，用于验证翻译和词典服务的基本功能。</p>
      </div>
    </div>
  );
}
