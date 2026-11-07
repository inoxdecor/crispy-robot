import { BUSINESS, SITE_ORIGIN, homepageFaqs, publicPages, services, projects } from "./seo-content";

export function homepageMarkdown() {
  return `# ${BUSINESS.name}

Independent digital studio building websites, mobile apps, custom software, AI integrations, e-commerce, UI/UX and digital marketing. Based in ${BUSINESS.location}; working remotely worldwide.

## Contact
- Email: ${BUSINESS.email}
- Telephone: ${BUSINESS.telephone}
- Location: ${BUSINESS.location}
- [Project enquiry](${SITE_ORIGIN}/#contact)

## Services
${services.map(s => `### ${s.name}\n${s.intro}\n[Details](${SITE_ORIGIN}/services/${s.slug})`).join("\n\n")}

## Published projects
${projects.map(p => `- [${p.name}](${SITE_ORIGIN}/work/${p.slug}): ${p.summary}`).join("\n")}

## Frequently asked questions
${homepageFaqs.map(([q, a]) => `### ${q}\n${a}`).join("\n\n")}

## Site pages
${publicPages.map(p => `- [${p.title}](${SITE_ORIGIN}${p.path}): ${p.description}`).join("\n")}
`;
}

export function llmsText() {
  return `# ${BUSINESS.name}\n\n> Independent digital studio in New Delhi, India serving businesses remotely worldwide.\n\nEmail: ${BUSINESS.email}\nTelephone: ${BUSINESS.telephone}\nLocation: ${BUSINESS.location}\n\n## Pages\n${publicPages.map(p => `- [${p.title}](${SITE_ORIGIN}${p.path}): ${p.description}`).join("\n")}\n\n## Agent resources\n- [Homepage Markdown](${SITE_ORIGIN}/index.md)\n- [Sitemap](${SITE_ORIGIN}/sitemap.xml)\n- [MCP server card](${SITE_ORIGIN}/.well-known/mcp/server-card.json)\n\nThe homepage also serves Markdown for Accept: text/markdown. Public read-only MCP endpoint: ${SITE_ORIGIN}/mcp. Tools provide business information and services; they do not submit enquiries. Pricing, delivery dates and project scope require an individual proposal.\n`;
}

export function prefersMarkdown(accept: string | null) {
  const entries = (accept || "").toLowerCase().split(",").map(part => {
    const [type, ...params] = part.trim().split(";");
    const q = params.find(p => p.trim().startsWith("q="));
    return { type, quality: q ? Number(q.trim().slice(2)) : 1 };
  });
  const markdown = entries.find(e => e.type === "text/markdown")?.quality ?? 0;
  const html = entries.find(e => e.type === "text/html")?.quality ?? 0;
  return markdown > 0 && markdown >= html;
}

export const agentLinks = `<${SITE_ORIGIN}/llms.txt>; rel="describedby"; type="text/plain", <${SITE_ORIGIN}/index.md>; rel="alternate"; type="text/markdown", <${SITE_ORIGIN}/.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"`;

export const serverInfo = { name: "thebenzzcreations", title: "TheBenzzCreations public information", version: "1.0.0" };
export const tools = [
  { name: "get_business_info", description: "Read the studio's public contact details and key pages.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } },
  { name: "list_services", description: "List the studio's digital services and their detail URLs.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false } },
];
export function toolResult(name: string) {
  if (name === "get_business_info") return { ...BUSINESS, pages: publicPages.map(p => ({ title: p.title, url: SITE_ORIGIN + p.path })) };
  if (name === "list_services") return services.map(s => ({ name: s.name, description: s.intro, url: `${SITE_ORIGIN}/services/${s.slug}` }));
  return undefined;
}
export const serverCard = {
  $schema: "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
  version: "1.0", protocolVersion: "2025-06-18", serverInfo,
  description: "Public read-only business information and service catalogue for TheBenzzCreations.",
  documentationUrl: `${SITE_ORIGIN}/llms.txt`,
  transport: { type: "streamable-http", endpoint: `${SITE_ORIGIN}/mcp` },
  capabilities: { tools: { listChanged: false } },
};
