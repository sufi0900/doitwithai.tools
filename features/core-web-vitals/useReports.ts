"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { checkCoreWebVitals } from "./client";
import { matchingReport, reportKey } from "./report-state";
import type { PageSpeedResult, Strategy } from "./types";

/** Separate URL/device keys prevent late responses from replacing the selected report. */
export function useReports() {
  const [reports, setReports] = useState<Record<string, PageSpeedResult>>({});
  const latest = useRef(reports);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const requests = useRef(new Map<string, Promise<void>>());
  const controllers = useRef(new Map<string, AbortController>());
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const activeControllers = controllers.current;
    return () => {
      mounted.current = false;
      activeControllers.forEach((controller) => controller.abort());
    };
  }, []);
  const ensure = useCallback(
    (url: string, strategy: Strategy): Promise<void> => {
      const key = reportKey(url, strategy);
      const active = requests.current.get(key);
      if (active) return active;
      if (matchingReport(latest.current, url, strategy))
        return Promise.resolve();
      const controller = new AbortController();
      controllers.current.set(key, controller);
      setPending((old) => ({ ...old, [key]: true }));
      setErrors((old) => ({ ...old, [key]: "" }));
      const work = (async () => {
        try {
          const outcome = await checkCoreWebVitals(
            url,
            strategy,
            controller.signal,
          );
          if (!mounted.current || controller.signal.aborted) return;
          if (outcome.ok === false) {
            setErrors((old) => ({ ...old, [key]: outcome.message }));
            return;
          }
          const report = {
            ...outcome.result,
            checkedAt: outcome.result.checkedAt || new Date().toISOString(),
          };
          if (!matchingReport({ [key]: report }, url, strategy)) {
            setErrors((old) => ({
              ...old,
              [key]:
                "The returned report did not match this URL and device. Please retry.",
            }));
            return;
          }
          latest.current = {
            ...Object.fromEntries(
              Object.entries(latest.current)
                .filter(([id]) => id !== key)
                .slice(-19),
            ),
            [key]: report,
          };
          setReports(latest.current);
        } catch {
          if (mounted.current && !controller.signal.aborted)
            setErrors((old) => ({
              ...old,
              [key]: "This device check could not finish. Please retry.",
            }));
        } finally {
          requests.current.delete(key);
          controllers.current.delete(key);
          if (mounted.current)
            setPending((old) => {
              const next = { ...old };
              delete next[key];
              return next;
            });
        }
      })();
      requests.current.set(key, work);
      return work;
    },
    [],
  );
  return { reports, pending, errors, ensure };
}
