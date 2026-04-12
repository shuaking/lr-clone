import { NextResponse } from 'next/server';
import { getDictionaryService } from '@/lib/dictionary';
import { getTranslationService } from '@/lib/translation';

export async function GET() {
  const results: any = {
    dictionary: { status: 'unknown', error: null, data: null },
    translation: { status: 'unknown', error: null, data: null }
  };

  // Test dictionary service
  try {
    const dictService = getDictionaryService();
    results.dictionary.status = 'service_created';

    // Try a lookup
    const lookupResult = await dictService.lookup('hello', 'en');
    results.dictionary.status = 'success';
    results.dictionary.data = { lookupResult };
  } catch (error: any) {
    results.dictionary.status = 'error';
    results.dictionary.error = {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }

  // Test translation service
  try {
    const transService = getTranslationService();
    results.translation.status = 'service_created';

    // Try a translation
    const transResult = await transService.translate({
      text: 'Hello',
      sourceLang: 'en',
      targetLang: 'zh'
    });
    results.translation.status = 'success';
    results.translation.data = { translationResult: transResult };
  } catch (error: any) {
    results.translation.status = 'error';
    results.translation.error = {
      message: error.message,
      stack: error.stack,
      name: error.name
    };
  }

  return NextResponse.json(results, { status: 200 });
}
