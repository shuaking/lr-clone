/**
 * SuperMemo SM-2 间隔重复算法
 *
 * 参考: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 *
 * 核心概念:
 * - EF (Easiness Factor): 难度系数，范围 1.3 - 2.5
 * - Interval: 复习间隔（天数）
 * - Repetitions: 重复次数
 * - Quality: 用户评分 0-5
 */

export interface SM2Result {
  interval: number;        // 下次复习间隔（天数）
  repetitions: number;     // 重复次数
  easinessFactor: number;  // 难度系数
  nextReviewDate: Date;    // 下次复习日期
}

export interface SM2Input {
  quality: number;         // 0-5 的评分
  repetitions: number;     // 当前重复次数
  easinessFactor: number;  // 当前难度系数
  interval: number;        // 当前间隔
}

/**
 * 评分等级映射
 */
export enum ReviewQuality {
  AGAIN = 0,    // 完全不记得
  HARD = 3,     // 记得但很困难
  GOOD = 4,     // 记得，有点犹豫
  EASY = 5,     // 完全记得，很容易
}

/**
 * SM-2 算法核心实现
 */
export function calculateSM2(input: SM2Input): SM2Result {
  let { quality, repetitions, easinessFactor, interval } = input;

  // 1. 更新难度系数 (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easinessFactor = Math.max(
    1.3,
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // 2. 如果评分 < 3，重置重复次数
  if (quality < 3) {
    repetitions = 0;
    interval = 1; // 明天再复习
  } else {
    // 3. 增加重复次数
    repetitions += 1;

    // 4. 计算新的间隔
    if (repetitions === 1) {
      interval = 1; // 第一次：1 天
    } else if (repetitions === 2) {
      interval = 6; // 第二次：6 天
    } else {
      // 第三次及以后：interval * EF
      interval = Math.round(interval * easinessFactor);
    }
  }

  // 5. 计算下次复习日期
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    interval,
    repetitions,
    easinessFactor,
    nextReviewDate,
  };
}

/**
 * 初始化新单词的 SM-2 参数
 */
export function initializeSM2(): Omit<SM2Input, 'quality'> {
  return {
    repetitions: 0,
    easinessFactor: 2.5, // 默认难度系数
    interval: 0,
  };
}

/**
 * 获取待复习的单词（今天或之前应该复习的）
 */
export function getDueWords<T extends { nextReviewAt?: string }>(
  words: T[]
): T[] {
  const now = new Date();
  return words.filter((word) => {
    if (!word.nextReviewAt) return true; // 从未复习过的单词
    const reviewDate = new Date(word.nextReviewAt);
    return reviewDate <= now;
  });
}

/**
 * 计算复习进度统计
 */
export interface ReviewStats {
  total: number;           // 总单词数
  due: number;             // 待复习数
  new: number;             // 新单词数
  learning: number;        // 学习中（重复次数 < 3）
  mature: number;          // 已掌握（重复次数 >= 3）
}

export function calculateReviewStats<T extends {
  nextReviewAt?: string;
  reviewCount?: number;
}>(words: T[]): ReviewStats {
  const now = new Date();

  const stats: ReviewStats = {
    total: words.length,
    due: 0,
    new: 0,
    learning: 0,
    mature: 0,
  };

  words.forEach((word) => {
    const reviewCount = word.reviewCount || 0;

    // 新单词
    if (reviewCount === 0) {
      stats.new += 1;
    }
    // 学习中
    else if (reviewCount < 3) {
      stats.learning += 1;
    }
    // 已掌握
    else {
      stats.mature += 1;
    }

    // 待复习
    if (!word.nextReviewAt) {
      stats.due += 1;
    } else {
      const reviewDate = new Date(word.nextReviewAt);
      if (reviewDate <= now) {
        stats.due += 1;
      }
    }
  });

  return stats;
}

/**
 * 获取推荐的每日复习数量
 */
export function getRecommendedDailyReview(stats: ReviewStats): number {
  // 基础公式：待复习 + 新单词的 20%
  const recommended = stats.due + Math.ceil(stats.new * 0.2);

  // 限制在 20-50 之间
  return Math.max(20, Math.min(50, recommended));
}
