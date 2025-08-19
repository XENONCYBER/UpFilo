import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function useGetWorkspaceMedia({
  workspaceId,
  mediaType = "all",
  limit,
}: {
  workspaceId: Id<"workspaces"> | null;
  mediaType?: "all" | "images" | "videos" | "audio" | "documents";
  limit?: number;
}) {
  return useQuery(
    api.messages.getWorkspaceMedia,
    workspaceId
      ? {
          workspaceId,
          mediaType,
          limit,
        }
      : "skip"
  );
}

export function useGetWorkspaceMediaStats({
  workspaceId,
}: {
  workspaceId: Id<"workspaces"> | null;
}) {
  return useQuery(
    api.messages.getWorkspaceMediaStats,
    workspaceId
      ? {
          workspaceId,
        }
      : "skip"
  );
}
