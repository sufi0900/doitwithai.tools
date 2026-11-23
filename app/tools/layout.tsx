import type { ReactNode } from "react";
import WorkspaceProvider from "@/features/tools-workspace/WorkspaceProvider";
import RecentUrlsProvider from "@/features/tool-ui/recent-urls/RecentUrlsProvider";
import ToolsShell from "@/features/tools-workspace/ToolsShell";
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <RecentUrlsProvider>
      <WorkspaceProvider>
        <ToolsShell>{children}</ToolsShell>
      </WorkspaceProvider>
    </RecentUrlsProvider>
  );
}
