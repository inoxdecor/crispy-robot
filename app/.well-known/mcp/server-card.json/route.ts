import { serverCard } from "@/lib/agents";
export const dynamic = "force-static";
export function GET() {
  return Response.json(serverCard, { headers: { "Access-Control-Allow-Origin": "*" } });
}
