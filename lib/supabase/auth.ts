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

// 本地存储的用户数据结构
interface LocalUser {
  id: string;
  email: string;
  password: string; // 注意：实际生产环境应该加密
  displayName?: string;
  createdAt: string;
}

// 本地存储键
const LOCAL_USERS_KEY = 'lr-local-users';
const LOCAL_SESSION_KEY = 'lr-local-session';

/**
 * 本地存储辅助函数
 */
function getLocalUsers(): LocalUser[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(LOCAL_USERS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLocalUsers(users: LocalUser[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function getLocalSession(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(LOCAL_SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

function saveLocalSession(user: User | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
    // 同时设置 cookie 供中间件使用
    document.cookie = `auth-storage=${encodeURIComponent(JSON.stringify({ state: { user } }))}; path=/; max-age=2592000`; // 30 days
  } else {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    // 清除 cookie
    document.cookie = 'auth-storage=; path=/; max-age=0';
  }
}

/**
 * 注册新用户
 */
export async function signUp(email: string, password: string, displayName?: string) {
  if (!isSupabaseConfigured) {
    // 本地注册 fallback
    const users = getLocalUsers();

    // 检查邮箱是否已存在
    if (users.some(u => u.email === email)) {
      throw new Error('User already registered');
    }

    const newUser: LocalUser = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email,
      password, // 注意：实际应该加密
      displayName,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveLocalUsers(users);

    const user: User = {
      id: newUser.id,
      email: newUser.email,
      app_metadata: {},
      user_metadata: { display_name: displayName },
      aud: 'authenticated',
      created_at: newUser.createdAt,
    } as User;

    saveLocalSession(user);

    return { user, session: null };
  }

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
  if (!isSupabaseConfigured) {
    // 本地登录 fallback
    const users = getLocalUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid login credentials');
    }

    const authUser: User = {
      id: user.id,
      email: user.email,
      app_metadata: {},
      user_metadata: { display_name: user.displayName },
      aud: 'authenticated',
      created_at: user.createdAt,
    } as User;

    saveLocalSession(authUser);

    return { user: authUser, session: null };
  }

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
  if (!isSupabaseConfigured) {
    // 本地登出 fallback
    saveLocalSession(null);
    return;
  }

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
  if (!isSupabaseConfigured) {
    // 本地获取用户 fallback
    return getLocalSession();
  }

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
  if (!isSupabaseConfigured) {
    // 本地会话 fallback
    const user = getLocalSession();
    return user ? ({ user } as Session) : null;
  }

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
  if (!isSupabaseConfigured) {
    // 本地模式不支持实时监听
    return () => {};
  }

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
  if (!isSupabaseConfigured) {
    throw new Error('Password reset not available in local mode');
  }

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
  if (!isSupabaseConfigured) {
    throw new Error('Password update not available in local mode');
  }

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
