import { projects } from "@/lib/seo-content";
import { renderProject } from "@/lib/seo";
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const html = await renderProject((await params).slug);
  return new Response(html || "Not found", {
    status: html ? 200 : 404,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
