"use client";
import React, { forwardRef, useId, type InputHTMLAttributes } from "react";
import { useRecentUrls } from "./recent-urls/RecentUrlsProvider";
type Props = InputHTMLAttributes<HTMLInputElement> & {
  urlKind?: "page" | "domain";
};
const ToolUrlInput = forwardRef<HTMLInputElement, Props>(function ToolUrlInput(
  { onBlur, onKeyDown, autoComplete, list, urlKind = "page", ...props },
  ref,
) {
  const { urls, remember } = useRecentUrls();
  const generated = useId();
  const id = list || `tool-urls-${generated}`;
  const save = (value: string) =>
    remember(
      urlKind === "domain" && !/^https?:\/\//i.test(value)
        ? `https://${value}`
        : value,
    );
  return (
    <>
      <input
        {...props}
        ref={ref}
        autoComplete={autoComplete ?? "url"}
        list={id}
        onBlur={(e) => {
          save(e.currentTarget.value);
          onBlur?.(e);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") save(e.currentTarget.value);
          onKeyDown?.(e);
        }}
      />
      {!list && (
        <datalist id={id}>
          {urls.map((url) => (
            <option
              key={url}
              value={urlKind === "domain" ? new URL(url).hostname : url}
            />
          ))}
        </datalist>
      )}
    </>
  );
});
export default ToolUrlInput;
