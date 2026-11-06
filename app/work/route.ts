import { renderWorkIndex } from "@/lib/seo";
export const dynamic = "force-static";
export async function GET() {
  return new Response(await renderWorkIndex(), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
