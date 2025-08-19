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
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading workspace...</div>
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-neomorphic-text mb-2">
                Profile
              </h2>
              <p className="text-neomorphic-text-secondary">
                Manage your profile settings
              </p>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-neomorphic-text mb-2">
                Notifications
              </h2>
              <p className="text-neomorphic-text-secondary">
                View your notifications
              </p>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-neomorphic-text mb-2">
                Settings
              </h2>
              <p className="text-neomorphic-text-secondary">
                Configure your workspace
              </p>
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
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-neomorphic-text mb-2">
                Select a Channel
              </h2>
              <p className="text-neomorphic-text-secondary">
                Choose a channel from the sidebar to start chatting
              </p>
            </div>
          </div>
        );
      default:
        return (
          children || (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-neomorphic-text mb-2">
                  Welcome to UpFilo
                </h2>
                <p className="text-neomorphic-text-secondary">
                  Select a section to get started
                </p>
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
