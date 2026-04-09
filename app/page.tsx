import Link from "next/link";
import { PlayCircle, Languages, BookOpenText, PanelRightOpen } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FeatureCard } from "@/components/feature-card";
import { features } from "@/lib/mock";
const surfaceItems = [
  { icon: PlayCircle, label: "Video subtitle control" },
  { icon: Languages, label: "Word hover translation" },
  { icon: BookOpenText, label: "Reader for imported text" },
  { icon: PanelRightOpen, label: "Study sidebar + saved words" }
];
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-hero">
        <section className="grid-bg relative overflow-hidden border-b border-white/5">
          <div className="container grid gap-14 py-20 md:grid-cols-[1.15fr_.85fr] md:py-28">
            <div>
              <span className="badge mb-6">Learn from videos, websites, and imported text</span>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">A near-identical learning app shell you can reskin later.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">This starter copies the structure and feel of a premium language-learning product: dark hero, feature-led sections, app dashboard, pricing, and a split reading experience.</p>
              <div className="mt-9 flex flex-wrap gap-4">
                <Link href="/app" className="rounded-full bg-white px-6 py-3 font-medium text-slate-900">Open app shell</Link>
                <Link href="/pricing" className="rounded-full border border-white/10 px-6 py-3 font-medium text-white">View pricing</Link>
              </div>
              <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
                {surfaceItems.map(({ icon: Icon, label }) => (
                  <div key={label} className="panel flex items-center gap-3 px-4 py-3 text-sm text-slate-200">
                    <Icon size={18} className="text-brand" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel shadow-glow p-4 md:p-5">
              <div className="rounded-[1.1rem] border border-white/10 bg-[#0f1526] p-4">
                <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
                  <div><p className="text-sm text-muted">Lesson</p><p className="text-lg font-semibold">Daily immersion</p></div>
                  <span className="badge">Split subtitle mode</span>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((row) => (
                    <div key={row} className="rounded-2xl bg-white/5 p-4">
                      <p className="text-xs text-brand">00:0{row}</p>
                      <p className="mt-2 text-sm text-slate-200">Sample transcript line with hoverable vocabulary and saved study actions.</p>
                      <p className="mt-1 text-sm text-slate-500">对应的翻译行会在这里显示。</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="py-20">
          <div className="container">
            <div className="mb-10 max-w-2xl">
              <span className="badge mb-4">Feature blocks</span>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Everything is split into easy-to-replace modules.</h2>
              <p className="mt-4 text-muted">Keep the visual shell now, then swap copy, branding, APIs, and product logic later.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => <FeatureCard key={feature.title} title={feature.title} description={feature.description} />)}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
