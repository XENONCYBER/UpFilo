"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Image,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Layers,
} from "lucide-react";
import { WorkspaceNavItem } from "./workspace/workspace-nav-item";
import { WorkspaceUserSection } from "./workspace/workspace-user-section";
import { ChannelGroup } from "./workspace/channel-group";
import { ChannelItem } from "./workspace/channel-item";
import { cn } from "@/lib/utils";
import { useGetChannelsWithGroups } from "@/features/channels/api/use-get-channels-with-groups";
import { useGetChannelGroups } from "@/features/channels/api/use-get-channel-groups";
import { CreateChannelGroupModal } from "@/features/channels/components/create-channel-group-modal";
import { ThemeToggle } from "./theme-toggle";
import { Id } from "../../convex/_generated/dataModel";
import { ActiveUsers } from "./workspace/active-users";
import { useGetActiveUsers } from "@/features/workspaces/api/use-get-active-users";

import { useUserSession } from "./user-session-provider";
import { useRouter } from "next/navigation";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);

  // Get user session
  const { userName, clearUserName } = useUserSession();
  const router = useRouter();

  // Handle logout
  const handleLogout = () => {
    clearUserName();
    router.push("/"); // Navigate to home page
  };

  // Get active users in workspace
  const { data: activeUsers, isLoading: activeUsersLoading } = useGetActiveUsers({
    workspaceId,
    timeWindow: 24 * 60 * 60 * 1000, // 24 hours
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

  // Navigation items
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

  // Transform backend data to frontend format
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

  // Get transformed data
  const groupChannels = transformGroupData(groupChannelGroups || [], "group");
  const userChannels = transformGroupData(userChannelGroups || [], "user");

  // Add ungrouped channels
  const ungroupedChannels =
    channelsWithGroups?.ungroupedChannels?.map((channel: any) => ({
      id: channel._id,
      name: channel.name,
      type: channel.type,
      subType: channel.subType,
      isActive: channel._id === selectedChannelId,
      description: channel.description || "",
    })) || [];

  // Handlers for creating groups
  const handleCreateGroupChannel = () => {
    setCreateGroupModalOpen(true);
  };

  const handleCreateUserChannel = () => {
    setCreateUserModalOpen(true);
  };

  const handleCollapseToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          "card-glass fixed left-0 top-0 z-30 h-screen border-r border-neomorphic-border/50 transition-all duration-300 overflow-hidden backdrop-blur-xl shadow-neomorphic",
          isCollapsed ? "w-16" : "w-72",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div
            className={cn(
              "flex items-center border-b border-neomorphic-border/50 bg-neomorphic-surface/30 flex-shrink-0",
              isCollapsed ? "justify-center p-2" : "justify-between p-4"
            )}
          >
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="neomorphic-raised w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-electric-blue to-electric-purple">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-neomorphic-text text-lg">
                    UpFilo
                  </span>
                  <span className="text-xs text-neomorphic-text-secondary">
                    Workspace
                  </span>
                </div>
              </div>
            )}
            <div
              className={cn(
                "flex items-center",
                isCollapsed ? "" : "space-x-1"
              )}
            >
              {!isCollapsed && <ThemeToggle />}
              <button
                onClick={handleCollapseToggle}
                className="btn-neomorphic p-2 hover:scale-105 transition-all duration-200"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {!isCollapsed && (
              <>
                {/* Search */}
                <div className="px-4 py-3 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neomorphic-text-secondary" />
                    <Input
                      placeholder="Search channels..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-neomorphic pl-9 h-9 bg-neomorphic-surface/30 border-neomorphic-border/50 focus:border-electric-blue/50"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 channel-scrollbar">
                  {/* Navigation Items */}
                  <div className="space-y-1 pb-3">
                    {navItems.map((item) => (
                      <WorkspaceNavItem
                        key={item.value}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeSection === item.value}
                        onClick={() => onSectionChange(item.value)}
                        className="w-full justify-start hover:scale-105 transition-all duration-200"
                      />
                    ))}
                  </div>

                  <Separator className="my-3 bg-neomorphic-border/30" />

                  {/* Group Channels */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <span className="text-xs font-bold text-neomorphic-text-secondary uppercase tracking-wide">
                        Channels
                      </span>
                      <button
                        onClick={handleCreateGroupChannel}
                        title="Create new channel group"
                        className="p-1.5 rounded-lg hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary hover:text-electric-blue transition-all duration-200 hover:scale-110"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1">
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
                          <div key={channel.id} className="px-2">
                            <ChannelItem
                              channel={{
                                id: channel.id,
                                name: channel.name,
                                type: channel.subType as any,
                                isActive: channel.isActive,
                                description: channel.description,
                              }}
                              onClick={() => handleChannelSelect(channel)}
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  <Separator className="my-4 bg-neomorphic-border/30" />

                  {/* User Channels */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-3 py-1.5">
                      <span className="text-xs font-bold text-neomorphic-text-secondary uppercase tracking-wide">
                        User Channels
                      </span>
                      <button
                        onClick={handleCreateUserChannel}
                        title="Create new user channel group"
                        className="p-1.5 rounded-lg hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary hover:text-electric-purple transition-all duration-200 hover:scale-110"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1">
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
                          <div key={channel.id} className="px-2">
                            <ChannelItem
                              channel={{
                                id: channel.id,
                                name: channel.name,
                                type: channel.subType as any,
                                isActive: channel.isActive,
                                description: channel.description,
                              }}
                              onClick={() => handleChannelSelect(channel)}
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Active Users Section */}
                  {!activeUsersLoading && activeUsers && activeUsers.length > 0 && (
                    <>
                      <Separator className="my-4 bg-neomorphic-border/30" />
                      <ActiveUsers users={activeUsers} />
                    </>
                  )}
                </div>
              </>
            )}

            {/* Collapsed state icons */}
            {isCollapsed && (
              <div className="flex-1 flex flex-col items-center justify-start space-y-2 pt-4 px-2 overflow-y-auto min-h-0">
                {/* Navigation Items */}
                {navItems.map((item) => (
                  <Button
                    key={item.value}
                    variant={activeSection === item.value ? "default" : "ghost"}
                    size="icon"
                    onClick={() => onSectionChange(item.value)}
                    className={cn(
                      "w-10 h-10 transition-all duration-200 hover:scale-110 flex-shrink-0",
                      activeSection === item.value
                        ? "bg-electric-blue text-white shadow-lg shadow-electric-blue/25"
                        : "hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary hover:text-electric-blue"
                    )}
                    title={item.label}
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                ))}

                {/* Separator */}
                <div className="w-8 h-px bg-neomorphic-border/30 my-2 flex-shrink-0" />

                {/* Group Channels - Collapsed */}
                <div className="flex flex-col items-center space-y-2 w-full flex-shrink-0">
                  {/* Group Channels Header */}
                  <button
                    onClick={handleCreateGroupChannel}
                    title="Channels - Click to create new group"
                    className="w-10 h-10 rounded-lg hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary hover:text-electric-blue transition-all duration-200 hover:scale-110 flex items-center justify-center flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </button>

                  {/* Group Channel Items */}
                  {groupChannels.slice(0, 2).map((group, index) => (
                    <Button
                      key={group.id}
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (group.channels.length > 0) {
                          handleChannelSelect(group.channels[0]);
                        }
                      }}
                      className="w-8 h-8 transition-all duration-200 hover:scale-110 flex-shrink-0 hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary hover:text-electric-blue"
                      title={`${group.name} (${group.channels.length} channels)`}
                    >
                      <span className="text-xs font-bold">
                        {group.name.charAt(0).toUpperCase()}
                      </span>
                    </Button>
                  ))}

                  {/* Show ungrouped channels */}
                  {ungroupedChannels
                    .filter((channel) => channel.type === "group")
                    .slice(0, 1)
                    .map((channel) => (
                      <Button
                        key={channel.id}
                        variant="ghost"
                        size="icon"
                        onClick={() => handleChannelSelect(channel)}
                        className={cn(
                          "w-8 h-8 transition-all duration-200 hover:scale-110 flex-shrink-0",
                          channel.isActive
                            ? "bg-electric-blue text-white shadow-sm"
                            : "hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary hover:text-electric-blue"
                        )}
                        title={channel.name}
                      >
                        <span className="text-xs font-bold">
                          {channel.name.charAt(0).toUpperCase()}
                        </span>
                      </Button>
                    ))}
                </div>

                {/* Separator */}
                <div className="w-8 h-px bg-neomorphic-border/30 my-2 flex-shrink-0" />

                {/* User Channels - Collapsed */}
                <div className="flex flex-col items-center space-y-2 w-full flex-shrink-0">
                  {/* User Channels Header */}
                  <button
                    onClick={handleCreateUserChannel}
                    title="User Channels - Click to create new group"
                    className="w-10 h-10 rounded-lg hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary hover:text-electric-purple transition-all duration-200 hover:scale-110 flex items-center justify-center flex-shrink-0"
                  >
                    <Users className="h-4 w-4" />
                  </button>

                  {/* User Channel Items */}
                  {userChannels.slice(0, 2).map((group) => (
                    <Button
                      key={group.id}
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (group.channels.length > 0) {
                          handleChannelSelect(group.channels[0]);
                        }
                      }}
                      className="w-8 h-8 transition-all duration-200 hover:scale-110 flex-shrink-0 hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary hover:text-electric-purple"
                      title={`${group.name} (${group.channels.length} channels)`}
                    >
                      <span className="text-xs font-bold">
                        {group.name.charAt(0).toUpperCase()}
                      </span>
                    </Button>
                  ))}

                  {/* Show ungrouped user channels */}
                  {ungroupedChannels
                    .filter((channel) => channel.type === "user")
                    .slice(0, 1)
                    .map((channel) => (
                      <Button
                        key={channel.id}
                        variant="ghost"
                        size="icon"
                        onClick={() => handleChannelSelect(channel)}
                        className={cn(
                          "w-8 h-8 transition-all duration-200 hover:scale-110 flex-shrink-0",
                          channel.isActive
                            ? "bg-electric-purple text-white shadow-sm"
                            : "hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary hover:text-electric-purple"
                        )}
                        title={channel.name}
                      >
                        <span className="text-xs font-bold">
                          {channel.name.charAt(0).toUpperCase()}
                        </span>
                      </Button>
                    ))}
                </div>

                {/* Active Users - Collapsed */}
                {!activeUsersLoading && activeUsers && activeUsers.length > 0 && (
                  <>
                    <div className="w-8 h-px bg-neomorphic-border/30 my-2 flex-shrink-0" />
                    <ActiveUsers users={activeUsers} isCollapsed={true} />
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Section */}
          <div
            className={cn(
              "border-t border-neomorphic-border/50 bg-neomorphic-surface/30 overflow-hidden flex-shrink-0",
              isCollapsed ? "p-2 flex justify-center" : "p-3"
            )}
          >
            <WorkspaceUserSection
              userName={userName || "Guest"}
              isCollapsed={isCollapsed}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
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
