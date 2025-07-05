"use client";

import { WorkspaceLayout } from "@/components/WorkspaceLayout";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

export default function WorkspacePage() {
  const workspaceId = useWorkspaceId();

  return <WorkspaceLayout workspaceId={workspaceId} />;
}
