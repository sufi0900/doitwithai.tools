import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// @ts-expect-error -- package.json exports subpath resolved by OpenNext bundler under tsconfig moduleResolution:"node"
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
});
