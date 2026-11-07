import { serverInfo, tools, toolResult } from "@/lib/agents";
import { SITE_ORIGIN } from "@/lib/seo-content";

const protocolVersion = "2025-06-18";
function allowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin === SITE_ORIGIN) return true;
  // Permit same-host loopback previews, including production-build checks.
  // Never use forwarded host headers to allow arbitrary origins.
  return /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    && new URL(origin).host === request.headers.get("host");
}

export async function POST(request: Request) {
  if (!allowedOrigin(request)) return new Response(null, { status: 403 });
  if (!request.headers.get("content-type")?.includes("application/json")) return new Response(null, { status: 415 });
  const accept = request.headers.get("accept") || "";
  if (!accept.includes("application/json") || !accept.includes("text/event-stream")) return new Response(null, { status: 406 });
  const version = request.headers.get("mcp-protocol-version");
  if (version && version !== protocolVersion) return new Response(null, { status: 400 });
  // Read a bounded body even when Content-Length is absent.
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400 });
  let body = "";
  let bytes = 0;
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 16384) { await reader.cancel(); return new Response(null, { status: 413 }); }
    body += decoder.decode(value, { stream: true });
  }
  body += decoder.decode();
  let message;
  try { message = JSON.parse(body); }
  catch { return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400 }); }
  const validId = typeof message?.id === "string" || (typeof message?.id === "number" && Number.isFinite(message.id));
  const error = (code: number, text: string, status = 200) => Response.json({ jsonrpc: "2.0", id: validId ? message.id : null, error: { code, message: text } }, { status });
  if (!message || Array.isArray(message) || message.jsonrpc !== "2.0" || typeof message.method !== "string" || ("id" in message && !validId)) return error(-32600, "Invalid request", 400);
  if (!("id" in message)) {
    return new Response(null, { status: message.method.startsWith("notifications/") ? 202 : 400 });
  }
  let result;
  switch (message.method) {
    case "initialize":
      if (!message.params || typeof message.params.protocolVersion !== "string") return error(-32602, "Missing protocol version");
      result = { protocolVersion, capabilities: { tools: { listChanged: false } }, serverInfo };
      break;
    case "ping": result = {}; break;
    case "tools/list": result = { tools }; break;
    case "tools/call": {
      const args = message.params?.arguments;
      if (typeof message.params?.name !== "string" || (args !== undefined && (!args || typeof args !== "object" || Array.isArray(args) || Object.keys(args).length))) return error(-32602, "Tools accept an empty arguments object");
      const data = toolResult(message.params.name);
      if (data === undefined) return error(-32602, "Unknown tool");
      result = { content: [{ type: "text", text: JSON.stringify(data) }], isError: false };
      break;
    }
    default: return error(-32601, "Method not found");
  }
  return Response.json({ jsonrpc: "2.0", id: message.id, result });
}

export function GET(request: Request) {
  return new Response(null, { status: allowedOrigin(request) ? 405 : 403, headers: { Allow: "POST" } });
}
