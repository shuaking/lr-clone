"use client";

import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdminVideoManager } from "@/components/admin-video-manager";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authStatus = sessionStorage.getItem("admin_auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin") {
      sessionStorage.setItem("admin_auth", "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("密码错误");
      setPassword("");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
    setPassword("");
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className={isAuthenticated ? "container py-12" : "container flex min-h-[calc(100vh-200px)] items-center justify-center py-12"}>
        {!isAuthenticated ? (
          <div className="w-full max-w-md">
            <div className="panel p-8">
              <h1 className="mb-6 text-center text-2xl font-semibold">管理员登录</h1>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm text-muted">
                    密码
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="请输入管理员密码"
                    autoFocus
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-400">{error}</p>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full rounded-2xl bg-brand px-6 py-3 font-medium text-white transition hover:bg-brand/90"
                >
                  登录
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-semibold">视频管理</h1>
                <p className="mt-2 text-muted">添加和管理 YouTube 学习视频</p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-2 text-sm transition hover:bg-white/10"
              >
                退出登录
              </button>
            </div>

            <AdminVideoManager />
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
