"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  console.warn("NEXT_PUBLIC_CONVEX_URL is not set. Convex functionality will not be available.");
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convexUrl || convexUrl.includes('your-project-name')) {
    // Return children without Convex provider if URL is not properly configured
    // This allows the app to run without Convex during development
    return <>{children}</>;
  }

  try {
    const convex = new ConvexReactClient(convexUrl);
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  } catch (error) {
    console.error("Failed to initialize Convex client:", error);
    // Return children without Convex provider if initialization fails
    return <>{children}</>;
  }
}
