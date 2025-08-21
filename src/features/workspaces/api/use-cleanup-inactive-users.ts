import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const useCleanupInactiveUsers = () => {
  const mutation = useMutation(api.workspaces.cleanupInactiveUsers);
  
  const cleanupInactiveUsers = (workspaceId: Id<"workspaces">, inactivityThreshold?: number) => {
    return mutation({ workspaceId, inactivityThreshold });
  };

  return { cleanupInactiveUsers };
};
