import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetActiveUsersWithPresenceProps {
  workspaceId: Id<"workspaces">;
  timeWindow?: number; // Time window in milliseconds
}

export const useGetActiveUsersWithPresence = ({ workspaceId, timeWindow }: UseGetActiveUsersWithPresenceProps) => {
  const data = useQuery(
    api.workspaces.getActiveUsersWithPresence, 
    { workspaceId, timeWindow }
  );
  const isLoading = data === undefined;

  return { data, isLoading };
};
