-- ============================================
-- Row Level Security (RLS) Policies
-- 确保用户只能访问自己的数据
-- ============================================

-- ============================================
-- 1. Enable RLS on all tables
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_favorites ENABLE ROW LEVEL SECURITY;

-- videos 表是公共的，不需要 RLS
-- ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. Profiles Policies
-- ============================================

-- 用户可以查看自己的 profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 用户可以更新自己的 profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 用户可以插入自己的 profile（注册时）
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 3. Vocabulary Policies
-- ============================================

-- 用户可以查看自己的词汇
CREATE POLICY "Users can view own vocabulary"
  ON public.vocabulary
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以插入自己的词汇
CREATE POLICY "Users can insert own vocabulary"
  ON public.vocabulary
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的词汇
CREATE POLICY "Users can update own vocabulary"
  ON public.vocabulary
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户可以删除自己的词汇
CREATE POLICY "Users can delete own vocabulary"
  ON public.vocabulary
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. Watch History Policies
-- ============================================

-- 用户可以查看自己的观看历史
CREATE POLICY "Users can view own watch history"
  ON public.watch_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以插入自己的观看历史
CREATE POLICY "Users can insert own watch history"
  ON public.watch_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的观看历史
CREATE POLICY "Users can update own watch history"
  ON public.watch_history
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户可以删除自己的观看历史
CREATE POLICY "Users can delete own watch history"
  ON public.watch_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. Learning Stats Policies
-- ============================================

-- 用户可以查看自己的学习统计
CREATE POLICY "Users can view own learning stats"
  ON public.learning_stats
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以插入自己的学习统计
CREATE POLICY "Users can insert own learning stats"
  ON public.learning_stats
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的学习统计
CREATE POLICY "Users can update own learning stats"
  ON public.learning_stats
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. Video Favorites Policies
-- ============================================

-- 用户可以查看自己的收藏
CREATE POLICY "Users can view own favorites"
  ON public.video_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以添加收藏
CREATE POLICY "Users can insert own favorites"
  ON public.video_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以删除收藏
CREATE POLICY "Users can delete own favorites"
  ON public.video_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. Videos Table - Public Read Access
-- ============================================

-- 所有认证用户可以读取视频元数据
CREATE POLICY "Authenticated users can view videos"
  ON public.videos
  FOR SELECT
  TO authenticated
  USING (true);

-- 只有服务角色可以插入/更新视频（通过 API）
CREATE POLICY "Service role can manage videos"
  ON public.videos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 8. Functions for automatic profile creation
-- ============================================

-- 当新用户注册时，自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: 在 auth.users 插入时自动创建 profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
