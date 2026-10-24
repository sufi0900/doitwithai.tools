import type { ReactNode } from "react";
import WorkspaceProvider from "@/features/tools-workspace/WorkspaceProvider";
import ToolsShell from "@/features/tools-workspace/ToolsShell";
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <ToolsShell>{children}</ToolsShell>
    </WorkspaceProvider>
  );
}
