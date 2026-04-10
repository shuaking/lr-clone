import { supabase, isSupabaseConfigured } from './client';
import type { SavedVocabulary } from '@/lib/vocabulary-storage';

export interface CloudVocabulary {
  id: string;
  user_id: string;
  word: string;
  translation: string;
  context: string;
  video_id: string;
  timestamp: number;
  notes?: string;
  mastery_level: number;
  next_review_at?: string;
  review_count: number;
  saved_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * 获取用户的所有词汇（从云端）
 */
export async function getCloudVocabulary(): Promise<SavedVocabulary[]> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('vocabulary')
    .select('*')
    .order('saved_at', { ascending: false });

  if (error) {
    throw error;
  }

  // 转换为本地格式
  return (data || []).map(cloudToLocal);
}

/**
 * 保存词汇到云端
 */
export async function saveCloudVocabulary(
  item: Omit<SavedVocabulary, 'id' | 'savedAt'>
): Promise<SavedVocabulary> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('vocabulary')
    .insert({
      user_id: user.id,
      word: item.word,
      translation: item.translation,
      context: item.context,
      video_id: item.videoId,
      timestamp: item.timestamp,
      mastery_level: 0,
      review_count: 0,
      saved_at: now,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return cloudToLocal(data);
}

/**
 * 删除云端词汇
 */
export async function removeCloudVocabulary(id: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('vocabulary')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

/**
 * 批量上传词汇到云端（用于数据迁移）
 */
export async function batchUploadVocabulary(items: SavedVocabulary[]): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const cloudItems = items.map(item => ({
    user_id: user.id,
    word: item.word,
    translation: item.translation,
    context: item.context,
    video_id: item.videoId,
    timestamp: item.timestamp,
    mastery_level: 0,
    review_count: 0,
    saved_at: new Date(item.savedAt).toISOString(),
  }));

  const { error } = await supabase
    .from('vocabulary')
    .insert(cloudItems);

  if (error) {
    throw error;
  }
}

/**
 * 检查单词是否已保存（云端）
 */
export async function isWordSavedInCloud(word: string, videoId: string): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('vocabulary')
    .select('id')
    .ilike('word', word)
    .eq('video_id', videoId)
    .limit(1);

  if (error) {
    throw error;
  }

  return (data?.length || 0) > 0;
}

/**
 * 按视频 ID 获取词汇（云端）
 */
export async function getCloudVocabularyByVideo(videoId: string): Promise<SavedVocabulary[]> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('vocabulary')
    .select('*')
    .eq('video_id', videoId)
    .order('saved_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map(cloudToLocal);
}

/**
 * 转换云端格式到本地格式
 */
function cloudToLocal(cloud: CloudVocabulary): SavedVocabulary {
  return {
    id: cloud.id,
    word: cloud.word,
    translation: cloud.translation,
    context: cloud.context,
    videoId: cloud.video_id,
    timestamp: cloud.timestamp,
    savedAt: new Date(cloud.saved_at).getTime(),
  };
}
