import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// @ts-expect-error -- package.json exports subpath resolved by OpenNext bundler under tsconfig moduleResolution:"node"
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
// @ts-expect-error -- package.json exports subpath resolved by OpenNext bundler under tsconfig moduleResolution:"node"
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";

export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(kvIncrementalCache, {
    mode: "long-lived",
  }),
});
