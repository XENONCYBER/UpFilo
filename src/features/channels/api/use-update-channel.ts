import { useMutation } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { useCallback, useMemo, useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

type RequestType = { name: string; id: Id<"channels"> };
type ResponseType = Id<"channels"> | null;

type Options = {
    onSuccess?: (data: ResponseType) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
};

export const useUpdateChannel = (options: Options = {}) => {
    const [data, setData] = useState<ResponseType>(null); 
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);

    // const [isPending, setIsPending] = useState(false);
    // const [isSuccess, setIsSuccess] = useState(false);
    // const [isError, setIsError] = useState(false);
    // const [ isSettled, setIsSettled ] = useState(false);
    
    const isPending= useMemo(() => status === "pending", [status]);
    const isSuccess= useMemo(() => status === "success", [status]);
    const isError= useMemo(() => status === "error", [status]);
    const isSettled= useMemo(() => status === "settled", [status]);

    const mutation = useMutation(api.channels.update);

    const mutate = useCallback(async(values: RequestType, options?: Options) => {
        try{
            setStatus("pending");
            setData(null);
            setError(null);
            const response = await mutation(values);
            options?.onSuccess?.(response);
            return response;
        } catch (error){
            setStatus("error");
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