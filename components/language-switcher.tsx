"use client";

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/i18n';
import { Globe } from 'lucide-react';
import { useState } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const switchLocale = (newLocale: Locale) => {
    // 移除当前语言前缀，添加新语言前缀
    const pathnameWithoutLocale = pathname.replace(/^\/(zh|en|ja)/, '');
    const newPath = `/${newLocale}${pathnameWithoutLocale}`;
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm transition hover:bg-white/10"
        aria-label="切换语言"
      >
        <Globe size={16} />
        <span>{localeNames[locale]}</span>
      </button>

      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 下拉菜单 */}
          <div className="absolute right-0 top-full z-50 mt-2 min-w-[140px] rounded-xl border border-white/10 bg-[#0a0f1a] p-1 shadow-xl">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  loc === locale
                    ? 'bg-brand text-white'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {localeNames[loc]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
