export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          native_language: string
          learning_language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          native_language?: string
          learning_language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          native_language?: string
          learning_language?: string
          created_at?: string
          updated_at?: string
        }
      }
      vocabulary: {
        Row: {
          id: string
          user_id: string
          word: string
          translation: string
          context: string
          video_id: string
          timestamp: number
          notes: string | null
          mastery_level: number
          next_review_at: string | null
          review_count: number
          saved_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          word: string
          translation: string
          context: string
          video_id: string
          timestamp: number
          notes?: string | null
          mastery_level?: number
          next_review_at?: string | null
          review_count?: number
          saved_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word?: string
          translation?: string
          context?: string
          video_id?: string
          timestamp?: number
          notes?: string | null
          mastery_level?: number
          next_review_at?: string | null
          review_count?: number
          saved_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          thumbnail_url: string | null
          duration: number | null
          channel_name: string | null
          language: string
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          thumbnail_url?: string | null
          duration?: number | null
          channel_name?: string | null
          language?: string
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          thumbnail_url?: string | null
          duration?: number | null
          channel_name?: string | null
          language?: string
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      watch_history: {
        Row: {
          id: string
          user_id: string
          video_id: string
          progress: number
          last_watched_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          video_id: string
          progress?: number
          last_watched_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          progress?: number
          last_watched_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      learning_stats: {
        Row: {
          id: string
          user_id: string
          date: string
          study_duration: number
          words_saved: number
          videos_watched: number
          words_reviewed: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          date: string
          study_duration?: number
          words_saved?: number
          videos_watched?: number
          words_reviewed?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          study_duration?: number
          words_saved?: number
          videos_watched?: number
          words_reviewed?: number
          created_at?: string
          updated_at?: string
        }
      }
      video_favorites: {
        Row: {
          id: string
          user_id: string
          video_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          video_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_id?: string
          created_at?: string
        }
      }
    }
  }
}
