/* Public, read-only tools. Support both current and earlier WebMCP surfaces. */
(() => {
  const context = document.modelContext || navigator.modelContext;
  if (!context || typeof context.registerTool !== "function") return;
  for (const [name, description] of [
    ["get_business_info", "Read TheBenzzCreations public contact details and key pages."],
    ["list_services", "List TheBenzzCreations digital services and detail URLs."],
  ]) {
    context.registerTool({
      name,
      description,
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      async execute() {
        const response = await fetch("/mcp", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: {} } }),
        });
        if (!response.ok) throw new Error("Public information is temporarily unavailable.");
        const message = await response.json();
        if (message.error) throw new Error(message.error.message);
        return message.result;
      },
    });
  }
})();
