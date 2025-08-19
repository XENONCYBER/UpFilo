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
        unreadCount: channel.unreadCount || 0,
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
      unreadCount: channel.unreadCount || 0,
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
          "card-glass fixed left-0 top-0 z-30 h-screen border-r border-neomorphic-border transition-all duration-300 overflow-hidden",
          isCollapsed ? "w-16" : "w-72",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neomorphic-border">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="neomorphic-raised w-8 h-8 rounded-neomorphic flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-electric-blue" />
                </div>
                <span className="font-semibold text-neomorphic-text">
                  UpFilo
                </span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              {!isCollapsed && <ThemeToggle />}
              <button
                onClick={handleCollapseToggle}
                className="btn-neomorphic p-2"
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
                <div className="px-3 py-4 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neomorphic-text-secondary" />
                    <Input
                      placeholder="Search channels..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-neomorphic pl-9"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4 channel-scrollbar">
                  {/* Navigation Items */}
                  <div className="space-y-1 pb-6">
                    {navItems.map((item) => (
                      <WorkspaceNavItem
                        key={item.value}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeSection === item.value}
                        onClick={() => onSectionChange(item.value)}
                        className="w-full justify-start"
                      />
                    ))}
                  </div>

                  <Separator className="my-4 bg-neomorphic-border/50" />

                  {/* Group Channels */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 py-3">
                      <span className="text-xs font-bold text-neomorphic-text-secondary uppercase tracking-wide">
                        Channels
                      </span>
                      <button
                        onClick={handleCreateGroupChannel}
                        title="Create new channel group"
                        className="p-1.5 rounded-md hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary hover:text-neomorphic-text transition-colors duration-200"
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
                                unreadCount: channel.unreadCount,
                                description: channel.description,
                              }}
                              onClick={() => handleChannelSelect(channel)}
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  <Separator className="my-6 bg-neomorphic-border/50" />

                  {/* User Channels */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 py-3">
                      <span className="text-xs font-bold text-neomorphic-text-secondary uppercase tracking-wide">
                        User Channels
                      </span>
                      <button
                        onClick={handleCreateUserChannel}
                        title="Create new user channel group"
                        className="p-1.5 rounded-md hover:bg-neomorphic-surface/50 text-neomorphic-text-secondary hover:text-neomorphic-text transition-colors duration-200"
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
                                unreadCount: channel.unreadCount,
                                description: channel.description,
                              }}
                              onClick={() => handleChannelSelect(channel)}
                            />
                          </div>
                        ))}
                    </div>
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
          <div className="border-t border-neomorphic-border bg-neomorphic-surface/50 p-3 overflow-hidden">
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
