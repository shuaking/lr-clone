import { supabase, isSupabaseConfigured } from './client';
import type { PlayerSettings } from '@/lib/stores/player-settings-store';

/**
 * 获取云端设置
 */
export async function getCloudSettings(): Promise<Partial<PlayerSettings> | null> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('settings')
    .eq('id', user.id)
    .single();

  if (error) {
    throw error;
  }

  return (data?.settings as Partial<PlayerSettings>) || null;
}

/**
 * 保存设置到云端
 */
export async function saveCloudSettings(settings: Partial<PlayerSettings>): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // 转换 Set 为 Array 以便存储
  const settingsToSave = {
    ...settings,
    knownSentences: settings.knownSentences
      ? Array.from(settings.knownSentences)
      : undefined,
  };

  const { error } = await supabase
    .from('profiles')
    .update({ settings: settingsToSave as any })
    .eq('id', user.id);

  if (error) {
    throw error;
  }
}

/**
 * 合并本地设置到云端（用于数据迁移）
 */
export async function mergeLocalSettingsToCloud(localSettings: PlayerSettings): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  // 获取云端现有设置
  const cloudSettings = await getCloudSettings();

  // 合并设置（本地优先）
  const mergedSettings: Partial<PlayerSettings> = {
    ...cloudSettings,
    ...localSettings,
  };

  await saveCloudSettings(mergedSettings);
}
