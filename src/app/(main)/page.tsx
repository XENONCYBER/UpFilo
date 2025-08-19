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
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-electric-blue/10 to-electric-purple/10 border border-electric-blue/20">
                <Sparkles className="w-4 h-4 text-electric-blue" />
                <span className="text-sm font-medium text-electric-blue">
                  Transform Your Team Communication
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-neomorphic-text">Elevate Your</span>
                <br />
                <span className="bg-gradient-to-r from-electric-blue to-electric-purple bg-clip-text text-transparent">
                  Team Experience
                </span>
              </h1>

              <p className="text-lg md:text-xl text-neomorphic-text-secondary leading-relaxed max-w-lg">
                Experience seamless collaboration with UpFilo's intelligent
                workspace. Where conversations flow naturally, files organize
                themselves, and productivity meets intuitive design.
              </p>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative z-10">
                {/* Main Card */}
                <div className="card-glass p-8 rounded-3xl border border-neomorphic-border/20 transform rotate-3 hover:rotate-1 transition-transform duration-300">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-electric-blue to-electric-purple flex items-center justify-center">
                        <Layers className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neomorphic-text">
                          Design Team
                        </h3>
                        <p className="text-sm text-neomorphic-text-secondary">
                          12 members online
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-soft-green"></div>
                        <div className="flex-1 bg-neomorphic-surface/50 rounded-2xl p-3">
                          <p className="text-sm text-neomorphic-text">
                            Just finished the new dashboard mockups! 🎨
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-warm-orange"></div>
                        <div className="flex-1 bg-neomorphic-surface/50 rounded-2xl p-3">
                          <p className="text-sm text-neomorphic-text">
                            Looks amazing! Ready for review?
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-electric-purple"></div>
                        <div className="flex-1 bg-electric-blue/10 rounded-2xl p-3 border border-electric-blue/20">
                          <p className="text-sm text-neomorphic-text">
                            Files shared: design-system-v2.fig
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-gradient-to-r from-soft-green to-electric-blue card-glass flex items-center justify-center transform -rotate-12 animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>

                <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-gradient-to-r from-warm-orange to-coral-red card-glass flex items-center justify-center transform rotate-12">
                  <div className="text-2xl">🚀</div>
                </div>
              </div>

              {/* Background Decorations */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-electric-blue/5 blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-electric-purple/5 blur-3xl"></div>
              </div>
            </div>
          </div>

          {/* Workspace Actions */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-neomorphic-text mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-neomorphic-text-secondary">
                Create your workspace in seconds or join an existing team
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Create Workspace */}
              <div className="group card-glass p-8 rounded-3xl morph-hover border-2 border-transparent hover:border-electric-blue/20 transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-electric-blue to-electric-purple flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neomorphic-text mb-2">
                    Create Workspace
                  </h3>
                  <p className="text-neomorphic-text-secondary">
                    Start fresh with a new collaborative space
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Enter your workspace name..."
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="input-neomorphic pl-12 py-6 text-lg rounded-2xl border-2 focus:border-electric-blue/50"
                      disabled={isPending}
                    />
                    <Layers className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neomorphic-text-secondary" />
                  </div>

                  <Button
                    onClick={handleCreateWorkspace}
                    disabled={isPending || !workspaceName.trim()}
                    className="w-full btn-primary interactive-lift py-6 text-lg font-semibold rounded-2xl"
                  >
                    {isPending ? (
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 animate-spin" />
                        Creating Your Space...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5" />
                        Create & Launch
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {/* Join Workspace */}
              <div className="group card-glass p-8 rounded-3xl morph-hover border-2 border-transparent hover:border-soft-green/20 transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-soft-green to-electric-blue flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-neomorphic-text mb-2">
                    Join Team
                  </h3>
                  <p className="text-neomorphic-text-secondary">
                    Connect with your existing workspace
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Enter workspace ID or name..."
                      value={joinWorkspaceId}
                      onChange={(e) => setJoinWorkspaceId(e.target.value)}
                      className="input-neomorphic pl-12 py-6 text-lg rounded-2xl border-2 focus:border-soft-green/50"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full bg-soft-green"></div>
                  </div>

                  <Button
                    onClick={handleJoinWorkspace}
                    disabled={!joinWorkspaceId.trim()}
                    className="w-full btn-neomorphic interactive-lift py-6 text-lg font-semibold rounded-2xl hover:bg-soft-green/10"
                  >
                    <div className="flex items-center gap-3">
                      <ArrowRight className="w-5 h-5" />
                      Join Workspace
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-center mt-12 p-6 rounded-2xl bg-gradient-to-r from-electric-blue/5 to-electric-purple/5 border border-electric-blue/10">
              <p className="text-neomorphic-text-secondary">
                <span className="font-semibold text-neomorphic-text">
                  Free to start
                </span>{" "}
                • No sign up required •
                <span className="font-semibold text-neomorphic-text">
                  {" "}
                  Unlimited messages
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
