/** Standalone replacement for next/navigation. */
const ORIGIN = "https://doitwithai.tools";

export function useRouter() {
  return {
    push: (u: string) => window.open(u.startsWith("/") ? ORIGIN + u : u, "_blank"),
    replace: () => undefined,
    prefetch: () => undefined,
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => undefined,
  };
}
export function usePathname() {
  return "/";
}
export function useSearchParams() {
  return new URLSearchParams(
    typeof window !== "undefined" && window.location.protocol !== "file:"
      ? window.location.search
      : "",
  );
}
export function useParams() {
  return {};
}
export function notFound(): never {
  throw new Error("notFound");
}
export function redirect(): never {
  throw new Error("redirect");
}
