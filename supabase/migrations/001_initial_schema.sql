-- ============================================
-- Language Reactor Clone - Database Schema
-- Phase 2: User System + Cloud Storage
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Users Table (扩展 Supabase Auth)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  native_language TEXT DEFAULT 'zh',
  learning_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Vocabulary Table (词汇表)
-- ============================================
CREATE TABLE public.vocabulary (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  context TEXT NOT NULL,
  video_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  notes TEXT,
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
  next_review_at TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_vocabulary_user_id ON public.vocabulary(user_id);
CREATE INDEX idx_vocabulary_word ON public.vocabulary(user_id, word);
CREATE INDEX idx_vocabulary_next_review ON public.vocabulary(user_id, next_review_at);

-- ============================================
-- 3. Videos Table (视频元数据)
-- ============================================
CREATE TABLE public.videos (
  id TEXT PRIMARY KEY, -- YouTube video ID
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- seconds
  channel_name TEXT,
  language TEXT DEFAULT 'en',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Watch History (观看历史)
-- ============================================
CREATE TABLE public.watch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  video_id TEXT REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX idx_watch_history_user_id ON public.watch_history(user_id);
CREATE INDEX idx_watch_history_last_watched ON public.watch_history(user_id, last_watched_at DESC);

-- ============================================
-- 5. Learning Stats (学习统计)
-- ============================================
CREATE TABLE public.learning_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  study_duration INTEGER DEFAULT 0, -- seconds
  words_saved INTEGER DEFAULT 0,
  videos_watched INTEGER DEFAULT 0,
  words_reviewed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_learning_stats_user_date ON public.learning_stats(user_id, date DESC);

-- ============================================
-- 6. Video Favorites (收藏视频)
-- ============================================
CREATE TABLE public.video_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  video_id TEXT REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

CREATE INDEX idx_video_favorites_user_id ON public.video_favorites(user_id);

-- ============================================
-- Triggers: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocabulary_updated_at BEFORE UPDATE ON public.vocabulary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watch_history_updated_at BEFORE UPDATE ON public.watch_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_stats_updated_at BEFORE UPDATE ON public.learning_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
