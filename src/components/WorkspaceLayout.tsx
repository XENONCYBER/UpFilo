"use client";

import { useState } from "react";
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
  const { userName, setUserName } = useUserSession();
  const { data: workspace, isLoading: isWorkspaceLoading } =
    useGetWorkspaceByCustomId({ customId: workspaceId });
  const { data: channelsWithGroups } = useGetChannelsWithGroups({
    workspaceId: workspace?._id!,
  });

  const handleNameSubmit = async (name: string) => {
    setUserName(name);
  };

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
        return <ModernMediaGallery />;
      case "profile":
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Profile
              </h2>
              <p className="text-muted-foreground">
                Manage your profile settings
              </p>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Notifications
              </h2>
              <p className="text-muted-foreground">View your notifications</p>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Settings
              </h2>
              <p className="text-muted-foreground">Configure your workspace</p>
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
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Select a Channel
              </h2>
              <p className="text-muted-foreground">
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
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Welcome to UpFilo
                </h2>
                <p className="text-muted-foreground">
                  Select a section to get started
                </p>
              </div>
            </div>
          )
        );
    }
  };

  return (
    <div className={cn("flex h-screen liquid-bg", className)}>
      {/* Sidebar */}
      <ModernSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onChannelSelect={handleChannelSelect}
        workspaceId={workspace._id}
        onCollapseChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col overflow-hidden transition-all duration-300",
          sidebarOpen ? (sidebarCollapsed ? "md:ml-16" : "md:ml-72") : "md:ml-0"
        )}
      >
        {/* Header */}
        <WorkspaceHeader
          workspaceName={workspace.name || "UpFilo Workspace"}
          currentChannel={
            selectedChannel ? getChannelName(selectedChannel.id) : undefined
          }
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Content Area */}
        <main className="glass-surface flex-1 overflow-hidden p-4 m-4 rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-glass">
          {renderContent()}
        </main>
      </div>

      {/* Name Input Dialog */}
      <NameInputDialog
        isOpen={!userName}
        onNameSubmit={handleNameSubmit}
        workspaceName={workspace.name || "UpFilo"}
      />
    </div>
  );
}
