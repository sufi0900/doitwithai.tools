"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { addRecentUrl, DEVICE_KEY, recentUrls, SESSION_KEY } from "./storage";
const Context = createContext({
  urls: [] as string[],
  remember: (_url: string) => {},
  persistent: false,
  setPersistent: (_value: boolean) => {},
  clear: () => {},
});
export const useRecentUrls = () => useContext(Context);
export default function RecentUrlsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [urls, setUrls] = useState<string[]>([]),
    [persistent, updatePersistent] = useState(false),
    [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DEVICE_KEY);
      updatePersistent(saved !== null);
      setUrls(
        recentUrls(
          JSON.parse(saved ?? sessionStorage.getItem(SESSION_KEY) ?? "[]"),
        ),
      );
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(urls));
    } catch {}
    try {
      if (persistent) localStorage.setItem(DEVICE_KEY, JSON.stringify(urls));
      else localStorage.removeItem(DEVICE_KEY);
    } catch {}
  }, [urls, persistent, ready]);
  const remember = useCallback(
    (raw: string) => setUrls((old) => addRecentUrl(old, raw)),
    [],
  );
  const clear = useCallback(() => {
    setUrls([]);
    try {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(DEVICE_KEY);
    } catch {}
    updatePersistent(false);
  }, []);
  const value = useMemo(
    () => ({
      urls,
      remember,
      persistent,
      setPersistent: updatePersistent,
      clear,
    }),
    [urls, remember, persistent, clear],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function RecentUrlSettings() {
  const { urls, persistent, setPersistent, clear } = useRecentUrls();
  return (
    <details className="workspace-collections">
      <summary>Recent URL autofill ({urls.length})</summary>
      <div className="!block space-y-3 text-xs leading-6">
        <p>
          URL fields suggest your last ten public URLs. Nothing is submitted
          automatically.
        </p>
        <p>
          History stays in this tab by default. Query strings and fragments are
          excluded.
        </p>
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1"
            checked={persistent}
            onChange={(e) => setPersistent(e.target.checked)}
          />
          Remember URLs across visits on this device
        </label>
        <button
          type="button"
          className="min-h-11 rounded-lg border border-slate-300 px-3 py-2 font-semibold dark:border-slate-600"
          onClick={clear}
        >
          Clear URL history
        </button>
        <p>No account sync. Turn off device storage on shared computers.</p>
      </div>
    </details>
  );
}
