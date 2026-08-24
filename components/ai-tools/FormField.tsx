import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
};

export default function FormField({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-sm font-semibold text-slate-800 dark:text-slate-100"
        >
          {label}
        </label>
        {optional && (
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Optional
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
