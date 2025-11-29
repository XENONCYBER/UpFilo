"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./sidebar";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { ChannelView } from "./channel-view";
import { MediaGallery } from "./media-gallery";
import { NameInputDialog } from "./name-input-dialog";
import { SearchModal } from "./SearchModal";
import { useUserSession } from "./user-session-provider";
import { useGetWorkspaceByCustomId } from "@/features/workspaces/api/use-get-workspace-by-custom-id";
import { useGetChannelsWithGroups } from "@/features/channels/api/use-get-channels";
import { useUpdateUserPresence } from "@/features/workspaces/api/use-update-user-presence";
import { useCleanupInactiveUsers } from "@/features/workspaces/api/use-cleanup-inactive-users";
import { getUserColor, getUserInitials } from "@/lib/user-colors";
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
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);
  const [selectedChannel, setSelectedChannel] = useState<{
    id: string;
    type: "group" | "user";
  } | null>(null);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Don't auto-close sidebar on resize if a dialog or menu is open (keyboard opening on mobile triggers resize)
      const hasOpenDialog = document.querySelector(
        '[role="dialog"], [role="alertdialog"], [role="menu"], [data-state="open"]'
      );

      if (mobile && !hasOpenDialog) {
        setSidebarOpen(false);
        setSidebarCollapsed(false);
      } else if (!mobile) {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // User session integration
  const { userName, setUserName, hasUserNameForWorkspace } = useUserSession();
  const { data: workspace, isLoading: isWorkspaceLoading } =
    useGetWorkspaceByCustomId({ customId: workspaceId });
  const { data: channelsWithGroups } = useGetChannelsWithGroups({
    workspaceId: workspace?._id!,
  });

  // User presence tracking
  const { updatePresence } = useUpdateUserPresence();
  const { cleanupInactiveUsers } = useCleanupInactiveUsers();

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

  // Update user presence when user session is established
  useEffect(() => {
    if (workspace?._id && userName && !shouldShowDialog) {
      const updateUserPresenceStatus = async () => {
        try {
          await updatePresence({
            userName,
            workspaceId: workspace._id,
            status: "online",
          });
        } catch (error) {
          console.error("Failed to update user presence:", error);
        }
      };

      updateUserPresenceStatus();

      // Set up periodic presence updates every 30 seconds
      const presenceInterval = setInterval(updateUserPresenceStatus, 30000);

      // Set up cleanup of inactive users every 2 minutes
      const cleanupInterval = setInterval(
        () => {
          cleanupInactiveUsers(workspace._id, 5 * 60 * 1000) // 5 minutes threshold
            .catch((error) =>
              console.error("Failed to cleanup inactive users:", error)
            );
        },
        2 * 60 * 1000
      ); // Every 2 minutes

      // Update presence to offline when user leaves
      const handleBeforeUnload = () => {
        updatePresence({
          userName,
          workspaceId: workspace._id,
          status: "offline",
        });
      };

      // Handle visibility changes (tab switching, minimizing)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          // User switched away - set to away
          updatePresence({
            userName,
            workspaceId: workspace._id,
            status: "away",
          });
        } else {
          // User returned - set to online
          updatePresence({
            userName,
            workspaceId: workspace._id,
            status: "online",
          });
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Cleanup
      return () => {
        clearInterval(presenceInterval);
        clearInterval(cleanupInterval);
        window.removeEventListener("beforeunload", handleBeforeUnload);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        // Set user to offline when component unmounts
        updatePresence({
          userName,
          workspaceId: workspace._id,
          status: "offline",
        });
      };
    }
  }, [workspace?._id, userName, shouldShowDialog, updatePresence]);

  const handleNameSubmit = useCallback(
    async (name: string) => {
      if (workspace) {
        setUserName(name);
        // Store in sessionStorage immediately
        sessionStorage.setItem(`upfilo-user-name-${workspace._id}`, name);
        setShouldShowDialog(false);

        // Update user presence to "online" when they join
        try {
          await updatePresence({
            userName: name,
            workspaceId: workspace._id,
            status: "online",
          });
        } catch (error) {
          console.error("Failed to update user presence:", error);
        }
      }
    },
    [workspace, setUserName, updatePresence]
  );

  // Keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (event.key === "Escape") {
        setIsSearchModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22]">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-200 dark:border-[#30363d] border-t-blue-500 dark:border-t-[#58a6ff] rounded-full animate-spin mx-auto"></div>
          <div className="text-slate-500 dark:text-[#8d96a0] font-medium">
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

    // Update user presence with current channel
    if (workspace?._id && userName) {
      updatePresence({
        userName,
        workspaceId: workspace._id,
        status: "online",
        currentChannel: channelId as any, // Type assertion for now
      }).catch((error) => {
        console.error("Failed to update presence with channel:", error);
      });
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "mediaGallery":
        return <MediaGallery className="flex-1" />;
      case "profile":
        return (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22]">
            <div className="text-center space-y-6 max-w-md mx-auto p-8">
              <div
                className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg"
                style={{ backgroundColor: getUserColor(userName || "U") }}
              >
                <span className="text-2xl font-bold text-white">
                  {getUserInitials(userName || "U")}
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-[#e6edf3] dark:to-[#8d96a0] bg-clip-text text-transparent">
                  Profile Settings
                </h2>
                <p className="text-slate-500 dark:text-[#8d96a0]">
                  Manage your profile and workspace preferences
                </p>
              </div>
              <div className="bg-white/70 dark:bg-[#161b22]/90 backdrop-blur-xl p-6 rounded-2xl space-y-4 border border-slate-200/50 dark:border-[#30363d] shadow-xl">
                <div className="text-left space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-[#c9d1d9]">
                    Display Name
                  </label>
                  <div className="px-3 py-2 bg-slate-100/80 dark:bg-[#21262d] rounded-lg text-slate-800 dark:text-[#c9d1d9]">
                    {userName || "Guest User"}
                  </div>
                </div>
                <div className="text-left space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-[#c9d1d9]">
                    Workspace
                  </label>
                  <div className="px-3 py-2 bg-slate-100/80 dark:bg-[#21262d] rounded-lg text-slate-800 dark:text-[#c9d1d9]">
                    {workspace?.name || "Unknown Workspace"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22]">
            <div className="text-center space-y-6 max-w-md mx-auto p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 dark:from-[#d29922] dark:to-[#9e6a03] mx-auto flex items-center justify-center shadow-lg shadow-orange-500/30 dark:shadow-[#d29922]/20">
                <span className="text-2xl">🔔</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-[#e6edf3] dark:to-[#8d96a0] bg-clip-text text-transparent">
                  Notifications
                </h2>
                <p className="text-slate-500 dark:text-[#8d96a0]">
                  Stay updated with your workspace activity
                </p>
              </div>
              <div className="bg-white/70 dark:bg-[#161b22]/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/50 dark:border-[#30363d] shadow-xl">
                <div className="space-y-4">
                  <div className="text-center text-slate-500 dark:text-[#8d96a0]">
                    No new notifications
                  </div>
                  <div className="text-sm text-slate-400 dark:text-[#6e7681]">
                    You're all caught up! New notifications will appear here.
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22]">
            <div className="text-center space-y-6 max-w-lg mx-auto p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-[#a371f7] dark:to-[#8957e5] mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 dark:shadow-[#a371f7]/20">
                <span className="text-2xl">⚙️</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-[#e6edf3] dark:to-[#8d96a0] bg-clip-text text-transparent">
                  Workspace Settings
                </h2>
                <p className="text-slate-500 dark:text-[#8d96a0]">
                  Configure your workspace preferences and features
                </p>
              </div>
              <div className="grid gap-4">
                <div className="bg-white/70 dark:bg-[#161b22]/90 backdrop-blur-xl p-4 rounded-xl text-left space-y-2 border border-slate-200/50 dark:border-[#30363d] hover:border-blue-300 dark:hover:border-[#58a6ff]/50 transition-colors shadow-lg">
                  <h3 className="font-medium text-slate-800 dark:text-[#e6edf3]">
                    General
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-[#8d96a0]">
                    Workspace name, description, and basic settings
                  </p>
                </div>
                <div className="bg-white/70 dark:bg-[#161b22]/90 backdrop-blur-xl p-4 rounded-xl text-left space-y-2 border border-slate-200/50 dark:border-[#30363d] hover:border-blue-300 dark:hover:border-[#58a6ff]/50 transition-colors shadow-lg">
                  <h3 className="font-medium text-slate-800 dark:text-[#e6edf3]">
                    Members
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-[#8d96a0]">
                    Manage workspace members and permissions
                  </p>
                </div>
                <div className="bg-white/70 dark:bg-[#161b22]/90 backdrop-blur-xl p-4 rounded-xl text-left space-y-2 border border-slate-200/50 dark:border-[#30363d] hover:border-blue-300 dark:hover:border-[#58a6ff]/50 transition-colors shadow-lg">
                  <h3 className="font-medium text-slate-800 dark:text-[#e6edf3]">
                    Integrations
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-[#8d96a0]">
                    Connect external tools and services
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case "channels":
        return selectedChannel ? (
          <ChannelView
            channelId={selectedChannel.id}
            channelName={getChannelName(selectedChannel.id)}
            channelType={selectedChannel.type === "user" ? "user" : "text"}
            highlightedMessageId={highlightedMessageId}
            onHighlightClear={() => setHighlightedMessageId(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22]">
            <div className="text-center space-y-6 max-w-md mx-auto p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-[#58a6ff] dark:to-[#79c0ff] mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 dark:shadow-[#58a6ff]/20">
                <span className="text-2xl text-white font-bold">#</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-[#e6edf3] dark:to-[#8d96a0] bg-clip-text text-transparent">
                  Select a Channel
                </h2>
                <p className="text-slate-500 dark:text-[#8d96a0]">
                  Choose a channel from the sidebar to start chatting with your
                  team
                </p>
              </div>
              <div className="bg-white/70 dark:bg-[#161b22]/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/50 dark:border-[#30363d] shadow-xl">
                <div className="space-y-3 text-sm text-slate-600 dark:text-[#8d96a0]">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-blue-500 dark:bg-[#58a6ff] rounded-full"></span>
                    Browse channels in the sidebar
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-emerald-500 dark:bg-[#3fb950] rounded-full"></span>
                    Create new channels and groups
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-indigo-500 dark:bg-[#a371f7] rounded-full"></span>
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
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22]">
              <div className="text-center space-y-6 max-w-lg mx-auto p-8">
                {userName && (
                  <div className="text-center">
                    <div
                      className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg"
                      style={{ backgroundColor: getUserColor(userName) }}
                    >
                      <span className="text-3xl font-bold text-white">
                        {getUserInitials(userName)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-[#e6edf3] dark:to-[#8d96a0] bg-clip-text text-transparent">
                    Welcome to {workspace?.name || "UpFilo"}
                  </h2>
                  <p className="text-lg text-slate-500 dark:text-[#8d96a0]">
                    {userName ? `Hello ${userName}! Your` : "Your"}{" "}
                    collaborative workspace is ready to go
                  </p>
                </div>
                <div className="grid gap-3">
                  <button
                    onClick={() => setActiveSection("channels")}
                    className="bg-white/70 dark:bg-[#161b22]/90 backdrop-blur-xl p-4 rounded-xl text-left space-y-2 border border-slate-200/50 dark:border-[#30363d] hover:border-blue-300 dark:hover:border-[#58a6ff]/50 hover:shadow-lg transition-all duration-200"
                  >
                    <h3 className="font-medium text-slate-800 dark:text-[#e6edf3] flex items-center gap-2">
                      <span className="text-blue-500 dark:text-[#58a6ff]">
                        #
                      </span>{" "}
                      Browse Channels
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-[#8d96a0]">
                      Join conversations and collaborate with your team
                    </p>
                  </button>
                  <button
                    onClick={() => setActiveSection("mediaGallery")}
                    className="bg-white/70 dark:bg-[#161b22]/90 backdrop-blur-xl p-4 rounded-xl text-left space-y-2 border border-slate-200/50 dark:border-[#30363d] hover:border-emerald-300 dark:hover:border-[#3fb950]/50 hover:shadow-lg transition-all duration-200"
                  >
                    <h3 className="font-medium text-slate-800 dark:text-[#e6edf3] flex items-center gap-2">
                      <span className="text-emerald-500 dark:text-[#3fb950]">
                        📁
                      </span>{" "}
                      Media Gallery
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-[#8d96a0]">
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
        "flex flex-col h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/30 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22] text-slate-800 dark:text-[#c9d1d9] overflow-hidden",
        className
      )}
    >
      <NameInputDialog
        isOpen={shouldShowDialog && !isWorkspaceLoading && !!workspace}
        onNameSubmit={handleNameSubmit}
        onClose={() => setShouldShowDialog(false)}
        workspaceName={workspace?.name}
      />

      {/* Top Header - Full Width, Fixed on mobile */}
      <WorkspaceHeader
        workspaceName={workspace?.name}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onSearch={(query) => {
          console.log("Search triggered, opening modal");
          setIsSearchModalOpen(true);
        }}
        onSidebarCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isSidebarCollapsed={sidebarCollapsed}
        className="w-full z-50"
      />

      {/* Main Layout Area - Add top padding on mobile for fixed header */}
      <div className="flex flex-1 overflow-hidden relative w-full md:pt-0 pt-14">
        {/* Mobile Backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
            onClick={(e) => {
              // Only close if clicking directly on the backdrop, not on dialogs above it
              // Check if any dialog/modal/menu is open by looking for common dialog elements
              const hasOpenDialog = document.querySelector(
                '[role="dialog"], [role="alertdialog"], [role="menu"], [data-state="open"], .fixed.inset-0.z-\\[9999\\], .fixed.inset-0.z-50'
              );
              if (hasOpenDialog) return; // Don't close sidebar if a dialog/menu is open

              if (e.target === e.currentTarget) {
                setSidebarOpen(false);
              }
            }}
            onTouchEnd={(e) => {
              // Same for touch events on mobile
              // Check if any dialog/modal/menu is open
              const hasOpenDialog = document.querySelector(
                '[role="dialog"], [role="alertdialog"], [role="menu"], [data-state="open"], .fixed.inset-0.z-\\[9999\\], .fixed.inset-0.z-50'
              );
              if (hasOpenDialog) return; // Don't close sidebar if a dialog/menu is open

              if (e.target === e.currentTarget) {
                setSidebarOpen(false);
              }
            }}
          />
        )}

        <Sidebar
          isOpen={sidebarOpen && !sidebarCollapsed}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            // Don't close sidebar on section change - only on channel select
          }}
          onChannelSelect={(channelId, channelType) => {
            handleChannelSelect(channelId, channelType);
            if (isMobile) setSidebarOpen(false);
          }}
          workspaceId={workspace?._id!}
          selectedChannelId={selectedChannel?.id}
          onCollapseChange={setSidebarCollapsed}
          className={cn(
            sidebarOpen && !sidebarCollapsed
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0 md:hidden",
            isMobile
              ? "fixed inset-y-0 left-0 z-40 w-72 shadow-2xl top-14 h-[calc(100vh-3.5rem)]"
              : "relative h-full"
          )}
        />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative transition-all duration-300">
          {renderContent()}
        </main>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onMessageSelect={(messageId, channelId) => {
          // Find the channel to get its proper type
          let channelType: "group" | "user" = "group"; // Default
          let channelName = getChannelName(channelId);

          if (channelsWithGroups) {
            for (const group of channelsWithGroups.groupedChannels) {
              const channel = group.channels.find(
                (ch: any) => ch._id === channelId
              );
              if (channel) {
                channelType = channel.type === "user" ? "user" : "group";
                channelName = channel.name;
                break;
              }
            }
          }

          // Navigate to the channel and message
          setSelectedChannel({
            id: channelId,
            type: channelType,
          });
          setActiveSection("channels");
          setIsSearchModalOpen(false);
          // Scroll to and highlight the specific message
          setHighlightedMessageId(messageId);
        }}
        onFileSelect={(fileUrl) => {
          // Open file in new tab
          window.open(fileUrl, "_blank");
          setIsSearchModalOpen(false);
        }}
      />
    </div>
  );
}
