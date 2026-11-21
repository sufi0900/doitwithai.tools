export function safeNextPath(value: string | undefined, fallback = "/do-it-ai") {
  return value?.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : fallback;
}

export function guestClaimPath(authenticated: boolean) {
  return authenticated ? "/ai-website-builder/claim" : "/do-it-ai?signin=1&next=/ai-website-builder/claim";
}
