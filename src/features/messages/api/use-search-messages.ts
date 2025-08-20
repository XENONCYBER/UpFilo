import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseSearchMessagesProps {
  channelId?: Id<"channels"> | null;
  searchQuery: string;
  limit?: number;
}

export const useSearchMessages = ({ channelId, searchQuery, limit }: UseSearchMessagesProps) => {
  const data = useQuery(
    api.messages.searchMessages, 
    channelId && searchQuery.trim() ? { channelId, searchQuery, limit } : "skip"
  );
  const isLoading = data === undefined;

  return { data: data || [], isLoading };
};

interface UseSearchWorkspaceMessagesProps {
  workspaceId?: Id<"workspaces"> | null;
  searchQuery: string;
  limit?: number;
}

export const useSearchWorkspaceMessages = ({ workspaceId, searchQuery, limit }: UseSearchWorkspaceMessagesProps) => {
  const data = useQuery(
    api.messages.searchWorkspaceMessages, 
    workspaceId && searchQuery.trim() ? { workspaceId, searchQuery, limit } : "skip"
  );
  const isLoading = data === undefined;

  return { data: data || [], isLoading };
};

interface UseSearchWorkspaceFilesProps {
  workspaceId?: Id<"workspaces"> | null;
  searchQuery: string;
  fileType?: "all" | "images" | "videos" | "audio" | "documents";
  limit?: number;
}

export const useSearchWorkspaceFiles = ({ workspaceId, searchQuery, fileType = "all", limit }: UseSearchWorkspaceFilesProps) => {
  const data = useQuery(
    api.messages.searchWorkspaceFiles, 
    workspaceId && searchQuery.trim() ? { workspaceId, searchQuery, fileType, limit } : "skip"
  );
  const isLoading = data === undefined;

  return { data: data || [], isLoading };
};
