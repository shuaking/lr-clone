import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PhrasePump } from "@/components/phrase-pump";

export default function PhrasePumpPage() {
  return (
    <>
      <SiteHeader />
      <main className="container py-12">
        <PhrasePump />
      </main>
      <SiteFooter />
    </>
  );
}
