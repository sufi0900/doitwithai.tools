import { createHash, randomBytes } from "node:crypto";

/** Only opaque 256-bit bearer tokens may be exchanged for shared publications. */
export function validShareToken(token: string) {
  return /^[a-zA-Z0-9_-]{43}$/.test(token);
}

export function hashShareToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createShareToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashShareToken(token) };
}
