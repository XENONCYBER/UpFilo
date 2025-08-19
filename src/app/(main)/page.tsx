"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateWorkspace } from "@/features/workspaces/api/use-create-workspaces";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, Layers, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ModernLandingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { mutate: createWorkspace, isPending } = useCreateWorkspace();
  const [workspaceName, setWorkspaceName] = useState("");
  const [joinWorkspaceId, setJoinWorkspaceId] = useState("");
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate URL-friendly custom ID from name
  const generateCustomId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleJoinWorkspace = () => {
    if (!joinWorkspaceId.trim()) {
      toast.error("Please enter a workspace ID or name");
      return;
    }
    const customId = generateCustomId(joinWorkspaceId);
    router.push(`/${customId}`);
  };

  const handleCreateWorkspace = () => {
    if (!workspaceName.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    const customId = generateCustomId(workspaceName);

    createWorkspace(
      {
        name: workspaceName,
      },
      {
        onSuccess: (workspaceId) => {
          toast.success("Workspace created successfully!");
          router.push(`/${customId}`);
        },
        onError: (error) => {
          console.error("Error creating workspace:", error);
          toast.error("Failed to create workspace. Please try again.");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-neomorphic-bg">
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="neomorphic-raised p-3 rounded-neomorphic">
              <Layers className="w-8 h-8 text-electric-blue" />
            </div>
            <span className="text-2xl font-bold text-neomorphic-text">
              UpFilo
            </span>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="btn-glass interactive-lift p-2"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-neomorphic-text mb-6 leading-tight">
              Work Better
              <span className="block gradient-primary bg-clip-text text-transparent">
                Together
              </span>
            </h1>

            <p className="text-xl text-neomorphic-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
              The modern workspace that brings your team together. Chat,
              collaborate, and create in a beautiful environment designed for
              productivity.
            </p>
          </div>

          {/* Workspace Creation Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            {/* Create Workspace */}
            <div className="card-glass p-6 morph-hover">
              <h3 className="text-lg font-semibold text-neomorphic-text mb-4">
                Create New Workspace
              </h3>
              <div className="space-y-4">
                <Input
                  placeholder="Enter workspace name..."
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="input-neomorphic"
                  disabled={isPending}
                />
                <Button
                  onClick={handleCreateWorkspace}
                  disabled={isPending || !workspaceName.trim()}
                  className="w-full btn-primary interactive-lift"
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Create Workspace
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Join Workspace */}
            <div className="card-glass p-6 morph-hover">
              <h3 className="text-lg font-semibold text-neomorphic-text mb-4">
                Join Existing Workspace
              </h3>
              <div className="space-y-4">
                <Input
                  placeholder="Enter workspace ID..."
                  value={joinWorkspaceId}
                  onChange={(e) => setJoinWorkspaceId(e.target.value)}
                  className="input-neomorphic"
                />
                <Button
                  onClick={handleJoinWorkspace}
                  disabled={!joinWorkspaceId.trim()}
                  className="w-full btn-neomorphic interactive-lift"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Join Workspace
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
