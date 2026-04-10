import {
  calculateSM2,
  ReviewQuality,
  initializeSM2,
  getDueWords,
  calculateReviewStats,
  getRecommendedDailyReview,
} from '@/lib/sm2-algorithm';

describe('SM-2 Algorithm', () => {
  describe('calculateSM2', () => {
    it('should calculate correct interval for first review with quality 4', () => {
      const result = calculateSM2({
        quality: ReviewQuality.GOOD,
        repetitions: 0,
        easinessFactor: 2.5,
        interval: 0,
      });

      expect(result.repetitions).toBe(1);
      expect(result.interval).toBe(1); // First review: 1 day
      expect(result.easinessFactor).toBeGreaterThan(2.4);
    });

    it('should calculate correct interval for second review', () => {
      const result = calculateSM2({
        quality: ReviewQuality.GOOD,
        repetitions: 1,
        easinessFactor: 2.5,
        interval: 1,
      });

      expect(result.repetitions).toBe(2);
      expect(result.interval).toBe(6); // Second review: 6 days
    });

    it('should calculate correct interval for third review', () => {
      const result = calculateSM2({
        quality: ReviewQuality.GOOD,
        repetitions: 2,
        easinessFactor: 2.5,
        interval: 6,
      });

      expect(result.repetitions).toBe(3);
      expect(result.interval).toBe(15); // 6 * 2.5 = 15
    });

    it('should reset repetitions when quality < 3', () => {
      const result = calculateSM2({
        quality: ReviewQuality.AGAIN,
        repetitions: 5,
        easinessFactor: 2.5,
        interval: 30,
      });

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1); // Reset to 1 day
    });

    it('should adjust easiness factor correctly', () => {
      // Quality 5 (Easy) should increase EF
      const easyResult = calculateSM2({
        quality: ReviewQuality.EASY,
        repetitions: 0,
        easinessFactor: 2.5,
        interval: 0,
      });

      expect(easyResult.easinessFactor).toBeGreaterThan(2.5);

      // Quality 0 (Again) should decrease EF
      const hardResult = calculateSM2({
        quality: ReviewQuality.AGAIN,
        repetitions: 0,
        easinessFactor: 2.5,
        interval: 0,
      });

      expect(hardResult.easinessFactor).toBeLessThan(2.5);
    });

    it('should not let easiness factor go below 1.3', () => {
      const result = calculateSM2({
        quality: ReviewQuality.AGAIN,
        repetitions: 0,
        easinessFactor: 1.3,
        interval: 0,
      });

      expect(result.easinessFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should return a valid future date', () => {
      const now = new Date();
      const result = calculateSM2({
        quality: ReviewQuality.GOOD,
        repetitions: 0,
        easinessFactor: 2.5,
        interval: 0,
      });

      expect(result.nextReviewDate).toBeInstanceOf(Date);
      expect(result.nextReviewDate.getTime()).toBeGreaterThan(now.getTime());
    });
  });

  describe('initializeSM2', () => {
    it('should return default SM-2 parameters', () => {
      const params = initializeSM2();

      expect(params.repetitions).toBe(0);
      expect(params.easinessFactor).toBe(2.5);
      expect(params.interval).toBe(0);
    });
  });

  describe('getDueWords', () => {
    it('should return words with no review date', () => {
      const words = [
        { word: 'hello', nextReviewAt: undefined },
        { word: 'world', nextReviewAt: new Date(Date.now() + 86400000).toISOString() }, // Tomorrow
      ];

      const due = getDueWords(words);

      expect(due).toHaveLength(1);
      expect(due[0].word).toBe('hello');
    });

    it('should return words with past review date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const words = [
        { word: 'hello', nextReviewAt: yesterday.toISOString() },
        { word: 'world', nextReviewAt: new Date(Date.now() + 86400000).toISOString() },
      ];

      const due = getDueWords(words);

      expect(due).toHaveLength(1);
      expect(due[0].word).toBe('hello');
    });

    it('should not return words with future review date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const words = [
        { word: 'hello', nextReviewAt: tomorrow.toISOString() },
      ];

      const due = getDueWords(words);

      expect(due).toHaveLength(0);
    });
  });

  describe('calculateReviewStats', () => {
    it('should calculate correct stats', () => {
      const words = [
        { reviewCount: 0 }, // new
        { reviewCount: 0 }, // new
        { reviewCount: 1 }, // learning
        { reviewCount: 2 }, // learning
        { reviewCount: 3 }, // mature
        { reviewCount: 5 }, // mature
      ];

      const stats = calculateReviewStats(words);

      expect(stats.total).toBe(6);
      expect(stats.new).toBe(2);
      expect(stats.learning).toBe(2);
      expect(stats.mature).toBe(2);
    });

    it('should count due words correctly', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const words = [
        { reviewCount: 0, nextReviewAt: undefined }, // due (new)
        { reviewCount: 1, nextReviewAt: yesterday.toISOString() }, // due
        { reviewCount: 2, nextReviewAt: tomorrow.toISOString() }, // not due
      ];

      const stats = calculateReviewStats(words);

      expect(stats.due).toBe(2);
    });
  });

  describe('getRecommendedDailyReview', () => {
    it('should recommend at least 20 words', () => {
      const stats = {
        total: 10,
        due: 5,
        new: 10,
        learning: 0,
        mature: 0,
      };

      const recommended = getRecommendedDailyReview(stats);

      expect(recommended).toBeGreaterThanOrEqual(20);
    });

    it('should not recommend more than 50 words', () => {
      const stats = {
        total: 1000,
        due: 100,
        new: 500,
        learning: 200,
        mature: 200,
      };

      const recommended = getRecommendedDailyReview(stats);

      expect(recommended).toBeLessThanOrEqual(50);
    });

    it('should include due words + 20% of new words', () => {
      const stats = {
        total: 50,
        due: 10,
        new: 40,
        learning: 0,
        mature: 0,
      };

      const recommended = getRecommendedDailyReview(stats);

      // 10 due + 8 new (20% of 40) = 18, but minimum is 20
      expect(recommended).toBe(20);
    });
  });
});
