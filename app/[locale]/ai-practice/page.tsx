import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AIChatbot } from "@/components/ai-chatbot";

export default function AIPracticePage() {
  return (
    <>
      <SiteHeader />
      <main className="container py-12">
        <AIChatbot />
      </main>
      <SiteFooter />
    </>
  );
}
