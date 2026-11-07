import { renderInformation } from "@/lib/seo";
export const dynamic = "force-static";
export async function GET() {
  return new Response(await renderInformation("/terms"), { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
