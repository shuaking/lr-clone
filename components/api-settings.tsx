/**
 * API 配置设置组件
 */

'use client';

import { useState } from 'react';
import { useApiConfigStore } from '@/lib/stores/api-config-store';
import { Check, X, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function ApiSettings() {
  const { config, updateTranslationConfig, updateDictionaryConfig, resetConfig } = useApiConfigStore();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const testConnection = async (provider: string) => {
    setTesting(prev => ({ ...prev, [provider]: true }));
    setTestResults(prev => ({ ...prev, [provider]: null }));

    try {
      // 这里会调用实际的 API 测试
      // 暂时模拟测试
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 实际实现时应该调用对应的 API 测试方法
      const success = Math.random() > 0.3; // 模拟测试结果

      setTestResults(prev => ({ ...prev, [provider]: success }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [provider]: false }));
    } finally {
      setTesting(prev => ({ ...prev, [provider]: false }));
    }
  };

  return (
    <div className="space-y-8">
      {/* 翻译 API 配置 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">翻译 API 配置</h2>
        <div className="space-y-6">
          {/* DeepL */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium">DeepL API</h3>
                <p className="text-sm text-muted mt-1">高质量翻译服务（付费）</p>
              </div>
              {testResults.deepl !== null && (
                <div className={`flex items-center gap-2 text-sm ${testResults.deepl ? 'text-green-400' : 'text-red-400'}`}>
                  {testResults.deepl ? <Check size={16} /> : <X size={16} />}
                  {testResults.deepl ? '连接成功' : '连接失败'}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-muted mb-2">API Key</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys.deepl ? 'text' : 'password'}
                      value={config.translation.deeplApiKey || ''}
                      onChange={(e) => updateTranslationConfig({ deeplApiKey: e.target.value })}
                      placeholder="输入 DeepL API Key"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                    <button
                      onClick={() => toggleShowKey('deepl')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-white transition"
                    >
                      {showKeys.deepl ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button
                    onClick={() => testConnection('deepl')}
                    disabled={!config.translation.deeplApiKey || testing.deepl}
                    className="px-4 py-2 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {testing.deepl ? <Loader2 size={14} className="animate-spin" /> : null}
                    测试
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted mb-2">API URL（可选）</label>
                <input
                  type="text"
                  value={config.translation.deeplApiUrl || ''}
                  onChange={(e) => updateTranslationConfig({ deeplApiUrl: e.target.value })}
                  placeholder="https://api-free.deepl.com/v2"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
                <p className="text-xs text-muted mt-1">免费版使用 api-free.deepl.com，付费版使用 api.deepl.com</p>
              </div>
            </div>
          </div>

          {/* Google Translate */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium">Google Translate API</h3>
                <p className="text-sm text-muted mt-1">支持最多语言（付费）</p>
              </div>
              {testResults.google !== null && (
                <div className={`flex items-center gap-2 text-sm ${testResults.google ? 'text-green-400' : 'text-red-400'}`}>
                  {testResults.google ? <Check size={16} /> : <X size={16} />}
                  {testResults.google ? '连接成功' : '连接失败'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">API Key</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKeys.google ? 'text' : 'password'}
                    value={config.translation.googleApiKey || ''}
                    onChange={(e) => updateTranslationConfig({ googleApiKey: e.target.value })}
                    placeholder="输入 Google API Key"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                  <button
                    onClick={() => toggleShowKey('google')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-white transition"
                  >
                    {showKeys.google ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button
                  onClick={() => testConnection('google')}
                  disabled={!config.translation.googleApiKey || testing.google}
                  className="px-4 py-2 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {testing.google ? <Loader2 size={14} className="animate-spin" /> : null}
                  测试
                </button>
              </div>
            </div>
          </div>

          {/* LibreTranslate */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium">LibreTranslate</h3>
                <p className="text-sm text-muted mt-1">开源免费翻译服务</p>
              </div>
              {testResults.libretranslate !== null && (
                <div className={`flex items-center gap-2 text-sm ${testResults.libretranslate ? 'text-green-400' : 'text-red-400'}`}>
                  {testResults.libretranslate ? <Check size={16} /> : <X size={16} />}
                  {testResults.libretranslate ? '连接成功' : '连接失败'}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-muted mb-2">服务器 URL</label>
                <input
                  type="text"
                  value={config.translation.libreTranslateUrl || ''}
                  onChange={(e) => updateTranslationConfig({ libreTranslateUrl: e.target.value })}
                  placeholder="https://libretranslate.com"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm text-muted mb-2">API Key（可选）</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeys.libretranslate ? 'text' : 'password'}
                      value={config.translation.libreTranslateApiKey || ''}
                      onChange={(e) => updateTranslationConfig({ libreTranslateApiKey: e.target.value })}
                      placeholder="某些实例需要 API Key"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    />
                    <button
                      onClick={() => toggleShowKey('libretranslate')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-white transition"
                    >
                      {showKeys.libretranslate ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <button
                    onClick={() => testConnection('libretranslate')}
                    disabled={testing.libretranslate}
                    className="px-4 py-2 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {testing.libretranslate ? <Loader2 size={14} className="animate-spin" /> : null}
                    测试
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 首选提供商 */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-medium mb-3">翻译设置</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-muted mb-2">首选翻译服务</label>
                <select
                  value={config.translation.preferredProvider || ''}
                  onChange={(e) => updateTranslationConfig({
                    preferredProvider: (e.target.value || undefined) as 'deepl' | 'google' | 'libretranslate' | 'mymemory' | undefined
                  })}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                >
                  <option value="">自动选择</option>
                  <option value="deepl">DeepL</option>
                  <option value="google">Google Translate</option>
                  <option value="libretranslate">LibreTranslate</option>
                  <option value="mymemory">MyMemory</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.translation.enableFallback}
                  onChange={(e) => updateTranslationConfig({ enableFallback: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">启用自动降级（推荐）</span>
              </label>
              <p className="text-xs text-muted">当首选服务失败时，自动尝试其他翻译服务</p>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm text-blue-100">
              <p className="font-medium mb-1">如何获取 API Key？</p>
              <ul className="space-y-1 text-blue-200/80">
                <li>• DeepL: 访问 <a href="https://www.deepl.com/pro-api" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-100">deepl.com/pro-api</a> 注册</li>
                <li>• Google: 访问 <a href="https://cloud.google.com/translate" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-100">Google Cloud Console</a> 启用 Translation API</li>
                <li>• LibreTranslate: 公共实例免费使用，自托管实例可能需要 API Key</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 词典配置 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">词典配置</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="font-medium mb-3">启用的词典源</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.dictionary.enabledProviders.includes('free-dictionary')}
                  onChange={(e) => {
                    const providers = e.target.checked
                      ? [...config.dictionary.enabledProviders, 'free-dictionary']
                      : config.dictionary.enabledProviders.filter(p => p !== 'free-dictionary');
                    updateDictionaryConfig({ enabledProviders: providers });
                  }}
                  className="rounded"
                />
                <span className="text-sm">Free Dictionary API（英语定义和发音）</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.dictionary.enabledProviders.includes('tatoeba')}
                  onChange={(e) => {
                    const providers = e.target.checked
                      ? [...config.dictionary.enabledProviders, 'tatoeba']
                      : config.dictionary.enabledProviders.filter(p => p !== 'tatoeba');
                    updateDictionaryConfig({ enabledProviders: providers });
                  }}
                  className="rounded"
                />
                <span className="text-sm">Tatoeba（多语言例句）</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.dictionary.enabledProviders.includes('lemmatization')}
                  onChange={(e) => {
                    const providers = e.target.checked
                      ? [...config.dictionary.enabledProviders, 'lemmatization']
                      : config.dictionary.enabledProviders.filter(p => p !== 'lemmatization');
                    updateDictionaryConfig({ enabledProviders: providers });
                  }}
                  className="rounded"
                />
                <span className="text-sm">词形变化识别（英语）</span>
              </label>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <label className="block text-sm text-muted mb-2">最大例句数量</label>
            <input
              type="number"
              min="1"
              max="20"
              value={config.dictionary.maxExamples}
              onChange={(e) => updateDictionaryConfig({ maxExamples: parseInt(e.target.value) || 5 })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
      </section>

      {/* 重置按钮 */}
      <div className="flex justify-end">
        <button
          onClick={resetConfig}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition"
        >
          重置所有配置
        </button>
      </div>
    </div>
  );
}
