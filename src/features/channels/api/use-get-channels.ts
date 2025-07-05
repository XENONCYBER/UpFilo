import { useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

interface UseGetChannelsProps {
    workspaceId: Id<"workspaces">;
    type?: "group" | "user";
    groupId?: Id<"channelGroups">;
}

export const useGetChannels = ({ workspaceId, type, groupId }: UseGetChannelsProps) => {
    const data = useQuery(api.channels.get, { workspaceId, type, groupId });
    const isLoading = data === undefined;

    return { data, isLoading };
};

export const useGetChannelsWithGroups = ({ workspaceId }: { workspaceId: Id<"workspaces"> }) => {
    const data = useQuery(api.channels.getChannelsWithGroups, { workspaceId });
    const isLoading = data === undefined;

    return { data, isLoading };
};


