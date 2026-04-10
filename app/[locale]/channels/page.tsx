"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChannelBrowser } from "@/components/channel-browser";

export default function ChannelsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container py-8">
        {/* 头部 */}
        <div className="mb-8">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-muted hover:text-ink transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回内容目录
          </Link>
          <h1 className="text-3xl font-bold text-ink mb-2">YouTube 频道浏览</h1>
          <p className="text-muted">
            发现优质学习频道，根据你的语言对和难度筛选
          </p>
        </div>

        {/* 频道浏览器 */}
        <ChannelBrowser />
      </div>
    </main>
  );
}
