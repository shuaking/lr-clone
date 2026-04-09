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
      saved_words: {
        Row: {
          id: string
          user_id: string
          word: string
          translation: string
          context: string | null
          source: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word: string
          translation: string
          context?: string | null
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word?: string
          translation?: string
          context?: string | null
          source?: string | null
          created_at?: string
        }
      }
      user_texts: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          language: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          language: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          language?: string
          created_at?: string
        }
      }
    }
  }
}
