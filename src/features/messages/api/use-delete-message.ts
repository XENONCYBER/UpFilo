import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useCallback, useMemo, useState } from "react";

export const useDeleteMessage = () => {
  const [data, setData] = useState<Id<"messages"> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<"success" | "error" | "pending" | "idle">("idle");

  const isPending = useMemo(() => status === "pending", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSettled = useMemo(() => status === "success" || status === "error", [status]);

  const mutation = useMutation(api.messages.deleteMessage);

  const mutate = useCallback(
    async (values: { 
      messageId: Id<"messages">;
      userName: string; 
    }) => {
      try {
        setData(null);
        setError(null);
        setStatus("pending");

        const response = await mutation({
          messageId: values.messageId,
          userName: values.userName,
        });

        setData(response);
        setStatus("success");
        return response;
      } catch (error) {
        setError(error as Error);
        setStatus("error");
        throw error;
      }
    },
    [mutation]
  );

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
