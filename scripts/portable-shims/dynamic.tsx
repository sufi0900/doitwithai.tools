import React from "react";

/** Standalone replacement for next/dynamic (bundles eagerly via lazy). */
export default function dynamic(
  loader: () => Promise<unknown>,
  _options?: unknown,
) {
  const Lazy = React.lazy(async () => {
    const mod = (await loader()) as { default?: unknown };
    return { default: (mod.default ?? mod) as React.ComponentType<unknown> };
  });
  return function DynamicComponent(props: Record<string, unknown>) {
    return (
      <React.Suspense fallback={null}>
        <Lazy {...props} />
      </React.Suspense>
    );
  };
}
