"use client";

import React, { createContext, useContext } from "react";

export interface TransferredToolRuntimeValue {
  isTransferredTool: boolean;
  siteSlug?: string;
  siteName?: string;
  publicBasePath?: string;
  projectSlug?: string;
  projectTitle?: string;
  accentHex?: string;
  backgroundHex?: string;
  themeMode?: "light" | "dark";
}

const TransferredToolRuntimeContext = createContext<TransferredToolRuntimeValue | null>(null);

export function TransferredToolRuntimeProvider({
  value,
  children,
}: {
  value: TransferredToolRuntimeValue;
  children: React.ReactNode;
}) {
  return (
    <TransferredToolRuntimeContext.Provider value={value}>
      {children}
    </TransferredToolRuntimeContext.Provider>
  );
}

export function useTransferredToolRuntime(): TransferredToolRuntimeValue | null {
  return useContext(TransferredToolRuntimeContext);
}
