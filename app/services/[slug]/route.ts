import { services } from "@/lib/seo-content";
import { renderService } from "@/lib/seo";
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const html = await renderService((await params).slug);
  return new Response(html || "Not found", {
    status: html ? 200 : 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
