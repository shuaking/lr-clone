"use client";

import { useEffect, useState } from "react";
import { getLearningStats, getRecentActivity, getLearningLevel } from "@/lib/learning-stats";
import { TrendingUp, BookOpen, Target, Clock, Award, Flame } from "lucide-react";

export function StatsOverview() {
  const [stats, setStats] = useState(getLearningStats());
  const [level, setLevel] = useState(getLearningLevel());
  const [recentActivity, setRecentActivity] = useState(getRecentActivity(7));

  useEffect(() => {
    setStats(getLearningStats());
    setLevel(getLearningLevel());
    setRecentActivity(getRecentActivity(7));
  }, []);

  const statCards = [
    {
      icon: Flame,
      label: "连续学习",
      value: stats.currentStreak,
      unit: "天",
      color: "text-orange-400",
      bgColor: "bg-orange-500/20"
    },
    {
      icon: BookOpen,
      label: "保存单词",
      value: stats.totalWords,
      unit: "个",
      color: "text-brand",
      bgColor: "bg-brand/20"
    },
    {
      icon: Target,
      label: "完成练习",
      value: stats.totalPractices,
      unit: "次",
      color: "text-accent",
      bgColor: "bg-accent/20"
    },
    {
      icon: Clock,
      label: "学习时长",
      value: Math.floor(stats.totalMinutes / 60),
      unit: "小时",
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    }
  ];

  const maxActivity = Math.max(...recentActivity.map(a => a.wordsLearned + a.practicesCompleted), 1);

  return (
    <div className="space-y-6">
      {/* 等级进度 */}
      <div className="panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold">等级 {level.level}</h3>
            <p className="text-sm text-muted">{level.title}</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/20">
            <Award className="text-brand" size={32} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">升级进度</span>
            <span className="font-semibold">{Math.round(level.progress)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full bg-gradient-to-r from-brand to-accent transition-all duration-500"
              style={{ width: `${level.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted">{card.label}</p>
              <div className={`rounded-xl ${card.bgColor} p-2`}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-semibold">{card.value}</p>
              <p className="text-sm text-muted">{card.unit}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 最近7天活动 */}
      <div className="panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">最近7天活动</h3>
          <TrendingUp size={20} className="text-brand" />
        </div>

        <div className="flex items-end justify-between gap-2">
          {recentActivity.map((activity, index) => {
            const total = activity.wordsLearned + activity.practicesCompleted;
            const height = total > 0 ? (total / maxActivity) * 100 : 5;
            const date = new Date(activity.date);
            const dayName = date.toLocaleDateString('zh-CN', { weekday: 'short' });

            return (
              <div key={activity.date} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative w-full">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      total > 0 ? 'bg-brand' : 'bg-white/5'
                    }`}
                    style={{ height: `${Math.max(height, 20)}px` }}
                    title={`${activity.wordsLearned} 单词, ${activity.practicesCompleted} 练习`}
                  />
                </div>
                <p className="text-xs text-muted">{dayName}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-brand" />
            <span>有活动</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-white/5" />
            <span>无活动</span>
          </div>
        </div>
      </div>

      {/* 里程碑 */}
      <div className="panel p-6">
        <h3 className="mb-4 text-lg font-semibold">学习里程碑</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
            <div>
              <p className="font-medium">总学习天数</p>
              <p className="text-sm text-muted">持续进步中</p>
            </div>
            <p className="text-2xl font-semibold text-brand">{stats.totalDays}</p>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
            <div>
              <p className="font-medium">最长连续</p>
              <p className="text-sm text-muted">保持记录</p>
            </div>
            <p className="text-2xl font-semibold text-orange-400">{stats.longestStreak}</p>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
            <div>
              <p className="font-medium">阅读文本</p>
              <p className="text-sm text-muted">知识积累</p>
            </div>
            <p className="text-2xl font-semibold text-accent">{stats.totalTexts}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
