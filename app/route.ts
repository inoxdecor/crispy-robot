import { renderHome } from "@/lib/seo";
import { agentLinks, homepageMarkdown, prefersMarkdown } from "@/lib/agents";
export async function GET(request: Request) {
  const markdown = prefersMarkdown(request.headers.get("accept"));
  return new Response(markdown ? homepageMarkdown() : await renderHome(), {
    headers: { "Content-Type": `${markdown ? "text/markdown" : "text/html"}; charset=utf-8`, Vary: "Accept", Link: agentLinks },
  });
}
