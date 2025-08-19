"use client";

import { useState, useEffect, useCallback } from "react";
import { ModernSidebar } from "./ModernSidebar";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { ModernChannelView } from "./ModernChannelView";
import { ModernMediaGallery } from "./ModernMediaGallery";
import { NameInputDialog } from "./name-input-dialog";
import { useUserSession } from "./user-session-provider";
import { useGetWorkspaceByCustomId } from "@/features/workspaces/api/use-get-workspace-by-custom-id";
import { useGetChannelsWithGroups } from "@/features/channels/api/use-get-channels";
import { cn } from "@/lib/utils";

interface WorkspaceLayoutProps {
  workspaceId: string; // Now expects custom ID string
  children?: React.ReactNode;
  className?: string;
}

export function WorkspaceLayout({
  workspaceId,
  children,
  className,
}: WorkspaceLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("channels");
  const [selectedChannel, setSelectedChannel] = useState<{
    id: string;
    type: "group" | "user";
  } | null>(null);

  // User session integration
  const { userName, setUserName, hasUserNameForWorkspace } = useUserSession();
  const { data: workspace, isLoading: isWorkspaceLoading } =
    useGetWorkspaceByCustomId({ customId: workspaceId });
  const { data: channelsWithGroups } = useGetChannelsWithGroups({
    workspaceId: workspace?._id!,
  });

  // Check if user has a name for this workspace
  const [shouldShowDialog, setShouldShowDialog] = useState(false);

  useEffect(() => {
    if (workspace?._id) {
      const hasName = hasUserNameForWorkspace(workspace._id);
      if (hasName) {
        // Load the existing username
        const storageKey = `upfilo-user-name-${workspace._id}`;
        const savedName = sessionStorage.getItem(storageKey);
        if (savedName && savedName !== userName) {
          setUserName(savedName);
        }
        setShouldShowDialog(false);
      } else {
        setShouldShowDialog(true);
      }
    }
  }, [workspace?._id, hasUserNameForWorkspace, userName, setUserName]);

  const handleNameSubmit = useCallback(
    async (name: string) => {
      if (workspace) {
        setUserName(name);
        // Store in sessionStorage immediately
        sessionStorage.setItem(`upfilo-user-name-${workspace._id}`, name);
        setShouldShowDialog(false);
      }
    },
    [workspace, setUserName]
  );

  // Function to get channel name from ID
  const getChannelName = (channelId: string): string => {
    if (!channelsWithGroups) return channelId;

    // Search through all grouped channels
    for (const group of channelsWithGroups.groupedChannels) {
      const channel = group.channels.find((ch: any) => ch._id === channelId);
      if (channel) return channel.name;
    }

    return channelId; // fallback to ID if not found
  };

  // Don't render if workspace is not loaded yet
  if (isWorkspaceLoading || !workspace) {
    return (
      <div className="flex h-screen items-center justify-center bg-neomorphic-bg">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-electric-blue/20 border-t-electric-blue rounded-full animate-spin mx-auto"></div>
          <div className="text-neomorphic-text-secondary font-medium">
            Loading workspace...
          </div>
        </div>
      </div>
    );
  }

  const handleChannelSelect = (
    channelId: string,
    channelType: "group" | "user"
  ) => {
    setSelectedChannel({ id: channelId, type: channelType });
    setActiveSection("channels");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "mediaGallery":
        return <ModernMediaGallery className="flex-1" />;
      case "profile":
        return (
          <div className="flex-1 flex items-center justify-center bg-neomorphic-bg">
            <div className="text-center space-y-6 max-w-md mx-auto p-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-electric-blue to-electric-purple mx-auto flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {userName?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-neomorphic-text">
                  Profile Settings
                </h2>
                <p className="text-neomorphic-text-secondary">
                  Manage your profile and workspace preferences
                </p>
              </div>
              <div className="card-glass p-6 rounded-2xl space-y-4">
                <div className="text-left space-y-2">
                  <label className="text-sm font-medium text-neomorphic-text">
                    Display Name
                  </label>
                  <div className="px-3 py-2 bg-neomorphic-surface/50 rounded-lg text-neomorphic-text">
                    {userName || "Guest User"}
                  </div>
                </div>
                <div className="text-left space-y-2">
                  <label className="text-sm font-medium text-neomorphic-text">
                    Workspace
                  </label>
                  <div className="px-3 py-2 bg-neomorphic-surface/50 rounded-lg text-neomorphic-text">
                    {workspace?.name || "Unknown Workspace"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="flex-1 flex items-center justify-center bg-neomorphic-bg">
            <div className="text-center space-y-6 max-w-md mx-auto p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-warm-orange to-coral-red mx-auto flex items-center justify-center">
                <span className="text-2xl">🔔</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-neomorphic-text">
                  Notifications
                </h2>
                <p className="text-neomorphic-text-secondary">
                  Stay updated with your workspace activity
                </p>
              </div>
              <div className="card-glass p-6 rounded-2xl">
                <div className="space-y-4">
                  <div className="text-center text-neomorphic-text-secondary">
                    No new notifications
                  </div>
                  <div className="text-sm text-neomorphic-text-secondary">
                    You're all caught up! New notifications will appear here.
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="flex-1 flex items-center justify-center bg-neomorphic-bg">
            <div className="text-center space-y-6 max-w-lg mx-auto p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-electric-purple to-electric-blue mx-auto flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-neomorphic-text">
                  Workspace Settings
                </h2>
                <p className="text-neomorphic-text-secondary">
                  Configure your workspace preferences and features
                </p>
              </div>
              <div className="grid gap-4">
                <div className="card-glass p-4 rounded-xl text-left space-y-2">
                  <h3 className="font-medium text-neomorphic-text">General</h3>
                  <p className="text-sm text-neomorphic-text-secondary">
                    Workspace name, description, and basic settings
                  </p>
                </div>
                <div className="card-glass p-4 rounded-xl text-left space-y-2">
                  <h3 className="font-medium text-neomorphic-text">Members</h3>
                  <p className="text-sm text-neomorphic-text-secondary">
                    Manage workspace members and permissions
                  </p>
                </div>
                <div className="card-glass p-4 rounded-xl text-left space-y-2">
                  <h3 className="font-medium text-neomorphic-text">
                    Integrations
                  </h3>
                  <p className="text-sm text-neomorphic-text-secondary">
                    Connect external tools and services
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case "channels":
        return selectedChannel ? (
          <ModernChannelView
            channelId={selectedChannel.id}
            channelName={getChannelName(selectedChannel.id)}
            channelType={selectedChannel.type === "user" ? "user" : "text"}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-neomorphic-bg">
            <div className="text-center space-y-6 max-w-md mx-auto p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-soft-green to-electric-blue mx-auto flex items-center justify-center">
                <span className="text-2xl"># </span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-neomorphic-text">
                  Select a Channel
                </h2>
                <p className="text-neomorphic-text-secondary">
                  Choose a channel from the sidebar to start chatting with your
                  team
                </p>
              </div>
              <div className="card-glass p-6 rounded-2xl">
                <div className="space-y-3 text-sm text-neomorphic-text-secondary">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-electric-blue rounded-full"></span>
                    Browse channels in the sidebar
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-soft-green rounded-full"></span>
                    Create new channels and groups
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-electric-purple rounded-full"></span>
                    Start conversations with team members
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          children || (
            <div className="flex-1 flex items-center justify-center bg-neomorphic-bg">
              <div className="text-center space-y-6 max-w-lg mx-auto p-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-electric-blue via-electric-purple to-soft-green mx-auto flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {workspace?.name?.charAt(0).toUpperCase() || "W"}
                  </span>
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-neomorphic-text">
                    Welcome to {workspace?.name || "UpFilo"}
                  </h2>
                  <p className="text-lg text-neomorphic-text-secondary">
                    Your collaborative workspace is ready to go
                  </p>
                </div>
                <div className="grid gap-3">
                  <button
                    onClick={() => setActiveSection("channels")}
                    className="card-glass p-4 rounded-xl text-left space-y-2 hover:scale-105 transition-transform duration-200"
                  >
                    <h3 className="font-medium text-neomorphic-text flex items-center gap-2">
                      <span className="text-electric-blue">#</span> Browse
                      Channels
                    </h3>
                    <p className="text-sm text-neomorphic-text-secondary">
                      Join conversations and collaborate with your team
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveSection("mediaGallery")}
                    className="card-glass p-4 rounded-xl text-left space-y-2 hover:scale-105 transition-transform duration-200"
                  >
                    <h3 className="font-medium text-neomorphic-text flex items-center gap-2">
                      <span className="text-soft-green">📁</span> Media Gallery
                    </h3>
                    <p className="text-sm text-neomorphic-text-secondary">
                      Explore shared files, images, and documents
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )
        );
    }
  };

  return (
    <div
      className={cn(
        "flex h-screen bg-neomorphic-bg text-neomorphic-text",
        className
      )}
    >
      <NameInputDialog
        isOpen={shouldShowDialog && !isWorkspaceLoading && !!workspace}
        onNameSubmit={handleNameSubmit}
        onClose={() => setShouldShowDialog(false)}
        workspaceName={workspace?.name}
      />
      <ModernSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onChannelSelect={handleChannelSelect}
        workspaceId={workspace?._id!}
        selectedChannelId={selectedChannel?.id}
        onCollapseChange={setSidebarCollapsed}
        className={cn(sidebarOpen ? "block" : "hidden")}
      />
      <div
        className={cn(
          "flex-1 flex flex-col h-screen transition-all duration-300",
          sidebarOpen && !sidebarCollapsed ? "ml-72" : "ml-16"
        )}
      >
        <WorkspaceHeader
          workspaceName={workspace?.name}
          currentChannel={getChannelName(selectedChannel?.id || "")}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 flex flex-col min-h-0">
          {activeSection === "channels" && selectedChannel ? (
            <ModernChannelView
              key={selectedChannel.id}
              channelId={selectedChannel.id}
              channelName={getChannelName(selectedChannel?.id || "")}
              channelType={
                channelsWithGroups?.groupedChannels
                  .flatMap((g: any) => g.channels)
                  .find((c: any) => c._id === selectedChannel.id)?.type ||
                "public"
              }
              className="flex-1"
            />
          ) : activeSection === "mediaGallery" ? (
            <ModernMediaGallery className="flex-1" />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-neomorphic-text">
                  Welcome to {workspace?.name || "your workspace"}
                </h2>
                <p className="text-neomorphic-text-secondary mt-2">
                  Select a channel to start chatting or explore the media
                  gallery.
                </p>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
