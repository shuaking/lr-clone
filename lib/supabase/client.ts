import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 检查是否配置了 Supabase（Phase 2）
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// 创建 Supabase 客户端（仅在配置后可用）
export const supabase = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : (null as any);

// 类型导出
export type SupabaseClient = ReturnType<typeof createClient<Database>>;
