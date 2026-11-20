type Connection = {
  endpoint: string;
  token: string;
  tool: string;
  autoPublish?: boolean;
};
export function deliveryConnection(
  workspace: string,
  provider: string,
): Connection | null {
  let value: Connection | undefined;
  try {
    value = JSON.parse(process.env.AGENCY_MCP_CONNECTIONS_JSON || "{}")[
      workspace
    ]?.[provider];
  } catch {
    throw Error("Workspace connector configuration is invalid.");
  }
  if (
    !value ||
    typeof value.token !== "string" ||
    !value.token ||
    typeof value.tool !== "string" ||
    !value.tool
  )
    return null;
  const url = new URL(value.endpoint);
  if (url.protocol !== "https:" || url.username || url.password)
    throw Error("Invalid connector endpoint.");
  return {
    endpoint: url.href,
    token: value.token,
    tool: value.tool,
    autoPublish: value.autoPublish === true,
  };
}

export async function callDeliveryTool(
  connection: Connection,
  args: Record<string, unknown>,
  status: "draft" | "published",
) {
  const protocol = "2025-06-18";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    Authorization: "Bearer " + connection.token,
  };
  const signal = AbortSignal.timeout(20000);
  async function post(method: string, params: unknown, id?: number) {
    const res = await fetch(connection.endpoint, {
      method: "POST",
      headers,
      redirect: "error",
      signal,
      body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    });
    if (!res.ok) throw Error("Connector rejected " + method);
    if (id === undefined) return;
    if (method === "initialize" && res.headers.has("Mcp-Session-Id"))
      headers["Mcp-Session-Id"] = res.headers.get("Mcp-Session-Id")!;
    const data = await res.json();
    if (data.id !== id || data.error || !data.result)
      throw Error("Invalid connector response.");
    return data.result;
  }
  const handshake = await post(
    "initialize",
    {
      protocolVersion: protocol,
      capabilities: {},
      clientInfo: { name: "doitwithai-agency", version: "1" },
    },
    1,
  );
  if (handshake.protocolVersion !== protocol)
    throw Error("Unsupported MCP protocol.");
  headers["MCP-Protocol-Version"] = protocol;
  await post("notifications/initialized", {});
  const result = await post(
    "tools/call",
    { name: connection.tool, arguments: args },
    2,
  );
  if (result.isError) throw Error("Delivery tool reported an error.");
  const receipt =
    result.structuredContent ||
    JSON.parse(
      result.content?.find((c: { type: string }) => c.type === "text")?.text ||
        "{}",
    );
  if (
    !["string", "number"].includes(typeof receipt.id) ||
    !String(receipt.id).trim() ||
    receipt.status !== status
  )
    throw Error("Unconfirmed delivery.");
  return {
    id: String(receipt.id),
    url:
      typeof receipt.url === "string" && /^https?:\/\//i.test(receipt.url)
        ? receipt.url
        : "",
    status,
  };
}
