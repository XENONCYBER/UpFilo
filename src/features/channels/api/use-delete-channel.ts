import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCallback, useMemo, useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

type RequestType = { 
    id: Id<"channels">;
};

type ResponseType = {
    channelId: Id<"channels">;
    fileUrls: string[];
} | null;

type Options = {
    onSuccess?: (data: ResponseType) => void;
    onError?: (error: Error) => void;
    onSettled?: () => void;
    throwError?: boolean;
};

// Helper function to delete files from Backblaze
async function cleanupFiles(fileUrls: string[]) {
    if (fileUrls.length === 0) return;
    
    try {
        const response = await fetch('/api/deleteFiles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileUrls }),
        });
        
        if (!response.ok) {
            console.error('Failed to cleanup files from storage');
        } else {
            const result = await response.json();
            console.log(`Cleaned up ${result.deletedCount} files from storage`);
        }
    } catch (error) {
        console.error('Error cleaning up files:', error);
    }
}

export const useDeleteChannel = () => {
    const [data, setData] = useState<ResponseType>(null);
    const [error, setError] = useState<Error | null>(null);
    const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null);

    const isPending = useMemo(() => status === "pending", [status]);
    const isSuccess = useMemo(() => status === "success", [status]);
    const isError = useMemo(() => status === "error", [status]);
    const isSettled = useMemo(() => status === "settled", [status]);

    const mutation = useMutation(api.channels.remove);

    const mutate = useCallback(async (values: RequestType, options?: Options) => {
        try {
            setStatus("pending");
            setData(null);
            setError(null);
            const response = await mutation(values);
            setData(response);
            setStatus("success");
            
            // Cleanup files from Backblaze storage (fire and forget)
            if (response?.fileUrls && response.fileUrls.length > 0) {
                cleanupFiles(response.fileUrls);
            }
            
            options?.onSuccess?.(response);
            return response;
        } catch (error) {
            setStatus("error");
            setError(error as Error);
            options?.onError?.(error as Error);
            if (options?.throwError) {
                throw error;
            }
        } finally {
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
