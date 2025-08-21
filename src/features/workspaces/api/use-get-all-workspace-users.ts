import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetAllWorkspaceUsersProps {
  workspaceId: Id<"workspaces">;
}

export const useGetAllWorkspaceUsers = ({ workspaceId }: UseGetAllWorkspaceUsersProps) => {
  const data = useQuery(
    api.workspaces.getAllWorkspaceUsers, 
    workspaceId ? { workspaceId } : "skip"
  );
  const isLoading = data === undefined;

  return { data: data || [], isLoading };
};
