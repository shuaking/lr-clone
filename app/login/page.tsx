import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div className="panel w-full max-w-md p-8">
          <span className="badge mb-5">Auth shell</span>
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="mt-3 text-sm text-muted">Plug Clerk, Auth.js, Supabase, or your own auth service in here later.</p>
          <div className="mt-8 space-y-4">
            <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" placeholder="Email" />
            <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none" placeholder="Password" type="password" />
            <button className="w-full rounded-full bg-white px-5 py-3 font-medium text-slate-900">Sign in</button>
          </div>
          <p className="mt-5 text-sm text-muted">No account yet? <Link href="/pricing" className="text-white">View plans</Link></p>
        </div>
      </main>
    </>
  );
}
