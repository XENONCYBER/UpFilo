import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all channels for a workspace
export const get = query({
    args: {
        workspaceId: v.id("workspaces"),
        type: v.optional(v.union(v.literal("group"), v.literal("user"))),
        groupId: v.optional(v.id("channelGroups")),
    },
    handler: async (ctx, args) => {
        if (args.groupId) {
            const channels = await ctx.db
                .query("channels")
                .withIndex("by_group_id", (q) => q.eq("groupId", args.groupId))
                .order("asc")
                .collect();
            return channels.sort((a, b) => a.order - b.order);
        }

        if (args.type) {
            const channels = await ctx.db
                .query("channels")
                .withIndex("by_workspace_id_and_type", (q) => 
                    q.eq("workspaceId", args.workspaceId).eq("type", args.type!)
                )
                .order("asc")
                .collect();
            return channels.sort((a, b) => a.order - b.order);
        }

        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .order("asc")
            .collect();
        return channels.sort((a, b) => a.order - b.order);
    },
});

// Get channel by ID
export const getById = query({
    args: { id: v.id("channels") },
    handler: async (ctx, args) => {
        const channel = await ctx.db.get(args.id);
        return channel;
    }
});

// Create a new channel
export const create = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        name: v.string(),
        type: v.union(v.literal("group"), v.literal("user")),
        subType: v.union(
            v.literal("text"), 
            v.literal("voice"), 
            v.literal("announcement"), 
            v.literal("private")
        ),
        groupId: v.optional(v.id("channelGroups")),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const parsedName = args.name.replace(/\s+/g, "-").toLowerCase();

        // Get the highest order for channels in this group or workspace
        let existingChannels;
        if (args.groupId) {
            existingChannels = await ctx.db
                .query("channels")
                .withIndex("by_group_id", (q) => q.eq("groupId", args.groupId))
                .order("desc")
                .first();
        } else {
            existingChannels = await ctx.db
                .query("channels")
                .withIndex("by_workspace_id_and_type", (q) => 
                    q.eq("workspaceId", args.workspaceId).eq("type", args.type)
                )
                .order("desc")
                .first();
        }

        const order = existingChannels ? existingChannels.order + 1 : 0;
        const now = Date.now();

        const channelId = await ctx.db.insert("channels", {
            workspaceId: args.workspaceId,
            name: parsedName,
            type: args.type,
            subType: args.subType,
            groupId: args.groupId,
            description: args.description,
            isActive: false,
            order,
            createdAt: now,
            updatedAt: now,
        });

        return channelId;
    }
});

// Update a channel
export const update = mutation({
    args: {
        id: v.id("channels"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        groupId: v.optional(v.id("channelGroups")),
        isActive: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const channel = await ctx.db.get(args.id);
        if (!channel) {
            throw new Error("Channel not found");
        }

        const updates: any = {
            updatedAt: Date.now(),
        };

        // Only update if values are provided and not empty
        if (args.name !== undefined && args.name.trim().length > 0) {
            updates.name = args.name.replace(/\s+/g, "-").toLowerCase();
        }

        if (args.description !== undefined) {
            updates.description = args.description.trim();
        }

        if (args.groupId !== undefined) {
            updates.groupId = args.groupId;
        }

        if (args.isActive !== undefined) {
            updates.isActive = args.isActive;
        }

        // Only patch if we have actual updates beyond the timestamp
        if (Object.keys(updates).length > 1) {
            await ctx.db.patch(args.id, updates);
        }
        
        return args.id;
    }
});

// Remove a channel and all its related data (messages, files, etc.)
export const remove = mutation({
    args: {
        id: v.id("channels"),
    },
    handler: async (ctx, args) => {
        const channel = await ctx.db.get(args.id);
        if (!channel) {
            throw new Error("Channel not found");
        }

        // Delete all messages in this channel
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_channel_id", (q) => q.eq("channelId", args.id))
            .collect();

        console.log(`Deleting ${messages.length} messages from channel ${channel.name}`);

        // Collect all file URLs from messages for external cleanup
        const fileUrls: string[] = [];
        
        // Delete each message and collect file URLs
        for (const message of messages) {
            // Extract file URLs from richContent attachments
            if (message.richContent?.attachments && Array.isArray(message.richContent.attachments)) {
                for (const attachment of message.richContent.attachments) {
                    if (attachment.url) {
                        fileUrls.push(attachment.url);
                    }
                }
            }
            await ctx.db.delete(message._id);
        }

        // Delete the channel itself
        await ctx.db.delete(args.id);
        
        console.log(`Channel ${channel.name} deleted. ${fileUrls.length} files need external cleanup.`);
        
        // Return both the channel ID and file URLs for external cleanup
        return {
            channelId: args.id,
            fileUrls,
        };
    }
});

// Reorder channels
export const reorderChannels = mutation({
    args: {
        channelOrders: v.array(v.object({
            channelId: v.id("channels"),
            order: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        
        for (const { channelId, order } of args.channelOrders) {
            await ctx.db.patch(channelId, {
                order,
                updatedAt: now,
            });
        }
    },
});

// Get channels with their groups for a workspace
export const getChannelsWithGroups = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        // Get all channels for this workspace
        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .order("asc")
            .collect();

        // Get all groups for this workspace
        const groups = await ctx.db
            .query("channelGroups")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .order("asc")
            .collect();

        // Group channels by their group and type
        const groupedChannels = groups.map(group => ({
            ...group,
            channels: channels
                .filter(channel => channel.groupId === group._id)
                .sort((a, b) => a.order - b.order)
        }));

        // Also get ungrouped channels
        const ungroupedChannels = channels
            .filter(channel => !channel.groupId)
            .sort((a, b) => a.order - b.order);

        return {
            groupedChannels,
            ungroupedChannels,
            groups: groups.sort((a, b) => a.order - b.order),
        };
    },
});