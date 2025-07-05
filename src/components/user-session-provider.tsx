"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface UserSessionContextType {
  userName: string | null;
  setUserName: (name: string) => void;
  clearUserName: () => void;
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

  useEffect(() => {
    // Load user name from localStorage on mount
    const savedName = localStorage.getItem("upfilo-user-name");
    if (savedName) {
      setUserNameState(savedName);
    }
  }, []);

  const setUserName = (name: string) => {
    setUserNameState(name);
    localStorage.setItem("upfilo-user-name", name);
  };

  const clearUserName = () => {
    setUserNameState(null);
    localStorage.removeItem("upfilo-user-name");
  };

  return (
    <UserSessionContext.Provider
      value={{ userName, setUserName, clearUserName }}
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
