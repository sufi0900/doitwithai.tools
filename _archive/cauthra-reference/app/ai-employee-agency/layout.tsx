import React from 'react';

export default function AiAgencyV5Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="agency-v5-font-root h-full min-h-0"
      style={
        {
          '--font-jakarta':
            'var(--font-inter), system-ui, -apple-system, sans-serif',
          '--font-jetbrains-mono':
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontFamily:
            'var(--font-jakarta), var(--font-inter), system-ui, -apple-system, sans-serif',
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
