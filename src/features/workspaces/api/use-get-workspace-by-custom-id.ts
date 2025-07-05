import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface UseGetWorkspaceByCustomIdProps {
    customId: string;
};

export const useGetWorkspaceByCustomId = ({ customId } : UseGetWorkspaceByCustomIdProps) => {
    const data = useQuery(api.workspaces.getByCustomId, { customId });
    const isLoading = data === undefined;

    return { data, isLoading };
};
