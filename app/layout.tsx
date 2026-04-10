import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AchievementNotifications } from "@/components/achievement-toast";
import { AxeDevTools } from "@/components/axe-dev-tools";
import { SkipToContent } from "@/components/skip-to-content";
import { DataMigrationTool } from "@/components/data-migration-tool";
import { AuthInitializer } from "@/components/auth-initializer";
import { ThemeInitializer } from "@/components/theme-initializer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Language Reactor Clone",
  description: "A near-match starter shell inspired by a language-learning web app.",
  manifest: "/manifest.json",
  themeColor: "#7c9cff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LR Clone",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>
        <AuthInitializer />
        <ThemeInitializer />
        <SkipToContent />
        {children}
        <Toaster position="top-center" richColors />
        <AchievementNotifications />
        <DataMigrationTool />
        <AxeDevTools />
      </body>
    </html>
  );
}
