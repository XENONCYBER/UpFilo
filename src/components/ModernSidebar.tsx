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
  UserCircle,
  Plus,
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

import { useUserSession } from "./user-session-provider";

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
  const { userName } = useUserSession();

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
      color: "text-blue-400",
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
      isExpanded: group.isExpanded || false,
      channels: (
        channelsWithGroups.groupedChannels.find(
          (gc: any) => gc._id === group._id
        )?.channels || []
      ).map((channel: any) => ({
        id: channel._id,
        name: channel.name,
        type: channel.type,
        subType: channel.subType,
        isActive: channel._id === selectedChannelId,
        description: channel.description || "",
        // Don't include unreadCount if it's 0 or not implemented
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
      // Don't include unreadCount if it's 0 or not implemented
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
          "glass-surface-secondary fixed left-0 top-0 z-30 h-screen border-r border-glass-border-light transition-all duration-300 overflow-hidden",
          isCollapsed ? "w-16" : "w-72",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-glass-border-subtle">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-md">
                  <UserCircle className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-foreground">UpFilo</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              {!isCollapsed && <ThemeToggle />}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCollapseToggle}
                className="hover:bg-glass-hover"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {!isCollapsed && (
              <>
                {/* Search */}
                <div className="p-4 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search channels..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
                  {/* Navigation Items */}
                  <div className="space-y-2 pb-4">
                    {navItems.map((item) => (
                      <WorkspaceNavItem
                        key={item.value}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeSection === item.value}
                        onClick={() => onSectionChange(item.value)}
                        className={cn("w-full justify-start", item.color)}
                      />
                    ))}
                  </div>

                  <Separator className="my-4" />

                  {/* Group Channels */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Channels
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCreateGroupChannel}
                        title="Create new channel group"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    {groupChannels.map((group) => (
                      <ChannelGroup
                        key={group.id}
                        group={group}
                        workspaceId={workspaceId}
                        onChannelSelect={handleChannelSelect}
                        searchQuery={searchQuery}
                      />
                    ))}
                    {ungroupedChannels
                      .filter((channel) => channel.type === "group")
                      .map((channel) => (
                        <div key={channel.id} className="px-2">
                          <ChannelItem
                            channel={{
                              ...channel,
                              type: channel.subType as any,
                            }}
                            onClick={() => handleChannelSelect(channel)}
                          />
                        </div>
                      ))}
                  </div>

                  <Separator className="my-4" />

                  {/* User Channels */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        User Channels
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCreateUserChannel}
                        title="Create new user channel group"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    {userChannels.map((group) => (
                      <ChannelGroup
                        key={group.id}
                        group={group}
                        workspaceId={workspaceId}
                        onChannelSelect={handleChannelSelect}
                        searchQuery={searchQuery}
                      />
                    ))}
                    {ungroupedChannels
                      .filter((channel) => channel.type === "user")
                      .map((channel) => (
                        <div key={channel.id} className="px-2">
                          <ChannelItem
                            channel={{
                              ...channel,
                              type: channel.subType as any,
                            }}
                            onClick={() => handleChannelSelect(channel)}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* Collapsed state icons */}
            {isCollapsed && (
              <div className="flex flex-col items-center space-y-4 pt-4">
                {navItems.map((item) => (
                  <Button
                    key={item.value}
                    variant={activeSection === item.value ? "default" : "ghost"}
                    size="icon"
                    onClick={() => onSectionChange(item.value)}
                    className="w-10 h-10"
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* User Section */}
          <div className="border-t border-white/20 dark:border-white/10 p-2">
            <WorkspaceUserSection
              userName={userName || "Guest"}
              isCollapsed={isCollapsed}
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
