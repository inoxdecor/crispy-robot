import { renderPrivacy } from "@/lib/seo";
export const dynamic = "force-static";
export async function GET() {
  return new Response(await renderPrivacy(), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
