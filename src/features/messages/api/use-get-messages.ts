import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetMessagesProps {
  channelId: Id<"channels">;
  limit?: number;
}

export const useGetMessages = ({ channelId, limit }: UseGetMessagesProps) => {
  const data = useQuery(api.messages.getMessages, { channelId, limit });
  const isLoading = data === undefined;

  return { data, isLoading };
};
