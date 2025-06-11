"use client";
import { CacheProvider } from './CacheContext';

export default function ClientCacheProvider({ children }) {
  return (
    <CacheProvider>
      {children}
    </CacheProvider>
  );
}