import { useParams } from "next/navigation";
import { useGetWorkspaceByCustomId } from "@/features/workspaces/api/use-get-workspace-by-custom-id";

export const useConvexWorkspaceId = () => {
    const params = useParams();
    const customId = params.workspaceId as string;
    const { data: workspace } = useGetWorkspaceByCustomId({ customId });
    
    return workspace?._id;
};
