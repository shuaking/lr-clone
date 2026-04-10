import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { Toaster } from "sonner";
import { AchievementNotifications } from "@/components/achievement-toast";
import { AxeDevTools } from "@/components/axe-dev-tools";
import { SkipToContent } from "@/components/skip-to-content";
import { DataMigrationTool } from "@/components/data-migration-tool";
import { AuthInitializer } from "@/components/auth-initializer";
import { ThemeInitializer } from "@/components/theme-initializer";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 验证 locale 是否有效
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // 获取翻译消息
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme-storage');
                  if (stored) {
                    var data = JSON.parse(stored);
                    var theme = data.state.theme;
                    var resolved = theme === 'system'
                      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                      : theme;
                    document.documentElement.classList.add(resolved);
                  } else {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthInitializer />
          <ThemeInitializer />
          <SkipToContent />
          {children}
          <Toaster position="top-center" richColors />
          <AchievementNotifications />
          <DataMigrationTool />
          <AxeDevTools />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
