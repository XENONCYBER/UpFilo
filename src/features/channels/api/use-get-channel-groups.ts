import { useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

interface UseGetChannelGroupsProps {
    workspaceId: Id<"workspaces">;
    type?: "group" | "user";
}

export const useGetChannelGroups = ({ workspaceId, type }: UseGetChannelGroupsProps) => {
    const data = useQuery(api.channelGroups.getChannelGroups, { workspaceId, type });
    const isLoading = data === undefined;

    return { data, isLoading };
};
