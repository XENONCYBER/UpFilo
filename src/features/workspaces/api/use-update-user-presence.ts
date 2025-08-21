import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseUpdateUserPresenceProps {
  userName: string;
  workspaceId: Id<"workspaces">;
  status: "online" | "offline" | "away";
  currentChannel?: Id<"channels">;
}

export const useUpdateUserPresence = () => {
  const mutation = useMutation(api.workspaces.updateUserPresence);
  
  const updatePresence = ({ userName, workspaceId, status, currentChannel }: UseUpdateUserPresenceProps) => {
    return mutation({ userName, workspaceId, status, currentChannel });
  };

  return { updatePresence };
};
