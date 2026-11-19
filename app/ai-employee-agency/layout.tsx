import React from 'react';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  variable: '--font-jakarta',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'monospace'],
  variable: '--font-jetbrains-mono',
});

export default function AiAgencyV5Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} agency-v5-font-root`}
      style={{
        fontFamily:
          'var(--font-jakarta), var(--font-inter), system-ui, -apple-system, sans-serif',
      }}
    >
      {children}
    </div>
  );
}
