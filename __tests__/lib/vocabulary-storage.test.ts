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
    it('should return empty array when no vocabulary saved', () => {
      const vocabulary = getSavedVocabulary();
      expect(vocabulary).toEqual([]);
    });

    it('should return saved vocabulary', () => {
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

      const vocabulary = getSavedVocabulary();
      expect(vocabulary).toHaveLength(1);
      expect(vocabulary[0].word).toBe('hello');
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('saved-vocabulary', 'invalid json');

      const vocabulary = getSavedVocabulary();
      expect(vocabulary).toEqual([]);
    });
  });

  describe('saveVocabulary', () => {
    it('should save a new word', () => {
      const item = saveVocabulary({
        word: 'test',
        translation: '测试',
        context: 'This is a test',
        videoId: 'abc123',
        timestamp: 30,
      });

      expect(item.id).toBeDefined();
      expect(item.word).toBe('test');
      expect(item.savedAt).toBeDefined();

      const saved = getSavedVocabulary();
      expect(saved).toHaveLength(1);
      expect(saved[0].word).toBe('test');
    });

    it('should add new word to the beginning of the list', () => {
      saveVocabulary({
        word: 'first',
        translation: '第一',
        context: 'First word',
        videoId: 'abc',
        timestamp: 10,
      });

      saveVocabulary({
        word: 'second',
        translation: '第二',
        context: 'Second word',
        videoId: 'abc',
        timestamp: 20,
      });

      const saved = getSavedVocabulary();
      expect(saved[0].word).toBe('second'); // Most recent first
      expect(saved[1].word).toBe('first');
    });

    it('should throw error when localStorage quota exceeded', () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw { name: 'QuotaExceededError', message: 'Storage quota exceeded' };
      });

      expect(() => {
        saveVocabulary({
          word: 'test',
          translation: '测试',
          context: 'Test',
          videoId: 'abc',
          timestamp: 10,
        });
      }).toThrow('STORAGE_QUOTA_EXCEEDED');

      // Restore original
      localStorage.setItem = originalSetItem;
    });

    it('should throw error when localStorage is disabled', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw { name: 'SecurityError', message: 'Storage is disabled' };
      });

      expect(() => {
        saveVocabulary({
          word: 'test',
          translation: '测试',
          context: 'Test',
          videoId: 'abc',
          timestamp: 10,
        });
      }).toThrow('STORAGE_DISABLED');

      localStorage.setItem = originalSetItem;
    });
  });

  describe('removeVocabulary', () => {
    it('should remove a word by id', () => {
      const item = saveVocabulary({
        word: 'test',
        translation: '测试',
        context: 'Test',
        videoId: 'abc',
        timestamp: 10,
      });

      removeVocabulary(item.id);

      const saved = getSavedVocabulary();
      expect(saved).toHaveLength(0);
    });

    it('should not affect other words', () => {
      const item1 = saveVocabulary({
        word: 'first',
        translation: '第一',
        context: 'First',
        videoId: 'abc',
        timestamp: 10,
      });

      const item2 = saveVocabulary({
        word: 'second',
        translation: '第二',
        context: 'Second',
        videoId: 'abc',
        timestamp: 20,
      });

      removeVocabulary(item1.id);

      const saved = getSavedVocabulary();
      expect(saved).toHaveLength(1);
      expect(saved[0].word).toBe('second');
    });

    it('should handle removing non-existent id gracefully', () => {
      saveVocabulary({
        word: 'test',
        translation: '测试',
        context: 'Test',
        videoId: 'abc',
        timestamp: 10,
      });

      expect(() => {
        removeVocabulary('non-existent-id');
      }).not.toThrow();

      const saved = getSavedVocabulary();
      expect(saved).toHaveLength(1);
    });
  });

  describe('isWordSaved', () => {
    it('should return true if word is saved for the video', () => {
      saveVocabulary({
        word: 'hello',
        translation: '你好',
        context: 'Hello world',
        videoId: 'video123',
        timestamp: 10,
      });

      expect(isWordSaved('hello', 'video123')).toBe(true);
    });

    it('should return false if word is not saved', () => {
      expect(isWordSaved('hello', 'video123')).toBe(false);
    });

    it('should return false if word is saved for different video', () => {
      saveVocabulary({
        word: 'hello',
        translation: '你好',
        context: 'Hello world',
        videoId: 'video123',
        timestamp: 10,
      });

      expect(isWordSaved('hello', 'video456')).toBe(false);
    });

    it('should be case-insensitive', () => {
      saveVocabulary({
        word: 'Hello',
        translation: '你好',
        context: 'Hello world',
        videoId: 'video123',
        timestamp: 10,
      });

      expect(isWordSaved('hello', 'video123')).toBe(true);
      expect(isWordSaved('Hello', 'video123')).toBe(true);
      expect(isWordSaved('HELLO', 'video123')).toBe(true);
    });
  });
});
