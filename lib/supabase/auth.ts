import { supabase, isSupabaseConfigured } from './client';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

/**
 * 注册新用户
 */
export async function signUp(email: string, password: string, displayName?: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * 登录
 */
export async function signIn(email: string, password: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * 登出
 */
export async function signOut() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

/**
 * 获取当前用户
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * 获取当前会话
 */
export async function getSession(): Promise<Session | null> {
  if (!supabase) {
    return null;
  }

  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * 监听认证状态变化
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!supabase) {
    return () => {};
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
    callback(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}

/**
 * 重置密码（发送邮件）
 */
export async function resetPassword(email: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw error;
  }
}

/**
 * 更新密码
 */
export async function updatePassword(newPassword: string) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
}

/**
 * 检查用户是否已登录
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}
