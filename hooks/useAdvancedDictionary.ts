/**
 * 集成翻译和词典服务的 Hook
 */

import { useEffect, useState } from 'react';
import { useApiConfigStore } from '@/lib/stores/api-config-store';
import { getTranslationService, TranslationResult } from '@/lib/translation';
import { getDictionaryService, DictionaryResult } from '@/lib/dictionary';

export function useTranslationService() {
  const { config } = useApiConfigStore();
  const [service] = useState(() => getTranslationService(config.translation));

  useEffect(() => {
    service.updateConfig(config.translation);
  }, [config.translation, service]);

  return service;
}

export function useDictionaryService() {
  const { config } = useApiConfigStore();
  const [service] = useState(() => getDictionaryService(config.dictionary));

  useEffect(() => {
    service.updateConfig(config.dictionary);
  }, [config.dictionary, service]);

  return service;
}

export function useWordLookup(word: string, language: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const dictionaryService = useDictionaryService();

  useEffect(() => {
    if (!word || !language) return;

    let cancelled = false;

    const lookup = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await dictionaryService.lookup(word, language);
        if (!cancelled) {
          setResult(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Lookup failed');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    lookup();

    return () => {
      cancelled = true;
    };
  }, [word, language, dictionaryService]);

  return { loading, error, result };
}

export function useTranslate() {
  const translationService = useTranslationService();

  const translate = async (
    text: string,
    sourceLang: string,
    targetLang: string,
    context?: string
  ): Promise<TranslationResult> => {
    return translationService.translate({
      text,
      sourceLang,
      targetLang,
      context
    });
  };

  return { translate };
}
