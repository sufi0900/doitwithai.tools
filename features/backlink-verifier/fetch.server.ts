import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import type { Hop } from "./types";

const blocked4 = new BlockList(),
  allowed6 = new BlockList(),
  blocked6 = new BlockList();
for (const [network, bits] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 3],
] as const)
  blocked4.addSubnet(network, bits, "ipv4");
allowed6.addSubnet("2000::", 3, "ipv6");
for (const [network, bits] of [
  ["2001::", 23],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["3fff::", 20],
] as const)
  blocked6.addSubnet(network, bits, "ipv6");
export function publicAddress(ip: string) {
  return isIP(ip) === 4
    ? !blocked4.check(ip, "ipv4")
    : isIP(ip) === 6 &&
        allowed6.check(ip, "ipv6") &&
        !blocked6.check(ip, "ipv6");
}
export function publicUrl(raw: string) {
  const url = new URL(raw);
  const hostname = url.hostname
    .replace(/^\[|\]$/g, "")
    .replace(/\.$/, "")
    .toLowerCase();
  if (
    !/^https?:$/.test(url.protocol) ||
    url.username ||
    url.password ||
    url.port
  )
    throw new Error(
      "Use a public HTTP or HTTPS URL without credentials or a custom port.",
    );
  if (
    /^(localhost|local|internal)$/.test(hostname) ||
    /\.(localhost|local|internal)$/.test(hostname) ||
    (isIP(hostname) && !publicAddress(hostname))
  )
    throw new Error(
      "Local, private, and reserved network addresses cannot be checked.",
    );
  url.hash = "";
  return url;
}
export async function resolvePublic(hostname: string, resolver = lookup) {
  const addresses = await resolver(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some((a) => !publicAddress(a.address)))
    throw new Error(
      "Private, reserved, or unresolved network targets are blocked.",
    );
  return addresses;
}
export type Fetched = {
  url: string;
  status: number;
  headers: Record<string, string>;
  html: string;
  redirects: Hop[];
};
/** DNS answers are validated and pinned to the socket; redirects repeat the same guard. */
export async function fetchPublic(
  raw: string,
  options: {
    signal?: AbortSignal;
    html?: boolean;
    text?: boolean;
    bytes?: number;
    timeout?: number;
    beforeRequest?: (url: URL) => Promise<void>;
  } = {},
): Promise<Fetched> {
  let url = publicUrl(raw);
  const redirects: Hop[] = [],
    visited = new Set<string>();
  const signal = options.signal
    ? AbortSignal.any([
        options.signal,
        AbortSignal.timeout(options.timeout || 12000),
      ])
    : AbortSignal.timeout(options.timeout || 12000);
  for (let hop = 0; hop <= 5; hop++) {
    if (visited.has(url.href))
      throw new Error("Redirect loop detected. Try the final source URL.");
    visited.add(url.href);
    await options.beforeRequest?.(new URL(url));
    const result = await new Promise<{
      status: number;
      headers: Record<string, string>;
      html: string;
    }>((resolve, reject) => {
      const req = (url.protocol === "https:" ? httpsRequest : httpRequest)(
        url,
        {
          method: "GET",
          agent: false,
          signal,
          headers: {
            "User-Agent":
              "DoItWithAI-BacklinkVerifier/1.0 (+https://doitwithai.tools)",
            Accept:
              options.html === false
                ? "*/*"
                : "text/html,application/xhtml+xml",
            "Accept-Encoding": "identity",
          },
          lookup: ((
            hostname: string,
            config: { all?: boolean },
            callback: (...args: unknown[]) => void,
          ) => {
            resolvePublic(hostname)
              .then((addresses) => {
                if (
                  !addresses.length ||
                  addresses.some((a) => !publicAddress(a.address))
                )
                  return callback(
                    new Error(
                      "Private, reserved, or unresolved network targets are blocked.",
                    ),
                  );
                if (config.all) callback(null, addresses);
                else callback(null, addresses[0].address, addresses[0].family);
              })
              .catch(callback);
          }) as never,
        },
        (response) => {
          const status = response.statusCode || 0;
          const headers = Object.fromEntries(
            Object.entries(response.headers).map(([key, v]) => [
              key,
              Array.isArray(v) ? v.join(", ") : v || "",
            ]),
          );
          // Destination checks need only headers. Redirect and HTTP-error bodies are unnecessary.
          if (options.html === false || status >= 300 || status < 200) {
            response.destroy();
            resolve({ status, headers, html: "" });
            return;
          }
          if (
            !(
              options.text
                ? /text\/plain/i
                : /text\/html|application\/xhtml\+xml/i
            ).test(headers["content-type"] || "")
          ) {
            response.destroy();
            reject(
              new Error(
                options.text
                  ? "Robots policy was not plain text."
                  : "The source did not return an HTML page.",
              ),
            );
            return;
          }
          if (
            headers["content-encoding"] &&
            headers["content-encoding"] !== "identity"
          ) {
            response.destroy();
            reject(
              new Error(
                "The source returned unsupported compressed content. Paste its page HTML instead.",
              ),
            );
            return;
          }
          const maximum = options.bytes || 2_000_000;
          if (Number(headers["content-length"]) > maximum) {
            response.destroy();
            reject(
              new Error(
                "The source exceeds the 2 MB HTML limit. Paste a smaller HTML section.",
              ),
            );
            return;
          }
          const chunks: Buffer[] = [];
          let count = 0;
          response.on("data", (chunk: Buffer) => {
            count += chunk.length;
            if (count > maximum) {
              response.destroy();
              reject(
                new Error(
                  "The source exceeds the HTML limit. Paste a smaller HTML section.",
                ),
              );
            } else chunks.push(chunk);
          });
          response.on("end", () =>
            resolve({
              status,
              headers,
              html: Buffer.concat(chunks).toString("utf8"),
            }),
          );
          response.on("error", reject);
          response.on("aborted", () =>
            reject(
              new Error("The source response ended before all HTML arrived."),
            ),
          );
        },
      );
      req.on("error", reject);
      req.end();
    });
    if ([301, 302, 303, 307, 308].includes(result.status)) {
      const location = result.headers.location;
      if (!location) throw new Error("A redirect had no destination URL.");
      const next = publicUrl(new URL(location, url).href);
      redirects.push({
        url: url.href,
        status: result.status,
        location: next.href,
      });
      url = next;
      continue;
    }
    return { ...result, url: url.href, redirects };
  }
  throw new Error(
    "More than five redirects prevented verification. Enter the final URL.",
  );
}
