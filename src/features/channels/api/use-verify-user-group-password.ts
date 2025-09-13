import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function useVerifyUserGroupPassword() {
  const mutation = useMutation(api.channelGroups.verifyUserGroupPassword);
  return (groupId: Id<"channelGroups">, password: string) =>
    mutation({ groupId, password });
}