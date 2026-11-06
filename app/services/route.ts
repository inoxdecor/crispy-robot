import { renderServiceIndex } from "@/lib/seo";
export const dynamic = "force-static";
export async function GET() {
  return new Response(await renderServiceIndex(), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
