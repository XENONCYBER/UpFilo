import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetActiveUsersProps {
  workspaceId: Id<"workspaces">;
  timeWindow?: number; // Time window in milliseconds
}

export const useGetActiveUsers = ({ workspaceId, timeWindow }: UseGetActiveUsersProps) => {
  const data = useQuery(
    api.workspaces.getActiveUsers, 
    { workspaceId, timeWindow }
  );
  const isLoading = data === undefined;

  return { data, isLoading };
};
