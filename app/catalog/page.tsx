import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContentCatalog } from "@/components/content-catalog";

export default function CatalogPage() {
  return (
    <>
      <SiteHeader />
      <main className="container py-12">
        <ContentCatalog />
      </main>
      <SiteFooter />
    </>
  );
}
