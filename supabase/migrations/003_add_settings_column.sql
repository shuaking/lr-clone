-- ============================================
-- Add settings column to profiles table
-- Stores user preferences (player settings, UI preferences, etc.)
-- ============================================

ALTER TABLE public.profiles
ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;

-- Index for faster settings queries
CREATE INDEX idx_profiles_settings ON public.profiles USING gin(settings);

-- Comment
COMMENT ON COLUMN public.profiles.settings IS 'User preferences and settings stored as JSON';
