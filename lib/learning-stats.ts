/**
 * 学习统计和成就系统
 */

export interface LearningStats {
  totalDays: number;              // 总学习天数
  currentStreak: number;          // 当前连续天数
  longestStreak: number;          // 最长连续天数
  totalWords: number;             // 保存的单词总数
  totalPractices: number;         // 完成的练习次数
  totalTexts: number;             // 阅读的文本数量
  totalMinutes: number;           // 总学习时长（分钟）
  lastActiveDate: string;         // 最后活跃日期
  firstActiveDate: string;        // 首次活跃日期
  dailyActivity: Record<string, DailyActivity>; // 每日活动记录
}

export interface DailyActivity {
  date: string;
  wordsLearned: number;
  practicesCompleted: number;
  textsRead: number;
  minutesSpent: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  unlocked: boolean;
  unlockedAt?: string;
}

const STATS_KEY = 'lr-learning-stats';
const ACHIEVEMENTS_KEY = 'lr-achievements';

/**
 * 获取学习统计
 */
export function getLearningStats(): LearningStats {
  if (typeof window === 'undefined') {
    return getDefaultStats();
  }

  try {
    const data = localStorage.getItem(STATS_KEY);
    if (!data) return getDefaultStats();

    const stats = JSON.parse(data);
    updateStreak(stats);
    return stats;
  } catch (error) {
    console.error('Failed to load learning stats:', error);
    return getDefaultStats();
  }
}

/**
 * 保存学习统计
 */
function saveLearningStats(stats: LearningStats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

/**
 * 默认统计数据
 */
function getDefaultStats(): LearningStats {
  return {
    totalDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalWords: 0,
    totalPractices: 0,
    totalTexts: 0,
    totalMinutes: 0,
    lastActiveDate: '',
    firstActiveDate: '',
    dailyActivity: {}
  };
}

/**
 * 更新连续学习天数
 */
function updateStreak(stats: LearningStats): void {
  if (!stats.lastActiveDate) return;

  const today = new Date().toISOString().split('T')[0];
  const lastActive = new Date(stats.lastActiveDate);
  const todayDate = new Date(today);

  const diffDays = Math.floor((todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    // 断连了，重置 streak
    stats.currentStreak = 0;
  }
}

/**
 * 记录学习活动
 */
export function recordActivity(type: 'word' | 'practice' | 'text', minutes: number = 0): void {
  const stats = getLearningStats();
  const today = new Date().toISOString().split('T')[0];

  // 初始化今日活动
  if (!stats.dailyActivity[today]) {
    stats.dailyActivity[today] = {
      date: today,
      wordsLearned: 0,
      practicesCompleted: 0,
      textsRead: 0,
      minutesSpent: 0
    };

    // 更新总天数
    stats.totalDays++;

    // 更新首次活跃日期
    if (!stats.firstActiveDate) {
      stats.firstActiveDate = today;
    }

    // 更新连续天数
    if (stats.lastActiveDate) {
      const lastActive = new Date(stats.lastActiveDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        stats.currentStreak++;
        if (stats.currentStreak > stats.longestStreak) {
          stats.longestStreak = stats.currentStreak;
        }
      } else if (diffDays === 0) {
        // 同一天，不变
      } else {
        stats.currentStreak = 1;
      }
    } else {
      stats.currentStreak = 1;
      stats.longestStreak = 1;
    }

    stats.lastActiveDate = today;
  }

  // 更新活动计数
  const activity = stats.dailyActivity[today];

  switch (type) {
    case 'word':
      activity.wordsLearned++;
      stats.totalWords++;
      break;
    case 'practice':
      activity.practicesCompleted++;
      stats.totalPractices++;
      break;
    case 'text':
      activity.textsRead++;
      stats.totalTexts++;
      break;
  }

  activity.minutesSpent += minutes;
  stats.totalMinutes += minutes;

  saveLearningStats(stats);
  checkAchievements();
}

/**
 * 获取最近N天的活动
 */
export function getRecentActivity(days: number = 30): DailyActivity[] {
  const stats = getLearningStats();
  const activities: DailyActivity[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    activities.push(
      stats.dailyActivity[dateStr] || {
        date: dateStr,
        wordsLearned: 0,
        practicesCompleted: 0,
        textsRead: 0,
        minutesSpent: 0
      }
    );
  }

  return activities;
}

/**
 * 成就定义
 */
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first-word',
    title: '初学者',
    description: '保存第一个单词',
    icon: '🌱',
    requirement: 1
  },
  {
    id: 'word-collector-10',
    title: '词汇收集者',
    description: '保存 10 个单词',
    icon: '📚',
    requirement: 10
  },
  {
    id: 'word-master-50',
    title: '词汇大师',
    description: '保存 50 个单词',
    icon: '🎓',
    requirement: 50
  },
  {
    id: 'word-legend-100',
    title: '词汇传奇',
    description: '保存 100 个单词',
    icon: '👑',
    requirement: 100
  },
  {
    id: 'streak-3',
    title: '坚持不懈',
    description: '连续学习 3 天',
    icon: '🔥',
    requirement: 3
  },
  {
    id: 'streak-7',
    title: '一周勇士',
    description: '连续学习 7 天',
    icon: '⚡',
    requirement: 7
  },
  {
    id: 'streak-30',
    title: '月度冠军',
    description: '连续学习 30 天',
    icon: '🏆',
    requirement: 30
  },
  {
    id: 'practice-10',
    title: '练习新手',
    description: '完成 10 次练习',
    icon: '🎯',
    requirement: 10
  },
  {
    id: 'practice-50',
    title: '练习达人',
    description: '完成 50 次练习',
    icon: '🎪',
    requirement: 50
  },
  {
    id: 'reader-5',
    title: '阅读爱好者',
    description: '阅读 5 篇文本',
    icon: '📖',
    requirement: 5
  },
  {
    id: 'reader-20',
    title: '阅读狂人',
    description: '阅读 20 篇文本',
    icon: '📚',
    requirement: 20
  },
  {
    id: 'time-60',
    title: '一小时学者',
    description: '累计学习 60 分钟',
    icon: '⏰',
    requirement: 60
  },
  {
    id: 'time-300',
    title: '五小时大师',
    description: '累计学习 300 分钟',
    icon: '⏳',
    requirement: 300
  }
];

/**
 * 获取成就列表
 */
export function getAchievements(): Achievement[] {
  if (typeof window === 'undefined') {
    return ACHIEVEMENT_DEFINITIONS.map(a => ({ ...a, unlocked: false }));
  }

  try {
    const data = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!data) {
      const achievements = ACHIEVEMENT_DEFINITIONS.map(a => ({ ...a, unlocked: false }));
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
      return achievements;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load achievements:', error);
    return ACHIEVEMENT_DEFINITIONS.map(a => ({ ...a, unlocked: false }));
  }
}

/**
 * 检查并解锁成就
 */
export function checkAchievements(): Achievement[] {
  const stats = getLearningStats();
  const achievements = getAchievements();
  const newlyUnlocked: Achievement[] = [];

  achievements.forEach(achievement => {
    if (achievement.unlocked) return;

    let shouldUnlock = false;

    // 检查解锁条件
    if (achievement.id.startsWith('word-')) {
      shouldUnlock = stats.totalWords >= achievement.requirement;
    } else if (achievement.id.startsWith('streak-')) {
      shouldUnlock = stats.currentStreak >= achievement.requirement;
    } else if (achievement.id.startsWith('practice-')) {
      shouldUnlock = stats.totalPractices >= achievement.requirement;
    } else if (achievement.id.startsWith('reader-')) {
      shouldUnlock = stats.totalTexts >= achievement.requirement;
    } else if (achievement.id.startsWith('time-')) {
      shouldUnlock = stats.totalMinutes >= achievement.requirement;
    }

    if (shouldUnlock) {
      achievement.unlocked = true;
      achievement.unlockedAt = new Date().toISOString();
      newlyUnlocked.push(achievement);

      // 触发成就解锁事件
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('achievement-unlocked', { detail: achievement })
        );
      }
    }
  });

  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
  return newlyUnlocked;
}

/**
 * 获取学习等级
 */
export function getLearningLevel(): { level: number; title: string; progress: number } {
  const stats = getLearningStats();
  const totalPoints = stats.totalWords * 10 + stats.totalPractices * 5 + stats.totalTexts * 20;

  const levels = [
    { level: 1, title: '新手', points: 0 },
    { level: 2, title: '学徒', points: 100 },
    { level: 3, title: '学者', points: 300 },
    { level: 4, title: '专家', points: 600 },
    { level: 5, title: '大师', points: 1000 },
    { level: 6, title: '宗师', points: 1500 },
    { level: 7, title: '传奇', points: 2500 }
  ];

  let currentLevel = levels[0];
  let nextLevel = levels[1];

  for (let i = 0; i < levels.length; i++) {
    if (totalPoints >= levels[i].points) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || levels[i];
    }
  }

  const progress = nextLevel.level === currentLevel.level
    ? 100
    : ((totalPoints - currentLevel.points) / (nextLevel.points - currentLevel.points)) * 100;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    progress: Math.min(progress, 100)
  };
}
