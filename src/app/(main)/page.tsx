"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCreateWorkspace } from "@/features/workspaces/api/use-create-workspaces";
import { useDeleteWorkspace } from "@/features/workspaces/api/use-delete-workspace";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoIcon } from "@/components/logo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Trash2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Id } from "../../../convex/_generated/dataModel";

export default function ModernLandingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { mutate: createWorkspace, isPending } = useCreateWorkspace();
  const { mutate: deleteWorkspace, isPending: isDeleting } =
    useDeleteWorkspace();
  const [workspaceName, setWorkspaceName] = useState("");
  const [joinWorkspaceId, setJoinWorkspaceId] = useState("");
  const [mounted, setMounted] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [finalConfirmDialogOpen, setFinalConfirmDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<{
    id: Id<"workspaces">;
    name: string;
  } | null>(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState("");

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

  const handleDeleteWorkspace = () => {
    if (!workspaceToDelete) return;

    deleteWorkspace(
      { id: workspaceToDelete.id },
      {
        onSuccess: (data) => {
          toast.success(
            `Workspace "${workspaceToDelete.name}" deleted successfully!`,
            {
              description: data
                ? `Deleted ${data.deletedChannels} channels, ${data.deletedGroups} groups, and ${data.fileUrls.length} files.`
                : undefined,
            }
          );
          setFinalConfirmDialogOpen(false);
          setDeleteDialogOpen(false);
          setWorkspaceToDelete(null);
          setDeleteConfirmationName("");
        },
        onError: (error) => {
          console.error("Error deleting workspace:", error);
          toast.error("Failed to delete workspace. Please try again.");
          setFinalConfirmDialogOpen(false);
        },
      }
    );
  };

  const handleProceedToFinalConfirm = () => {
    // Close first dialog and open second
    setDeleteDialogOpen(false);
    setFinalConfirmDialogOpen(true);
  };

  const handleCancelFinalConfirm = () => {
    // Go back to first dialog
    setFinalConfirmDialogOpen(false);
    setDeleteDialogOpen(true);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22] overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 dark:from-[#58a6ff]/10 dark:to-[#58a6ff]/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-indigo-400/15 to-purple-400/15 dark:from-[#a371f7]/10 dark:to-[#a371f7]/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 dark:from-[#58a6ff]/5 dark:to-[#3fb950]/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/80 dark:bg-[#161b22]/90 shadow-lg shadow-blue-500/10 dark:shadow-[#58a6ff]/5 backdrop-blur-sm border border-white/50 dark:border-[#30363d]">
              <LogoIcon size={32} />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-[#e6edf3] dark:to-[#8d96a0] bg-clip-text text-transparent">
              UpFilo
            </span>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl bg-white/80 dark:bg-[#161b22]/90 shadow-lg shadow-blue-500/10 dark:shadow-[#58a6ff]/5 backdrop-blur-sm border border-white/50 dark:border-[#30363d] hover:scale-105 transition-all duration-200"
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-[#58a6ff]/20 dark:to-[#58a6ff]/10 border border-blue-200/50 dark:border-[#58a6ff]/30">
                <Zap className="w-4 h-4 text-blue-600 dark:text-[#58a6ff]" />
                <span className="text-sm font-medium text-blue-700 dark:text-[#58a6ff]">
                  Real-time Team Collaboration
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-800 dark:from-[#e6edf3] dark:via-[#c9d1d9] dark:to-[#8d96a0] bg-clip-text text-transparent">
                  Collaborate
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 dark:from-[#58a6ff] dark:via-[#79c0ff] dark:to-[#a371f7] bg-clip-text text-transparent">
                  Without Limits
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 dark:text-[#8d96a0] leading-relaxed max-w-lg">
                Experience seamless team communication with UpFilo. Instant
                messaging, file sharing, and organized channels — all in one
                beautiful workspace.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-[#161b22]/80 border border-slate-200/50 dark:border-[#30363d] text-sm text-slate-600 dark:text-[#8d96a0]">
                  <MessageCircle className="w-4 h-4 text-blue-500 dark:text-[#58a6ff]" />
                  Instant Messaging
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-[#161b22]/80 border border-slate-200/50 dark:border-[#30363d] text-sm text-slate-600 dark:text-[#8d96a0]">
                  <Users className="w-4 h-4 text-cyan-500 dark:text-[#3fb950]" />
                  Team Channels
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-[#161b22]/80 border border-slate-200/50 dark:border-[#30363d] text-sm text-slate-600 dark:text-[#8d96a0]">
                  <Shield className="w-4 h-4 text-indigo-500 dark:text-[#a371f7]" />
                  Secure & Private
                </div>
              </div>
            </div>

            {/* Right Visual - Chat Preview */}
            <div className="relative">
              <div className="relative z-10">
                {/* Main Card */}
                <div className="bg-white/70 dark:bg-[#161b22]/90 backdrop-blur-xl p-6 rounded-3xl border border-white/50 dark:border-[#30363d] shadow-2xl shadow-blue-500/10 dark:shadow-[#58a6ff]/5 transform hover:scale-[1.02] transition-all duration-500">
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-200/50 dark:border-[#30363d]">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-[#58a6ff] dark:to-[#79c0ff] flex items-center justify-center shadow-lg shadow-blue-500/30 dark:shadow-[#58a6ff]/20">
                        <LogoIcon size={24} className="brightness-0 invert" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-[#e6edf3]">
                          Design Team
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-[#8d96a0]">
                          12 members • 5 online
                        </p>
                      </div>
                      <div className="ml-auto flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 dark:from-[#3fb950] dark:to-[#238636] border-2 border-white dark:border-[#161b22]" />
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 dark:from-[#d29922] dark:to-[#9e6a03] border-2 border-white dark:border-[#161b22]" />
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 dark:from-[#a371f7] dark:to-[#8957e5] border-2 border-white dark:border-[#161b22]" />
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 dark:from-[#3fb950] dark:to-[#238636] flex-shrink-0" />
                        <div className="flex-1 bg-slate-100/80 dark:bg-[#21262d] rounded-2xl rounded-tl-md p-3">
                          <p className="text-sm text-slate-700 dark:text-[#c9d1d9]">
                            Just finished the new dashboard mockups! 🎨
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 dark:from-[#d29922] dark:to-[#9e6a03] flex-shrink-0" />
                        <div className="flex-1 bg-slate-100/80 dark:bg-[#21262d] rounded-2xl rounded-tl-md p-3">
                          <p className="text-sm text-slate-700 dark:text-[#c9d1d9]">
                            Looks amazing! Ready for review? ✨
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 dark:from-[#a371f7] dark:to-[#8957e5] flex-shrink-0" />
                        <div className="flex-1 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-[#58a6ff]/10 dark:to-[#58a6ff]/5 rounded-2xl rounded-tl-md p-3 border border-blue-200/50 dark:border-[#58a6ff]/30">
                          <p className="text-sm text-slate-700 dark:text-[#c9d1d9]">
                            📎 design-system-v2.fig uploaded
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div
                  className="absolute -top-4 -right-4 w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-[#58a6ff] dark:to-[#79c0ff] flex items-center justify-center transform rotate-12 shadow-lg shadow-blue-500/30 dark:shadow-[#58a6ff]/20 animate-bounce"
                  style={{ animationDuration: "3s" }}
                >
                  <Sparkles className="w-7 h-7 text-white" />
                </div>

                <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 dark:from-[#d29922] dark:to-[#9e6a03] flex items-center justify-center transform -rotate-12 shadow-lg shadow-orange-500/30 dark:shadow-[#d29922]/20">
                  <span className="text-lg">🚀</span>
                </div>
              </div>
            </div>
          </div>

          {/* Your Workspaces */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-[#e6edf3] dark:to-[#8d96a0] bg-clip-text text-transparent mb-2">
                Your Workspaces
              </h2>
              <p className="text-slate-500 dark:text-[#8d96a0]">
                Jump back into your recent projects
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {workspaces === undefined &&
                [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-2xl bg-white/50 dark:bg-[#161b22]/50 animate-pulse"
                  />
                ))}

              {workspaces && workspaces.length === 0 && (
                <div className="col-span-full text-center p-8 rounded-2xl bg-white/50 dark:bg-[#161b22]/70 backdrop-blur-sm border border-slate-200/50 dark:border-[#30363d]">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-[#58a6ff]/20 dark:to-[#58a6ff]/10 flex items-center justify-center">
                    <LayoutGrid className="w-6 h-6 text-blue-500 dark:text-[#58a6ff]" />
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-[#e6edf3] mb-1">
                    No workspaces yet
                  </h3>
                  <p className="text-slate-500 dark:text-[#8d96a0] text-sm">
                    Create your first workspace below
                  </p>
                </div>
              )}

              {workspaces?.map(
                (workspace: {
                  _id: Id<"workspaces">;
                  customId: string;
                  name: string;
                }) => (
                  <div
                    key={workspace._id}
                    className="group relative aspect-square rounded-2xl bg-white/70 dark:bg-[#161b22]/90 backdrop-blur-sm border border-slate-200/50 dark:border-[#30363d] hover:border-blue-300 dark:hover:border-[#58a6ff]/50 transition-all duration-300 flex flex-col items-center justify-center text-center p-4 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-[#58a6ff]/5"
                  >
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setWorkspaceToDelete({
                          id: workspace._id,
                          name: workspace.name,
                        });
                        setDeleteDialogOpen(true);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/0 hover:bg-red-500/10 dark:hover:bg-[#f85149]/10 text-slate-400 dark:text-[#8d96a0] hover:text-red-500 dark:hover:text-[#f85149] opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                      title="Delete workspace"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <Link
                      href={`/${workspace.customId}`}
                      className="flex flex-col items-center justify-center w-full h-full hover:scale-105 transition-transform duration-300"
                    >
                      <div className="w-11 h-11 mb-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-[#58a6ff] dark:to-[#a371f7] flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/30 dark:group-hover:shadow-[#58a6ff]/20 transition-all duration-300">
                        <LayoutGrid className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-medium text-slate-800 dark:text-[#e6edf3] truncate w-full text-sm">
                        {workspace.name}
                      </h3>
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Workspace Actions */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-[#e6edf3] dark:to-[#8d96a0] bg-clip-text text-transparent mb-3">
                Get Started
              </h2>
              <p className="text-lg text-slate-500 dark:text-[#8d96a0]">
                Create a new workspace or join an existing team
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Create Workspace */}
              <div className="group bg-white/70 dark:bg-[#161b22]/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-[#30363d] hover:border-blue-300 dark:hover:border-[#58a6ff]/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-[#58a6ff]/5">
                <div className="text-center mb-5">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-[#58a6ff] dark:to-[#a371f7] flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/30 dark:shadow-[#58a6ff]/20">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-[#e6edf3] mb-1">
                    Create Workspace
                  </h3>
                  <p className="text-slate-500 dark:text-[#8d96a0] text-sm">
                    Start fresh with a new space
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Workspace name..."
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="h-12 pl-11 rounded-xl bg-slate-100/80 dark:bg-[#21262d] border-slate-200/50 dark:border-[#30363d] focus:border-blue-400 dark:focus:border-[#58a6ff] focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-[#58a6ff]/20 transition-all text-slate-800 dark:text-[#e6edf3] placeholder:text-slate-400 dark:placeholder:text-[#8d96a0]"
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
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-[#238636] dark:to-[#2ea043] hover:from-blue-700 hover:to-indigo-700 dark:hover:from-[#2ea043] dark:hover:to-[#3fb950] text-white font-semibold shadow-lg shadow-blue-500/30 dark:shadow-[#238636]/30 hover:shadow-blue-500/40 dark:hover:shadow-[#238636]/40 transition-all duration-300 disabled:opacity-50"
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
              <div className="group bg-white/70 dark:bg-[#161b22]/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/50 dark:border-[#30363d] hover:border-cyan-300 dark:hover:border-[#58a6ff]/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 dark:hover:shadow-[#58a6ff]/5">
                <div className="text-center mb-5">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 dark:from-[#58a6ff] dark:to-[#79c0ff] flex items-center justify-center transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-lg shadow-cyan-500/30 dark:shadow-[#58a6ff]/20">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-[#e6edf3] mb-1">
                    Join Team
                  </h3>
                  <p className="text-slate-500 dark:text-[#8d96a0] text-sm">
                    Connect with your existing workspace
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Workspace ID or name..."
                      value={joinWorkspaceId}
                      onChange={(e) => setJoinWorkspaceId(e.target.value)}
                      className="h-12 pl-11 rounded-xl bg-slate-100/80 dark:bg-[#21262d] border-slate-200/50 dark:border-[#30363d] focus:border-cyan-400 dark:focus:border-[#58a6ff] focus:ring-2 focus:ring-cyan-500/20 dark:focus:ring-[#58a6ff]/20 transition-all text-slate-800 dark:text-[#e6edf3] placeholder:text-slate-400 dark:placeholder:text-[#8d96a0]"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 dark:from-[#58a6ff] dark:to-[#79c0ff]" />
                  </div>

                  <Button
                    onClick={handleJoinWorkspace}
                    disabled={!joinWorkspaceId.trim()}
                    className="w-full h-12 rounded-xl bg-slate-100 dark:bg-[#21262d] hover:bg-slate-200 dark:hover:bg-[#30363d] text-slate-800 dark:text-[#e6edf3] font-semibold border border-slate-200/50 dark:border-[#30363d] hover:border-cyan-300 dark:hover:border-[#58a6ff]/50 transition-all duration-300 disabled:opacity-50"
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
            <div className="text-center mt-10 p-5 rounded-2xl bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-indigo-500/5 dark:from-[#58a6ff]/10 dark:via-[#58a6ff]/5 dark:to-[#a371f7]/10 border border-blue-200/30 dark:border-[#30363d]">
              <p className="text-slate-600 dark:text-[#8d96a0] text-sm">
                <span className="font-semibold text-slate-800 dark:text-[#e6edf3]">
                  Free to start
                </span>{" "}
                • No sign up required •{" "}
                <span className="font-semibold text-slate-800 dark:text-[#e6edf3]">
                  Unlimited messages
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Workspace Confirmation Dialog - Step 1: Type Name */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setDeleteConfirmationName("");
          }
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-[#161b22] border-slate-200 dark:border-[#30363d]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-[#e6edf3] flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-[#f85149]/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500 dark:text-[#f85149]" />
              </div>
              Delete Workspace
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-slate-600 dark:text-[#8d96a0]">
                <p>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-800 dark:text-[#e6edf3]">
                    "{workspaceToDelete?.name}"
                  </span>
                  ? This action cannot be undone.
                </p>
                <br />
                <span className="text-red-500 dark:text-[#f85149] font-medium">
                  This will permanently delete:
                </span>
                <ul className="mt-2 ml-4 list-disc text-sm space-y-1">
                  <li>All channels and channel groups</li>
                  <li>All messages in all channels</li>
                  <li>All uploaded files and media</li>
                  <li>All user presence data</li>
                </ul>

                {/* Confirmation Input */}
                <div className="mt-6 space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-[#c9d1d9]">
                    Type{" "}
                    <span className="font-bold text-red-500 dark:text-[#f85149]">
                      "{workspaceToDelete?.name}"
                    </span>{" "}
                    to confirm:
                  </label>
                  <Input
                    value={deleteConfirmationName}
                    onChange={(e) => setDeleteConfirmationName(e.target.value)}
                    placeholder="Enter workspace name..."
                    className="h-10 bg-slate-100/80 dark:bg-[#21262d] border-slate-200 dark:border-[#30363d] focus:border-red-400 dark:focus:border-[#f85149] focus:ring-red-500/20 dark:focus:ring-[#f85149]/20 text-slate-800 dark:text-[#e6edf3] placeholder:text-slate-400 dark:placeholder:text-[#8d96a0]"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-slate-100 dark:bg-[#21262d] hover:bg-slate-200 dark:hover:bg-[#30363d] text-slate-700 dark:text-[#c9d1d9] border-slate-200 dark:border-[#30363d]"
              onClick={() => {
                setDeleteConfirmationName("");
                setWorkspaceToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleProceedToFinalConfirm}
              disabled={deleteConfirmationName !== workspaceToDelete?.name}
              className="bg-red-500 dark:bg-[#f85149] hover:bg-red-600 dark:hover:bg-[#da3633] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Continue
              </div>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Workspace Final Confirmation Dialog - Step 2: Final Confirm */}
      <AlertDialog
        open={finalConfirmDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setFinalConfirmDialogOpen(false);
          }
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-[#161b22] border-slate-200 dark:border-[#30363d]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-[#e6edf3] flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-[#f85149]/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500 dark:text-[#f85149]" />
              </div>
              Final Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-[#8d96a0]">
              <p className="text-base">
                You are about to{" "}
                <span className="font-bold text-red-500 dark:text-[#f85149]">
                  permanently delete
                </span>{" "}
                the workspace{" "}
                <span className="font-semibold text-slate-800 dark:text-[#e6edf3]">
                  "{workspaceToDelete?.name}"
                </span>
                .
              </p>
              <br />
              <p className="text-sm bg-red-50 dark:bg-[#f85149]/10 border border-red-200 dark:border-[#f85149]/30 rounded-lg p-3 text-red-600 dark:text-[#f85149]">
                ⚠️ This action is <strong>irreversible</strong>. All data will
                be permanently lost.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={handleCancelFinalConfirm}
              className="bg-slate-100 dark:bg-[#21262d] hover:bg-slate-200 dark:hover:bg-[#30363d] text-slate-700 dark:text-[#c9d1d9] border-slate-200 dark:border-[#30363d]"
            >
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkspace}
              disabled={isDeleting}
              className="bg-red-500 dark:bg-[#f85149] hover:bg-red-600 dark:hover:bg-[#da3633] text-white disabled:opacity-50"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Yes, Delete Workspace
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
