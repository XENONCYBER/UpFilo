import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

type UseGetChannelsWithGroupsProps = {
    workspaceId: Id<"workspaces">;
};

export const useGetChannelsWithGroups = ({ workspaceId }: UseGetChannelsWithGroupsProps) => {
    const data = useQuery(api.channels.getChannelsWithGroups, { workspaceId });
    const isLoading = data === undefined;

    return { data, isLoading };
};
