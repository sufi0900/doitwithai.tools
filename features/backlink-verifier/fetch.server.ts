import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import {
  createBrotliDecompress,
  createGunzip,
  createInflate,
} from "node:zlib";
import type { Readable } from "node:stream";
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
  data?: Buffer;
  redirects: Hop[];
};

type FetchPublicOptions = {
  signal?: AbortSignal;
  html?: boolean;
  text?: boolean;
  xml?: boolean;
  maxDecodedBytes?: number;
  image?: boolean;
  bytes?: number;
  timeout?: number;
  beforeRequest?: (url: URL) => Promise<void>;
};

type HopResult = {
  status: number;
  headers: Record<string, string>;
  html: string;
  data?: Buffer;
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 (+https://doitwithai.tools)";

function isEdgeWorkersRuntime(): boolean {
  const hasWorkersUa =
    typeof navigator !== "undefined" &&
    /Cloudflare-Workers/i.test(navigator.userAgent || "");
  const hasWebSocketPair =
    typeof (globalThis as { WebSocketPair?: unknown }).WebSocketPair !==
    "undefined";
  return hasWorkersUa || hasWebSocketPair;
}

function contentTypeRegex(options: FetchPublicOptions): RegExp {
  return options.image
    ? /^image\/(?:png|jpeg)(?:;|$)/i
    : options.xml
      ? /(?:application|text)\/xml|\+xml|text\/plain/i
      : options.text
        ? /text\/plain/i
        : /text\/html|application\/xhtml\+xml/i;
}

function contentTypeErrorMessage(options: FetchPublicOptions): string {
  return options.image
    ? "Only public PNG and JPEG images are supported."
    : options.text
      ? "Robots policy was not plain text."
      : options.xml
        ? "The source did not return a valid XML document."
        : "The source did not return an HTML page.";
}

function resolveMaxBytes(options: FetchPublicOptions): number {
  return (
    options.maxDecodedBytes ??
    (options.image
      ? options.bytes || 2_000_000
      : Math.max(options.bytes || 2_000_000, 5_000_000))
  );
}

function shouldFallbackToEdgeFetch(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message || "";
  if (
    /private|reserved|unresolved|credentials|custom port|redirect|HTML|plain text|PNG and JPEG|compressed|cancelled|aborted|exceeds/i.test(
      msg,
    ) ||
    err.name === "AbortError" ||
    err.name === "TimeoutError"
  ) {
    return false;
  }
  return /not implemented|unsupported|enotimpl|lookup|workerd|cloudflare/i.test(
    msg,
  );
}

async function fetchHopViaGlobalFetch(
  url: URL,
  options: FetchPublicOptions,
  signal: AbortSignal,
): Promise<HopResult> {
  const accept = options.image
    ? "image/png,image/jpeg,image/webp,image/*;q=0.8"
    : options.xml
      ? "application/xml,text/xml,text/plain;q=0.9,*/*;q=0.8"
      : options.text
        ? "text/plain,*/*;q=0.8"
        : options.html === false
          ? "*/*"
          : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";

  const response = await globalThis.fetch(url.href, {
    method: "GET",
    redirect: "manual",
    signal,
    headers: {
      "User-Agent": USER_AGENT,
      Accept: accept,
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  const status = response.status || 0;
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  if (options.html === false || status >= 300 || status < 200) {
    await response.body?.cancel().catch(() => undefined);
    return { status, headers, html: "" };
  }

  if (!contentTypeRegex(options).test(headers["content-type"] || "")) {
    await response.body?.cancel().catch(() => undefined);
    throw new Error(contentTypeErrorMessage(options));
  }

  const max = resolveMaxBytes(options);
  const chunks: Uint8Array[] = [];
  let total = 0;

  if (response.body) {
    const reader = response.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value || value.byteLength === 0) continue;
        total += value.byteLength;
        if (total > max) {
          if (!options.image && chunks.length > 0) {
            const buffered = Buffer.concat(chunks).toString("utf8");
            if (
              buffered.length >= 600 &&
              /<(article|main|body|p|h1|h2)\b/i.test(buffered)
            ) {
              await reader.cancel().catch(() => undefined);
              return { status, headers, html: buffered };
            }
          }
          await reader.cancel().catch(() => undefined);
          throw new Error(
            "The source exceeds the HTML limit. Paste a smaller HTML section.",
          );
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
  }

  const data = Buffer.concat(chunks);
  return {
    status,
    headers,
    html: options.image ? "" : data.toString("utf8"),
    ...(options.image ? { data } : {}),
  };
}

function fetchHopViaNodeHttp(
  url: URL,
  options: FetchPublicOptions,
  signal: AbortSignal,
): Promise<HopResult> {
  return new Promise<HopResult>((resolve, reject) => {
    let settled = false;
    const safeResolve = (val: HopResult) => {
      if (settled) return;
      settled = true;
      resolve(val);
    };
    const safeReject = (err: unknown) => {
      if (settled) return;
      settled = true;
      reject(err instanceof Error ? err : new Error(String(err)));
    };

    const req = (url.protocol === "https:" ? httpsRequest : httpRequest)(
      url,
      {
        method: "GET",
        agent: false,
        signal,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: options.image
            ? "image/png,image/jpeg,image/webp,image/*;q=0.8"
            : options.html === false
              ? "*/*"
              : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br, identity",
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
            key.toLowerCase(),
            Array.isArray(v) ? v.join(", ") : v || "",
          ]),
        );
        if (options.html === false || status >= 300 || status < 200) {
          response.destroy();
          return safeResolve({ status, headers, html: "" });
        }

        const encoding = (headers["content-encoding"] || "identity")
          .toLowerCase()
          .trim();
        let stream: Readable = response;
        if (encoding === "gzip" || encoding === "x-gzip") {
          const gunzip = createGunzip();
          stream = response.pipe(gunzip);
        } else if (encoding === "deflate") {
          const inflate = createInflate();
          stream = response.pipe(inflate);
        } else if (encoding === "br") {
          const brotli = createBrotliDecompress();
          stream = response.pipe(brotli);
        } else if (encoding && encoding !== "identity") {
          response.destroy();
          return safeReject(
            new Error(
              "The source returned unsupported compressed content. Paste its page HTML instead.",
            ),
          );
        }

        if (!contentTypeRegex(options).test(headers["content-type"] || "")) {
          response.destroy();
          return safeReject(new Error(contentTypeErrorMessage(options)));
        }

        const chunks: Buffer[] = [];
        let total = 0;
        const max = resolveMaxBytes(options);

        const tryResolvePartialHtml = () => {
          if (options.image || chunks.length === 0) return false;
          const buffered = Buffer.concat(chunks).toString("utf8");
          if (
            buffered.length >= 600 &&
            /<(article|main|body|p|h1|h2)\b/i.test(buffered)
          ) {
            safeResolve({
              status,
              headers,
              html: buffered,
            });
            return true;
          }
          return false;
        };

        stream.on("data", (chunk: Buffer) => {
          if (settled) return;
          total += chunk.length;
          if (total > max) {
            if (tryResolvePartialHtml()) {
              response.destroy();
              return;
            }
            response.destroy();
            safeReject(
              new Error(
                "The source exceeds the HTML limit. Paste a smaller HTML section.",
              ),
            );
            return;
          }
          chunks.push(chunk);
        });

        stream.on("end", () => {
          const data = Buffer.concat(chunks);
          safeResolve({
            status,
            headers,
            html: options.image ? "" : data.toString("utf8"),
            ...(options.image ? { data } : {}),
          });
        });

        response.on("aborted", () => {
          if (tryResolvePartialHtml()) return;
          safeReject(
            new Error("The source response ended before all HTML arrived."),
          );
        });

        stream.on("error", (err) => {
          if (tryResolvePartialHtml()) return;
          safeReject(err);
        });

        response.on("error", (err) => {
          if (tryResolvePartialHtml()) return;
          safeReject(err);
        });
      },
    );
    req.on("error", (err) => {
      safeReject(err);
    });
    req.end();
  });
}

/** DNS answers are validated and pinned to the socket on Node; Cloudflare Workers uses edge-safe fetch with manual redirect checks. */
export async function fetchPublic(
  raw: string,
  options: FetchPublicOptions = {},
): Promise<Fetched> {
  let url = publicUrl(raw);
  const redirects: Hop[] = [],
    visited = new Set<string>();
  const signal = options.signal
    ? AbortSignal.any([
        options.signal,
        AbortSignal.timeout(options.timeout || 15000),
      ])
    : AbortSignal.timeout(options.timeout || 15000);
  const edgeRuntime = isEdgeWorkersRuntime();

  for (let hop = 0; hop <= 5; hop++) {
    if (visited.has(url.href))
      throw new Error("Redirect loop detected. Try the final source URL.");
    visited.add(url.href);
    await options.beforeRequest?.(new URL(url));

    let result: HopResult;
    if (edgeRuntime) {
      result = await fetchHopViaGlobalFetch(url, options, signal);
    } else {
      try {
        result = await fetchHopViaNodeHttp(url, options, signal);
      } catch (err) {
        if (shouldFallbackToEdgeFetch(err)) {
          result = await fetchHopViaGlobalFetch(url, options, signal);
        } else {
          throw err;
        }
      }
    }

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
