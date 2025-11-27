"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCreateWorkspace } from "@/features/workspaces/api/use-create-workspaces";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoIcon } from "@/components/logo";
import {
  Sparkles,
  ArrowRight,
  Moon,
  Sun,
  LayoutGrid,
  Users,
  Zap,
  Shield,
  MessageCircle,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function ModernLandingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { mutate: createWorkspace, isPending } = useCreateWorkspace();
  const [workspaceName, setWorkspaceName] = useState("");
  const [joinWorkspaceId, setJoinWorkspaceId] = useState("");
  const [mounted, setMounted] = useState(false);

  const workspaces = useQuery(api.workspaces.get);

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
        onSuccess: (data) => {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-indigo-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-lg shadow-blue-500/10 backdrop-blur-sm border border-white/50 dark:border-slate-700/50">
              <LogoIcon size={32} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              UpFilo
            </span>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-lg shadow-blue-500/10 backdrop-blur-sm border border-white/50 dark:border-slate-700/50 hover:scale-105 transition-all duration-200"
          >
            {mounted ? (
              theme === "dark" ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-600" />
              )
            ) : (
              <div className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 border border-blue-200/50 dark:border-blue-500/30">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Real-time Team Collaboration
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                  Collaborate
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent">
                  Without Limits
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg">
                Experience seamless team communication with UpFilo. Instant
                messaging, file sharing, and organized channels — all in one
                beautiful workspace.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-sm text-slate-600 dark:text-slate-400">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  Instant Messaging
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-sm text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4 text-cyan-500" />
                  Team Channels
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-sm text-slate-600 dark:text-slate-400">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  Secure & Private
                </div>
              </div>
            </div>

            {/* Right Visual - Chat Preview */}
            <div className="relative">
              <div className="relative z-10">
                {/* Main Card */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-slate-700/50 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 transform hover:scale-[1.02] transition-all duration-500">
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <LogoIcon size={24} className="brightness-0 invert" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                          Design Team
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          12 members • 5 online
                        </p>
                      </div>
                      <div className="ml-auto flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 border-2 border-white dark:border-slate-800" />
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-white dark:border-slate-800" />
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 border-2 border-white dark:border-slate-800" />
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex-shrink-0" />
                        <div className="flex-1 bg-slate-100/80 dark:bg-slate-700/50 rounded-2xl rounded-tl-md p-3">
                          <p className="text-sm text-slate-700 dark:text-slate-200">
                            Just finished the new dashboard mockups! 🎨
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex-shrink-0" />
                        <div className="flex-1 bg-slate-100/80 dark:bg-slate-700/50 rounded-2xl rounded-tl-md p-3">
                          <p className="text-sm text-slate-700 dark:text-slate-200">
                            Looks amazing! Ready for review? ✨
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex-shrink-0" />
                        <div className="flex-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 rounded-2xl rounded-tl-md p-3 border border-blue-200/50 dark:border-blue-500/30">
                          <p className="text-sm text-slate-700 dark:text-slate-200">
                            📎 design-system-v2.fig uploaded
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div
                  className="absolute -top-4 -right-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center transform rotate-12 shadow-lg shadow-blue-500/30 animate-bounce"
                  style={{ animationDuration: "3s" }}
                >
                  <Sparkles className="w-7 h-7 text-white" />
                </div>

                <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center transform -rotate-12 shadow-lg shadow-orange-500/30">
                  <span className="text-lg">🚀</span>
                </div>
              </div>
            </div>
          </div>

          {/* Your Workspaces */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
                Your Workspaces
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Jump back into your recent projects
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {workspaces === undefined &&
                [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-white/50 dark:bg-slate-800/50 animate-pulse"
                  />
                ))}

              {workspaces && workspaces.length === 0 && (
                <div className="col-span-full text-center p-8 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <LayoutGrid className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                    No workspaces yet
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Create your first workspace below
                  </p>
                </div>
              )}

              {workspaces?.map(
                (workspace: {
                  _id: string;
                  customId: string;
                  name: string;
                }) => (
                  <Link
                    href={`/${workspace.customId}`}
                    key={workspace._id}
                    className="group aspect-square rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 flex flex-col items-center justify-center text-center p-4 hover:shadow-xl hover:shadow-blue-500/10 hover:scale-105"
                  >
                    <div className="w-11 h-11 mb-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
                      <LayoutGrid className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-medium text-slate-800 dark:text-white truncate w-full text-sm">
                      {workspace.name}
                    </h3>
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Workspace Actions */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3">
                Get Started
              </h2>
              <p className="text-lg text-slate-500 dark:text-slate-400">
                Create a new workspace or join an existing team
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Create Workspace */}
              <div className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                <div className="text-center mb-5">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/30">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                    Create Workspace
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Start fresh with a new space
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Workspace name..."
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="h-12 pl-11 rounded-xl bg-slate-100/80 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      disabled={isPending}
                    />
                    <LogoIcon
                      size={18}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-50"
                    />
                  </div>

                  <Button
                    onClick={handleCreateWorkspace}
                    disabled={isPending || !workspaceName.trim()}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50"
                  >
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Create & Launch
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>

              {/* Join Workspace */}
              <div className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10">
                <div className="text-center mb-5">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-lg shadow-cyan-500/30">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
                    Join Team
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Connect with your existing workspace
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Workspace ID or name..."
                      value={joinWorkspaceId}
                      onChange={(e) => setJoinWorkspaceId(e.target.value)}
                      className="h-12 pl-11 rounded-xl bg-slate-100/80 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 focus:border-cyan-400 dark:focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500" />
                  </div>

                  <Button
                    onClick={handleJoinWorkspace}
                    disabled={!joinWorkspaceId.trim()}
                    className="w-full h-12 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold border border-slate-200/50 dark:border-slate-600/50 hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-all duration-300 disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Join Workspace
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="text-center mt-10 p-5 rounded-2xl bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-indigo-500/5 border border-blue-200/30 dark:border-blue-500/20">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                <span className="font-semibold text-slate-800 dark:text-white">
                  Free to start
                </span>{" "}
                • No sign up required •{" "}
                <span className="font-semibold text-slate-800 dark:text-white">
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
