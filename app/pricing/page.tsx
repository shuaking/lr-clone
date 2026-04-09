import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { plans } from "@/lib/mock";
export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="container py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge mb-4">Pricing shell</span>
          <h1 className="text-4xl font-semibold md:text-5xl">Simple plans, easy to replace later.</h1>
          <p className="mt-4 text-muted">This page mirrors the structure of a SaaS pricing section so you can wire Stripe or your own billing flow later.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.name} className={`panel p-8 ${plan.featured ? "border-brand/50 bg-brand/10 shadow-glow" : ""}`}>
              <div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">{plan.name}</h2>{plan.featured ? <span className="badge">Most popular</span> : null}</div>
              <p className="mt-4 text-4xl font-semibold">{plan.price}<span className="text-base text-muted">/month</span></p>
              <p className="mt-3 text-sm leading-6 text-muted">{plan.description}</p>
              <ul className="mt-8 space-y-3 text-sm text-slate-200">{plan.items.map((item) => <li key={item} className="rounded-xl border border-white/5 bg-white/5 px-4 py-3">{item}</li>)}</ul>
              <button className="mt-8 w-full rounded-full bg-white px-5 py-3 font-medium text-slate-900">Choose {plan.name}</button>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
