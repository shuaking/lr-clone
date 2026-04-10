"use client";

import Link from "next/link";
import { useTranslations } from 'next-intl';
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');

  const links = [
    { href: "/#features", label: t('features') },
    { href: "/catalog", label: t('content') },
    { href: "/phrasepump", label: t('phrasepump') },
    { href: "/vocabulary", label: t('vocabulary') },
    { href: "/stats", label: t('stats') },
    { href: "/app", label: t('app') }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 dark:border-white/5 bg-white/80 dark:bg-[#0a0f1b]/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-wide">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/20 text-brand">LR</div>
          <span>{tCommon('appName')}</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-gray-900 dark:hover:text-white">{link.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href="/login" className="hidden text-sm text-muted transition hover:text-gray-900 dark:hover:text-white md:block">{t('login')}</Link>
          <Link href="/app" className="rounded-full border border-gray-300 dark:border-white/10 bg-gray-900 dark:bg-white px-4 py-2 text-sm font-medium text-white dark:text-slate-900 transition hover:opacity-90">{t('openApp')}</Link>
        </div>
      </div>
    </header>
  );
}
