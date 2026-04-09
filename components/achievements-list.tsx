"use client";

import { useEffect, useState } from "react";
import { getAchievements, Achievement } from "@/lib/learning-stats";
import { Lock } from "lucide-react";

export function AchievementsList() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    setAchievements(getAchievements());
  }, []);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = (unlockedCount / totalCount) * 100;

  return (
    <div className="space-y-6">
      {/* 进度概览 */}
      <div className="panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold">成就收集</h3>
            <p className="text-sm text-muted">
              已解锁 {unlockedCount} / {totalCount}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold text-brand">{Math.round(progress)}%</p>
            <p className="text-xs text-muted">完成度</p>
          </div>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-brand to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 成就列表 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`panel p-5 transition ${
              achievement.unlocked
                ? 'border-brand/30 bg-brand/5'
                : 'opacity-60'
            }`}
          >
            <div className="mb-3 flex items-start justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
                  achievement.unlocked
                    ? 'bg-brand/20'
                    : 'bg-white/5'
                }`}
              >
                {achievement.unlocked ? achievement.icon : <Lock size={20} className="text-muted" />}
              </div>
              {achievement.unlocked && achievement.unlockedAt && (
                <span className="rounded-full bg-accent/20 px-2 py-1 text-xs text-accent">
                  已解锁
                </span>
              )}
            </div>

            <h4 className="mb-1 font-semibold">{achievement.title}</h4>
            <p className="mb-2 text-sm text-muted">{achievement.description}</p>

            {achievement.unlocked && achievement.unlockedAt && (
              <p className="text-xs text-muted">
                {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
