import { ArrowUpRight } from "lucide-react";
export function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="panel p-6 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07]">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/15 text-brand"><ArrowUpRight size={18} /></div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}
