import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { GET as home } from "../app/route";
import { POST as mcp } from "../app/mcp/route";
import { GET as card } from "../app/.well-known/mcp/server-card.json/route";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { llmsText } from "../lib/agents";
import { BUSINESS, publicPages } from "../lib/seo-content";
import { renderInformation, schemaFor } from "../lib/seo";

test("homepage negotiates Markdown without poisoning the HTML cache", async () => {
  for (const [accept, type] of [["text/markdown", "text/markdown"], ["text/html", "text/html"], ["*/*", "text/html"], ["text/markdown;q=0", "text/html"], ["text/markdown;q=0.5,text/html", "text/html"]]) {
    const response = await home(new Request("https://www.thebenzzcreations.com/", { headers: { accept } }));
    assert.ok(response.headers.get("content-type")?.startsWith(type));
    assert.equal(response.headers.get("vary"), "Accept");
    assert.match(response.headers.get("link")!, /llms\.txt.*index\.md/);
    const content = await response.text();
    if (type === "text/markdown") {
      assert.match(content, /^# TheBenzzCreations/);
      assert.ok(content.includes(BUSINESS.telephone));
      assert.ok(!content.includes("<script"));
    } else for (const path of ["about", "contact", "terms"]) assert.ok(content.includes(`href="/${path}"`));
  }
});

test("discovery and schema cover every public page and verified contact details", async () => {
  assert.equal(robots().rules && (robots().rules as { other: Record<string, string> }).other["Content-Signal"], "search=yes, ai-train=no");
  assert.equal(sitemap().length, publicPages.length);
  for (const page of publicPages) assert.ok(llmsText().includes(page.path));
  const organization = schemaFor(publicPages[0], [["Home", "/"]])["@graph"][0];
  assert.ok("telephone" in organization && "address" in organization);
  assert.equal(organization.telephone, BUSINESS.telephone);
  assert.deepEqual(organization.address, BUSINESS.address);
  for (const pathname of ["/about", "/contact", "/terms", "/pricing"]) assert.match(await renderInformation(pathname), /<h1>/);
  const pricing = await renderInformation("/pricing");
  assert.match(pricing, /Prices are available on request/);
  assert.match(pricing, /mailto:thebenzzcreationsofficial@gmail.com/);
  assert.match(pricing, /tel:\+919899788325/);
  assert.ok(!pricing.includes('"@type":"Offer"'));
});

const rpc = (method: string, params?: unknown, origin?: string) => mcp(new Request("https://www.thebenzzcreations.com/mcp", {
  method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...(origin ? { Origin: origin } : {}) },
  body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
}));

test("MCP card matches a working read-only protocol endpoint", async () => {
  const discovery = await card().json();
  const init = await (await rpc("initialize", { protocolVersion: "2025-06-18" })).json();
  assert.deepEqual(init.result.serverInfo, discovery.serverInfo);
  assert.deepEqual(init.result.capabilities, discovery.capabilities);
  const listed = await (await rpc("tools/list")).json();
  assert.equal(listed.result.tools.length, 2);
  for (const tool of listed.result.tools) {
    const result = await (await rpc("tools/call", { name: tool.name, arguments: {} })).json();
    assert.equal(result.result.isError, false);
    assert.ok(JSON.parse(result.result.content[0].text));
  }
  assert.equal((await (await rpc("tools/call", { name: "unknown" })).json()).error.code, -32602);
  assert.equal((await (await rpc("tools/call", { name: "list_services", arguments: { unexpected: true } })).json()).error.code, -32602);
  assert.equal((await rpc("tools/list", undefined, "https://untrusted.example")).status, 403);
});

test("WebMCP registers on load on either browser surface and executes public tools", async () => {
  const source = await readFile("public/reference/agents.js", "utf8");
  for (const surface of ["document", "navigator"]) {
    const registered: { name: string; execute: () => Promise<unknown> }[] = [];
    const context = { registerTool: (tool: (typeof registered)[number]) => registered.push(tool) };
    vm.runInNewContext(source, {
      document: surface === "document" ? { modelContext: context } : {},
      navigator: surface === "navigator" ? { modelContext: context } : {},
      fetch: (_url: string, options: RequestInit) => mcp(new Request("https://www.thebenzzcreations.com/mcp", options)),
    });
    assert.equal(registered.length, 2);
    for (const tool of registered) assert.ok(await tool.execute());
  }
  vm.runInNewContext(source, { document: {}, navigator: {} });
});
