"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Image, Search, Plus, ChevronDown } from "lucide-react";
import { WorkspaceUserSection } from "./workspace/workspace-user-section";
import { ChannelGroup } from "./workspace/channel-group";
import { ChannelItem } from "./workspace/channel-item";
import { cn } from "@/lib/utils";
import { useGetChannelsWithGroups } from "@/features/channels/api/use-get-channels-with-groups";
import { useGetChannelGroups } from "@/features/channels/api/use-get-channel-groups";
import { CreateChannelGroupModal } from "@/features/channels/components/create-channel-group-modal";
import { Id } from "../../convex/_generated/dataModel";
import { ActiveUsers } from "./workspace/active-users";
import { useGetActiveUsersWithPresence } from "@/features/workspaces/api/use-get-active-users-with-presence";
import { useUserSession } from "./user-session-provider";
import { useRouter } from "next/navigation";
import { useUpdateUserPresence } from "@/features/workspaces/api/use-update-user-presence";

interface ModernSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onChannelSelect?: (channelId: string, channelType: "group" | "user") => void;
  workspaceId: Id<"workspaces">;
  selectedChannelId?: string;
  onCollapseChange?: (collapsed: boolean) => void;
  className?: string;
}

export function ModernSidebar({
  isOpen,
  onToggle,
  activeSection,
  onSectionChange,
  onChannelSelect,
  workspaceId,
  selectedChannelId,
  onCollapseChange,
  className,
}: ModernSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [dmsExpanded, setDmsExpanded] = useState(true);

  // Get user session
  const { userName, clearUserName } = useUserSession();
  const router = useRouter();
  const { updatePresence } = useUpdateUserPresence();

  // Handle logout
  const handleLogout = async () => {
    if (userName && workspaceId) {
      try {
        await updatePresence({
          userName,
          workspaceId,
          status: "offline",
        });
      } catch (error) {
        console.error("Failed to update presence on logout:", error);
      }
    }
    clearUserName();
    router.push("/");
  };

  // Get active users
  const { data: activeUsers, isLoading: activeUsersLoading } =
    useGetActiveUsersWithPresence({
      workspaceId,
      timeWindow: 5 * 60 * 1000,
    });

  // Get channels data
  const { data: channelsWithGroups } = useGetChannelsWithGroups({
    workspaceId,
  });
  const { data: groupChannelGroups } = useGetChannelGroups({
    workspaceId,
    type: "group",
  });
  const { data: userChannelGroups } = useGetChannelGroups({
    workspaceId,
    type: "user",
  });

  const navItems = [
    {
      label: "Media Gallery",
      icon: Image,
      value: "mediaGallery",
    },
  ];

  const handleChannelSelect = (channel: any) => {
    onChannelSelect?.(channel._id || channel.id, channel.type);
    onSectionChange("channels");
  };

  const transformGroupData = (groups: any[], type: "group" | "user") => {
    if (!channelsWithGroups || !groups) return [];
    return groups.map((group: any) => ({
      id: group._id,
      name: group.name,
      type: group.type,
      isExpanded: group.isExpanded || true,
      channels: (
        channelsWithGroups.groupedChannels.find(
          (gc: any) => gc._id === group._id
        )?.channels || []
      ).map((channel: any) => ({
        _id: channel._id,
        name: channel.name,
        type: channel.type,
        subType: channel.subType,
        isActive: channel._id === selectedChannelId,
        description: channel.description || "",
      })),
    }));
  };

  const groupChannels = transformGroupData(groupChannelGroups || [], "group");
  const userChannels = transformGroupData(userChannelGroups || [], "user");

  const ungroupedChannels =
    channelsWithGroups?.ungroupedChannels?.map((channel: any) => ({
      id: channel._id,
      name: channel.name,
      type: channel.type,
      subType: channel.subType,
      isActive: channel._id === selectedChannelId,
      description: channel.description || "",
    })) || [];

  if (!isOpen) return null;

  return (
    <>
      <aside
        className={cn(
          "w-60 h-full flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50",
          className
        )}
      >
        {/* Search */}
        <div className="p-2.5 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-slate-100/80 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 rounded-lg focus:ring-1 focus:ring-blue-500/30 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 sidebar-scrollbar">
          {/* Media Gallery */}
          <button
            onClick={() => onSectionChange("mediaGallery")}
            className={cn(
              "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-all",
              activeSection === "mediaGallery"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
            )}
          >
            <Image className="h-4 w-4 flex-shrink-0" />
            <span>Media Gallery</span>
          </button>

          {/* Channels Section */}
          <div className="pt-4">
            <button
              onClick={() => setChannelsExpanded(!channelsExpanded)}
              className="w-full flex items-center justify-between px-2.5 py-1 group"
            >
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Channels
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreateGroupModalOpen(true);
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-all"
                  title="Add Channel"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-slate-400 dark:text-slate-500 transition-transform",
                    !channelsExpanded && "-rotate-90"
                  )}
                />
              </div>
            </button>

            {channelsExpanded && (
              <div className="mt-0.5 space-y-px">
                {groupChannels.map((group) => (
                  <ChannelGroup
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    channels={group.channels}
                    type={group.type}
                    isExpanded={group.isExpanded}
                    onChannelSelect={handleChannelSelect}
                  />
                ))}
                {ungroupedChannels
                  .filter((channel) => channel.type === "group")
                  .map((channel) => (
                    <ChannelItem
                      key={channel.id}
                      channel={{
                        id: channel.id,
                        name: channel.name,
                        type: channel.subType as any,
                        isActive: channel.isActive,
                        description: channel.description,
                      }}
                      onClick={() => handleChannelSelect(channel)}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Direct Messages Section */}
          <div className="pt-4">
            <button
              onClick={() => setDmsExpanded(!dmsExpanded)}
              className="w-full flex items-center justify-between px-2.5 py-1 group"
            >
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                User Channels
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreateUserModalOpen(true);
                  }}
                  className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-all"
                  title="Add Direct Message"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 text-slate-400 dark:text-slate-500 transition-transform",
                    !dmsExpanded && "-rotate-90"
                  )}
                />
              </div>
            </button>

            {dmsExpanded && (
              <div className="mt-0.5 space-y-px">
                {userChannels.map((group) => (
                  <ChannelGroup
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    channels={group.channels}
                    type={group.type}
                    isExpanded={group.isExpanded}
                    onChannelSelect={handleChannelSelect}
                  />
                ))}
                {ungroupedChannels
                  .filter((channel) => channel.type === "user")
                  .map((channel) => (
                    <ChannelItem
                      key={channel.id}
                      channel={{
                        id: channel.id,
                        name: channel.name,
                        type: channel.subType as any,
                        isActive: channel.isActive,
                        description: channel.description,
                      }}
                      onClick={() => handleChannelSelect(channel)}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Active Users */}
          {!activeUsersLoading && activeUsers && activeUsers.length > 0 && (
            <div className="pt-4">
              <div className="px-2.5 py-1">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Online — {activeUsers.length}
                </span>
              </div>
              <div className="mt-0.5">
                <ActiveUsers users={activeUsers} />
              </div>
            </div>
          )}
        </div>

        {/* User Section */}
        <div className="p-2 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50">
          <WorkspaceUserSection
            userName={userName || "Guest"}
            isCollapsed={false}
            onLogout={handleLogout}
          />
        </div>
      </aside>

      <CreateChannelGroupModal
        open={createGroupModalOpen}
        onOpenChange={setCreateGroupModalOpen}
        type="group"
        workspaceId={workspaceId}
      />
      <CreateChannelGroupModal
        open={createUserModalOpen}
        onOpenChange={setCreateUserModalOpen}
        type="user"
        workspaceId={workspaceId}
      />
    </>
  );
}
