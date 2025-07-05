import { useMutation } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { useCallback, useMemo, useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

type RequestType = { 
    groupId: Id<"channelGroups">;
};

type ResponseType = void;

type Options = {
    onSuccess?: (data: ResponseType) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
};

export const useDeleteChannelGroup = () => {
    const [data, setData] = useState<ResponseType>(undefined); 
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);

    const isPending= useMemo(() => status === "pending", [status]);
    const isSuccess= useMemo(() => status === "success", [status]);
    const isError= useMemo(() => status === "error", [status]);
    const isSettled= useMemo(() => status === "settled", [status]);

    const mutation = useMutation(api.channelGroups.deleteChannelGroup);

    const mutate = useCallback(async(values: RequestType, options?: Options) => {
        try{
            setStatus("pending");
            setData(undefined);
            setError(null);
            await mutation(values);
            setStatus("success");
            options?.onSuccess?.();
            return;
        } catch (error){
            setStatus("error");
            setError(error as Error);
            options?.onError?.(error as Error);
            if (options?.throwError) {
                throw error;
            }
        } finally{
            setStatus("settled");
            options?.onSettled?.();
        }
    }, [mutation]);

    return { 
        mutate,
        data,
        error,
        isPending,
        isSuccess,
        isError,
        isSettled,
    };
};
