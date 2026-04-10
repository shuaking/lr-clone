"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, register, loading } = useAuthStore();
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "请输入邮箱";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }

    if (!password) {
      newErrors.password = "请输入密码";
    } else if (password.length < 6) {
      newErrors.password = "密码至少需要 6 个字符";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isRegister) {
        await register(email, password, displayName || undefined);
        toast.success("注册成功！请查收验证邮件");
        router.push("/app");
      } else {
        await login(email, password);
        toast.success("登录成功");
        router.push("/app");
      }
    } catch (error: any) {
      console.error("Auth error:", error);

      if (error.message?.includes("Invalid login credentials")) {
        toast.error("邮箱或密码错误");
      } else if (error.message?.includes("Email not confirmed")) {
        toast.error("请先验证邮箱");
      } else if (error.message?.includes("User already registered")) {
        toast.error("该邮箱已注册");
      } else {
        toast.error(isRegister ? "注册失败" : "登录失败");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1e] to-[#1a1f3a] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#11182b] rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isRegister ? "创建账号" : "欢迎回来"}
            </h1>
            <p className="text-muted">
              {isRegister ? "开始你的语言学习之旅" : "登录以同步你的学习数据"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-slate-300 mb-2">
                  昵称（可选）
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="你的昵称"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                邮箱 *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                required
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                密码 *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                required
                minLength={6}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-white/10'
                }`}
                placeholder="至少 6 个字符"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand hover:bg-brand/90 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "处理中..." : isRegister ? "注册" : "登录"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-brand hover:text-brand/80 text-sm transition"
            >
              {isRegister ? "已有账号？立即登录" : "没有账号？立即注册"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <Link href="/" className="text-sm text-muted hover:text-white transition">
              返回首页
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
          <p>Phase 1 用户数据将自动迁移到云端</p>
        </div>
      </div>
    </div>
  );
}
