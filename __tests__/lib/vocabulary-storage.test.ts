import {
  getSavedVocabulary,
  saveVocabulary,
  removeVocabulary,
  isWordSaved,
} from '@/lib/vocabulary-storage';

describe('Vocabulary Storage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getSavedVocabulary', () => {
    it('should return empty array when no vocabulary saved', async () => {
      const vocabulary = await getSavedVocabulary();
      expect(vocabulary).toEqual([]);
    });

    it('should return saved vocabulary', async () => {
      const mockData = [
        {
          id: '1',
          word: 'hello',
          translation: '你好',
          context: 'Hello world',
          videoId: 'test123',
          timestamp: 10,
          savedAt: Date.now(),
        },
      ];

      localStorage.setItem('lr-saved-vocabulary', JSON.stringify(mockData));

      const vocabulary = await getSavedVocabulary();
      expect(vocabulary).toHaveLength(1);
      expect(vocabulary[0].word).toBe('hello');
    });

    it('should handle corrupted data gracefully', async () => {
      localStorage.setItem('saved-vocabulary', 'invalid json');

      const vocabulary = await getSavedVocabulary();
      expect(vocabulary).toEqual([]);
    });
  });

  describe('saveVocabulary', () => {
    it('should save a new word', async () => {
      const item = await saveVocabulary({
        word: 'test',
        translation: '测试',
        context: 'This is a test',
        videoId: 'abc123',
        timestamp: 30,
      });

      expect(item.id).toBeDefined();
      expect(item.word).toBe('test');
      expect(item.savedAt).toBeDefined();

      const saved = await getSavedVocabulary();
      expect(saved).toHaveLength(1);
      expect(saved[0].word).toBe('test');
    });

    it('should add new word to the beginning of the list', async () => {
      await saveVocabulary({
        word: 'first',
        translation: '第一',
        context: 'First word',
        videoId: 'abc',
        timestamp: 10,
      });

      await saveVocabulary({
        word: 'second',
        translation: '第二',
        context: 'Second word',
        videoId: 'abc',
        timestamp: 20,
      });

      const saved = await getSavedVocabulary();
      expect(saved[0].word).toBe('second'); // Most recent first
      expect(saved[1].word).toBe('first');
    });

    it('should throw error when localStorage quota exceeded', async () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw { name: 'QuotaExceededError', message: 'Storage quota exceeded' };
      });

      await expect(async () => {
        await saveVocabulary({
          word: 'test',
          translation: '测试',
          context: 'Test',
          videoId: 'abc',
          timestamp: 10,
        });
      }).rejects.toThrow('STORAGE_QUOTA_EXCEEDED');

      // Restore original
      localStorage.setItem = originalSetItem;
    });

    it('should throw error when localStorage is disabled', async () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw { name: 'SecurityError', message: 'Storage is disabled' };
      });

      await expect(async () => {
        await saveVocabulary({
          word: 'test',
          translation: '测试',
          context: 'Test',
          videoId: 'abc',
          timestamp: 10,
        });
      }).rejects.toThrow('STORAGE_DISABLED');

      localStorage.setItem = originalSetItem;
    });
  });

  describe('removeVocabulary', () => {
    it('should remove a word by id', async () => {
      const item = await saveVocabulary({
        word: 'test',
        translation: '测试',
        context: 'Test',
        videoId: 'abc',
        timestamp: 10,
      });

      await removeVocabulary(item.id);

      const saved = await getSavedVocabulary();
      expect(saved).toHaveLength(0);
    });

    it('should not affect other words', async () => {
      const item1 = await saveVocabulary({
        word: 'first',
        translation: '第一',
        context: 'First',
        videoId: 'abc',
        timestamp: 10,
      });

      const item2 = await saveVocabulary({
        word: 'second',
        translation: '第二',
        context: 'Second',
        videoId: 'abc',
        timestamp: 20,
      });

      await removeVocabulary(item1.id);

      const saved = await getSavedVocabulary();
      expect(saved).toHaveLength(1);
      expect(saved[0].word).toBe('second');
    });

    it('should handle removing non-existent id gracefully', async () => {
      await saveVocabulary({
        word: 'test',
        translation: '测试',
        context: 'Test',
        videoId: 'abc',
        timestamp: 10,
      });

      await expect(async () => {
        await removeVocabulary('non-existent-id');
      }).resolves.not.toThrow();

      const saved = await getSavedVocabulary();
      expect(saved).toHaveLength(1);
    });
  });

  describe('isWordSaved', () => {
    it('should return true if word is saved for the video', async () => {
      await saveVocabulary({
        word: 'hello',
        translation: '你好',
        context: 'Hello world',
        videoId: 'video123',
        timestamp: 10,
      });

      expect(await isWordSaved('hello', 'video123')).toBe(true);
    });

    it('should return false if word is not saved', async () => {
      expect(await isWordSaved('hello', 'video123')).toBe(false);
    });

    it('should return false if word is saved for different video', async () => {
      await saveVocabulary({
        word: 'hello',
        translation: '你好',
        context: 'Hello world',
        videoId: 'video123',
        timestamp: 10,
      });

      expect(await isWordSaved('hello', 'video456')).toBe(false);
    });

    it('should be case-insensitive', async () => {
      await saveVocabulary({
        word: 'Hello',
        translation: '你好',
        context: 'Hello world',
        videoId: 'video123',
        timestamp: 10,
      });

      expect(await isWordSaved('hello', 'video123')).toBe(true);
      expect(await isWordSaved('Hello', 'video123')).toBe(true);
      expect(await isWordSaved('HELLO', 'video123')).toBe(true);
    });
  });
});
