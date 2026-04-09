"use client";

import { useState } from "react";
import { useVocabularyStore } from "@/lib/stores/vocabulary-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { toast } from "sonner";
import { getSavedVocabulary } from "@/lib/vocabulary-storage";

export function DataMigrationTool() {
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);
  const { syncToCloud } = useVocabularyStore();
  const { user } = useAuthStore();

  const handleMigrate = async () => {
    if (!user) {
      toast.error("请先登录");
      return;
    }

    if (!isSupabaseConfigured) {
      toast.error("未配置 Supabase");
      return;
    }

    setMigrating(true);

    try {
      // 1. 从 localStorage 读取旧数据
      const localVocabulary = getSavedVocabulary();

      if (localVocabulary.length === 0) {
        toast.info("没有需要迁移的数据");
        setMigrating(false);
        return;
      }

      // 2. 同步到云端
      await syncToCloud();

      // 3. 标记迁移完成
      localStorage.setItem("data-migrated", "true");
      setMigrated(true);

      toast.success(`成功迁移 ${localVocabulary.length} 个单词到云端`);
    } catch (error) {
      console.error("Migration failed:", error);
      toast.error("迁移失败，请重试");
    } finally {
      setMigrating(false);
    }
  };

  // 检查是否已迁移
  const alreadyMigrated = typeof window !== "undefined" && localStorage.getItem("data-migrated") === "true";

  if (!isSupabaseConfigured) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (alreadyMigrated || migrated) {
    return (
      <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
        <p className="text-sm text-green-400">✅ 数据已迁移到云端</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-brand/10 border border-brand/20 p-4">
      <h3 className="text-lg font-semibold text-white mb-2">数据迁移</h3>
      <p className="text-sm text-slate-300 mb-4">
        检测到本地存储的词汇数据，是否迁移到云端？迁移后可在多设备同步。
      </p>
      <button
        onClick={handleMigrate}
        disabled={migrating}
        className="px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg transition disabled:opacity-50"
      >
        {migrating ? "迁移中..." : "立即迁移"}
      </button>
    </div>
  );
}
