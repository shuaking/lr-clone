import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { StatsOverview } from "@/components/stats-overview";
import { AchievementsList } from "@/components/achievements-list";

export default function StatsPage() {
  return (
    <>
      <SiteHeader />
      <main className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold">学习统计</h1>
          <p className="mt-2 text-muted">追踪你的学习进度和成就</p>
        </div>

        <div className="space-y-8">
          <StatsOverview />
          <AchievementsList />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
