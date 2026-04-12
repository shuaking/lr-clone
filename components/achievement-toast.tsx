"use client";

import { useEffect, useState } from "react";
import { Achievement } from "@/lib/learning-stats";
import { Trophy, X } from "lucide-react";

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // 延迟显示动画
    timers.push(setTimeout(() => setIsVisible(true), 100));

    // 5秒后自动关闭
    timers.push(setTimeout(() => {
      setIsVisible(false);
      timers.push(setTimeout(onClose, 300));
    }, 5000));

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-80 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
    >
      <div className="panel overflow-hidden border-brand/50 bg-gradient-to-br from-brand/20 to-accent/20 p-5 shadow-2xl">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/30 text-2xl">
              {achievement.icon}
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <Trophy size={16} className="text-brand" />
                <span className="text-xs font-semibold uppercase tracking-wide text-brand">
                  成就解锁
                </span>
              </div>
              <h4 className="font-semibold text-white">{achievement.title}</h4>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="rounded-lg p-1 transition hover:bg-white/10"
          >
            <X size={16} className="text-muted" />
          </button>
        </div>

        <p className="text-sm text-slate-300">{achievement.description}</p>

        {/* 进度条动画 */}
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-brand to-accent"
            style={{
              animation: 'progress 5s linear',
              width: '100%'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

export function AchievementNotifications() {
  const [notifications, setNotifications] = useState<Achievement[]>([]);

  useEffect(() => {
    // 监听成就解锁事件
    const handleAchievement = (event: CustomEvent<Achievement>) => {
      setNotifications(prev => [...prev, event.detail]);
    };

    window.addEventListener('achievement-unlocked' as any, handleAchievement);

    return () => {
      window.removeEventListener('achievement-unlocked' as any, handleAchievement);
    };
  }, []);

  const handleClose = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {notifications.map((achievement, index) => (
        <AchievementToast
          key={`${achievement.id}-${index}`}
          achievement={achievement}
          onClose={() => handleClose(index)}
        />
      ))}
    </>
  );
}
