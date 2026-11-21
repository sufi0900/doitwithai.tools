import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Static assets and origin CDN headers handle caching on the Free tier without
  // requiring an R2 bucket upfront. If you enable R2 or KV later, you can plug in
  // r2IncrementalCache or kvIncrementalCache here.
});
