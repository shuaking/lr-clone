import Link from "next/link";
const links = [
  { href: "/#features", label: "Features" },
  { href: "/catalog", label: "Content" },
  { href: "/phrasepump", label: "PhrasePump" },
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/stats", label: "Stats" },
  { href: "/app", label: "App" }
];
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0f1b]/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-wide">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/20 text-brand">LR</div>
          <span>Language Reactor Clone</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-white">{link.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm text-muted transition hover:text-white md:block">Log in</Link>
          <Link href="/app" className="rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:opacity-90">Open app</Link>
        </div>
      </div>
    </header>
  );
}
