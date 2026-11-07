import { homepageMarkdown } from "@/lib/agents";
export const dynamic = "force-static";
export function GET() {
  return new Response(homepageMarkdown(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
