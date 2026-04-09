import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { toast } from 'sonner';

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  context: string;
  videoId: string;
  timestamp: number;
  notes?: string;
  masteryLevel?: number;
  nextReviewAt?: string;
  reviewCount?: number;
  savedAt: number;
}

interface VocabularyState {
  vocabulary: VocabularyItem[];
  loading: boolean;
  syncing: boolean;

  // Actions
  loadVocabulary: () => Promise<void>;
  saveWord: (item: Omit<VocabularyItem, 'id' | 'savedAt'>) => Promise<VocabularyItem>;
  removeWord: (id: string) => Promise<void>;
  updateWord: (id: string, updates: Partial<VocabularyItem>) => Promise<void>;
  isWordSaved: (word: string, videoId: string) => boolean;
  syncToCloud: () => Promise<void>;
  getVocabulary: () => VocabularyItem[];
}

export const useVocabularyStore = create<VocabularyState>()(
  persist(
    (set, get) => ({
      vocabulary: [],
      loading: false,
      syncing: false,

      loadVocabulary: async () => {
        set({ loading: true });

        try {
          // 如果配置了 Supabase，从云端加载
          if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase
              .from('vocabulary')
              .select('*')
              .order('saved_at', { ascending: false });

            if (error) throw error;

            const vocabulary = (data || []).map((item: any) => ({
              id: item.id,
              word: item.word,
              translation: item.translation,
              context: item.context,
              videoId: item.video_id,
              timestamp: item.timestamp,
              notes: item.notes || undefined,
              masteryLevel: item.mastery_level || 0,
              nextReviewAt: item.next_review_at || undefined,
              reviewCount: item.review_count || 0,
              savedAt: new Date(item.saved_at).getTime(),
            }));

            set({ vocabulary, loading: false });
          } else {
            // Phase 1: 从 localStorage 加载（已通过 persist 中间件处理）
            set({ loading: false });
          }
        } catch (error) {
          console.error('Failed to load vocabulary:', error);
          set({ loading: false });
          toast.error('加载词汇失败');
        }
      },

      saveWord: async (item) => {
        const newItem: VocabularyItem = {
          ...item,
          id: `${item.videoId}-${item.word}-${Date.now()}`,
          savedAt: Date.now(),
        };

        try {
          // 如果配置了 Supabase，保存到云端
          if (isSupabaseConfigured && supabase) {
            const { data, error } = await supabase
              .from('vocabulary')
              .insert({
                word: newItem.word,
                translation: newItem.translation,
                context: newItem.context,
                video_id: newItem.videoId,
                timestamp: newItem.timestamp,
                notes: newItem.notes,
              })
              .select()
              .single();

            if (error) throw error;

            if (data) {
              newItem.id = (data as any).id;
            }
          }

          // 更新本地状态
          set((state) => ({
            vocabulary: [newItem, ...state.vocabulary],
          }));

          return newItem;
        } catch (error) {
          console.error('Failed to save word:', error);

          if (error instanceof Error) {
            if (error.message.includes('quota')) {
              throw new Error('STORAGE_QUOTA_EXCEEDED');
            } else if (error.message.includes('disabled')) {
              throw new Error('STORAGE_DISABLED');
            }
          }

          throw new Error('STORAGE_UNKNOWN_ERROR');
        }
      },

      removeWord: async (id) => {
        try {
          // 如果配置了 Supabase，从云端删除
          if (isSupabaseConfigured && supabase) {
            const { error } = await supabase
              .from('vocabulary')
              .delete()
              .eq('id', id);

            if (error) throw error;
          }

          // 更新本地状态
          set((state) => ({
            vocabulary: state.vocabulary.filter((item) => item.id !== id),
          }));
        } catch (error) {
          console.error('Failed to remove word:', error);
          toast.error('删除失败');
          throw error;
        }
      },

      updateWord: async (id, updates) => {
        try {
          // 如果配置了 Supabase，更新云端
          if (isSupabaseConfigured && supabase) {
            const { error } = await supabase
              .from('vocabulary')
              .update({
                notes: updates.notes,
                mastery_level: updates.masteryLevel,
                next_review_at: updates.nextReviewAt,
                review_count: updates.reviewCount,
              })
              .eq('id', id);

            if (error) throw error;
          }

          // 更新本地状态
          set((state) => ({
            vocabulary: state.vocabulary.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
          }));
        } catch (error) {
          console.error('Failed to update word:', error);
          toast.error('更新失败');
          throw error;
        }
      },

      isWordSaved: (word, videoId) => {
        const { vocabulary } = get();
        return vocabulary.some(
          (item) => item.word === word && item.videoId === videoId
        );
      },

      syncToCloud: async () => {
        if (!isSupabaseConfigured || !supabase) {
          toast.error('未配置云端同步');
          return;
        }

        set({ syncing: true });

        try {
          const { vocabulary } = get();

          // 批量上传本地词汇到云端
          const { error } = await supabase.from('vocabulary').upsert(
            vocabulary.map((item) => ({
              id: item.id,
              word: item.word,
              translation: item.translation,
              context: item.context,
              video_id: item.videoId,
              timestamp: item.timestamp,
              notes: item.notes,
              mastery_level: item.masteryLevel || 0,
              next_review_at: item.nextReviewAt,
              review_count: item.reviewCount || 0,
              saved_at: new Date(item.savedAt).toISOString(),
            }))
          );

          if (error) throw error;

          set({ syncing: false });
          toast.success('同步成功');
        } catch (error) {
          console.error('Failed to sync:', error);
          set({ syncing: false });
          toast.error('同步失败');
        }
      },

      getVocabulary: () => {
        return get().vocabulary;
      },
    }),
    {
      name: 'vocabulary-storage',
      partialize: (state) => ({ vocabulary: state.vocabulary }),
    }
  )
);
