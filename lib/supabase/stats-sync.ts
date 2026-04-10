import { supabase, isSupabaseConfigured } from './client';
import type { LearningStats, DailyActivity } from '@/lib/learning-stats';

export interface CloudDailyStats {
  id: string;
  user_id: string;
  date: string;
  study_duration: number; // seconds
  words_saved: number;
  videos_watched: number;
  words_reviewed: number;
  created_at: string;
  updated_at: string;
}

/**
 * 获取云端学习统计
 */
export async function getCloudStats(): Promise<LearningStats> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('learning_stats')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    throw error;
  }

  return aggregateCloudStats(data || []);
}

/**
 * 保存每日统计到云端
 */
export async function saveDailyStatsToCloud(activity: DailyActivity): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // 使用 upsert 避免重复
  const { error } = await supabase
    .from('learning_stats')
    .upsert({
      user_id: user.id,
      date: activity.date,
      study_duration: activity.minutesSpent * 60, // 转换为秒
      words_saved: activity.wordsLearned,
      videos_watched: activity.textsRead, // 映射 textsRead 到 videos_watched
      words_reviewed: activity.practicesCompleted, // 映射 practicesCompleted 到 words_reviewed
    }, {
      onConflict: 'user_id,date'
    });

  if (error) {
    throw error;
  }
}

/**
 * 批量上传统计数据（用于数据迁移）
 */
export async function batchUploadStats(dailyActivity: Record<string, DailyActivity>): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const cloudStats = Object.values(dailyActivity).map(activity => ({
    user_id: user.id,
    date: activity.date,
    study_duration: activity.minutesSpent * 60,
    words_saved: activity.wordsLearned,
    videos_watched: activity.textsRead,
    words_reviewed: activity.practicesCompleted,
  }));

  if (cloudStats.length === 0) return;

  const { error } = await supabase
    .from('learning_stats')
    .upsert(cloudStats, {
      onConflict: 'user_id,date'
    });

  if (error) {
    throw error;
  }
}

/**
 * 获取最近N天的云端统计
 */
export async function getRecentCloudStats(days: number = 30): Promise<DailyActivity[]> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('learning_stats')
    .select('*')
    .gte('date', startDateStr)
    .order('date', { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []).map(cloudToLocalActivity);
}

/**
 * 聚合云端统计数据为本地格式
 */
function aggregateCloudStats(cloudStats: CloudDailyStats[]): LearningStats {
  const dailyActivity: Record<string, DailyActivity> = {};
  let totalWords = 0;
  let totalPractices = 0;
  let totalTexts = 0;
  let totalMinutes = 0;
  let firstActiveDate = '';
  let lastActiveDate = '';

  cloudStats.forEach(stat => {
    const activity: DailyActivity = {
      date: stat.date,
      wordsLearned: stat.words_saved,
      practicesCompleted: stat.words_reviewed,
      textsRead: stat.videos_watched,
      minutesSpent: Math.round(stat.study_duration / 60),
    };

    dailyActivity[stat.date] = activity;

    totalWords += stat.words_saved;
    totalPractices += stat.words_reviewed;
    totalTexts += stat.videos_watched;
    totalMinutes += Math.round(stat.study_duration / 60);

    if (!firstActiveDate || stat.date < firstActiveDate) {
      firstActiveDate = stat.date;
    }
    if (!lastActiveDate || stat.date > lastActiveDate) {
      lastActiveDate = stat.date;
    }
  });

  // 计算连续天数
  const { currentStreak, longestStreak } = calculateStreaks(Object.keys(dailyActivity).sort());

  return {
    totalDays: Object.keys(dailyActivity).length,
    currentStreak,
    longestStreak,
    totalWords,
    totalPractices,
    totalTexts,
    totalMinutes,
    lastActiveDate,
    firstActiveDate,
    dailyActivity,
  };
}

/**
 * 计算连续天数
 */
function calculateStreaks(sortedDates: string[]): { currentStreak: number; longestStreak: number } {
  if (sortedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = new Date().toISOString().split('T')[0];
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const currentDate = new Date(sortedDates[i]);
    const nextDate = i < sortedDates.length - 1 ? new Date(sortedDates[i + 1]) : null;

    if (nextDate) {
      const diffDays = Math.floor((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    // 计算当前连续天数
    if (i === sortedDates.length - 1) {
      const lastDate = new Date(sortedDates[i]);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        currentStreak = tempStreak;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return { currentStreak, longestStreak };
}

/**
 * 转换云端格式到本地格式
 */
function cloudToLocalActivity(cloud: CloudDailyStats): DailyActivity {
  return {
    date: cloud.date,
    wordsLearned: cloud.words_saved,
    practicesCompleted: cloud.words_reviewed,
    textsRead: cloud.videos_watched,
    minutesSpent: Math.round(cloud.study_duration / 60),
  };
}
