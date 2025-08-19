"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface UserSessionContextType {
  userName: string | null;
  setUserName: (name: string) => void;
  clearUserName: () => void;
  hasUserNameForWorkspace: (workspaceId: string) => boolean;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(
  undefined
);

export function UserSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserNameState] = useState<string | null>(null);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(
    null
  );

  const getStorageKey = (workspaceId: string) =>
    `upfilo-user-name-${workspaceId}`;

  const setUserName = (name: string) => {
    setUserNameState(name);
    if (currentWorkspaceId) {
      sessionStorage.setItem(getStorageKey(currentWorkspaceId), name);
    }
  };

  const clearUserName = () => {
    setUserNameState(null);
    if (currentWorkspaceId) {
      sessionStorage.removeItem(getStorageKey(currentWorkspaceId));
    }
  };

  const hasUserNameForWorkspace = (workspaceId: string): boolean => {
    const savedName = sessionStorage.getItem(getStorageKey(workspaceId));
    return !!savedName;
  };

  const loadUserNameForWorkspace = (workspaceId: string) => {
    const savedName = sessionStorage.getItem(getStorageKey(workspaceId));
    if (savedName) {
      setUserNameState(savedName);
    } else {
      setUserNameState(null);
    }
    setCurrentWorkspaceId(workspaceId);
  };

  return (
    <UserSessionContext.Provider
      value={{ userName, setUserName, clearUserName, hasUserNameForWorkspace }}
    >
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  const context = useContext(UserSessionContext);
  if (context === undefined) {
    throw new Error("useUserSession must be used within a UserSessionProvider");
  }
  return context;
}

// Export the loadUserNameForWorkspace function separately
export function useWorkspaceUserSession(workspaceId: string) {
  const context = useContext(UserSessionContext);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    if (workspaceId && !hasLoaded) {
      // Load username for this workspace
      const storageKey = `upfilo-user-name-${workspaceId}`;
      const savedName = sessionStorage.getItem(storageKey);
      if (savedName) {
        context?.setUserName(savedName);
      }
      setHasLoaded(true);
    }
  }, [workspaceId, context, hasLoaded]);

  return context;
}
