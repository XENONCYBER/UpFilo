import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all channel groups for a workspace
export const getChannelGroups = query({
    args: {
        workspaceId: v.id("workspaces"),
        type: v.optional(v.union(v.literal("group"), v.literal("user"))),
    },
    handler: async (ctx, args) => {
        if (args.type) {
            const groups = await ctx.db
                .query("channelGroups")
                .withIndex("by_workspace_id_and_type", (q) => 
                    q.eq("workspaceId", args.workspaceId).eq("type", args.type!)
                )
                .order("asc")
                .collect();
            return groups.sort((a, b) => a.order - b.order);
        } else {
            const groups = await ctx.db
                .query("channelGroups")
                .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
                .order("asc")
                .collect();
            return groups.sort((a, b) => a.order - b.order);
        }
    },
});

// Create a new channel group (with optional password for user type)
export const createChannelGroup = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        name: v.string(),
        type: v.union(v.literal("group"), v.literal("user")),
        isExpanded: v.optional(v.boolean()),
        password: v.optional(v.string()), // Only for type: "user"
    },
    handler: async (ctx, args) => {
        // Get the highest order for this workspace and type
        const existingGroups = await ctx.db
            .query("channelGroups")
            .withIndex("by_workspace_id_and_type", (q) => 
                q.eq("workspaceId", args.workspaceId).eq("type", args.type)
            )
            .order("desc")
            .first();

        const order = existingGroups ? existingGroups.order + 1 : 0;
        const now = Date.now();

        const groupData: any = {
            name: args.name,
            workspaceId: args.workspaceId,
            type: args.type,
            isExpanded: args.isExpanded ?? true,
            order,
            createdAt: now,
            updatedAt: now,
        };
        if (args.type === "user" && args.password) {
            groupData.password = args.password;
        }

        const groupId = await ctx.db.insert("channelGroups", groupData);
        return groupId;
    },
});

// Update a channel group (including password for user type)
export const updateChannelGroup = mutation({
    args: {
        groupId: v.id("channelGroups"),
        name: v.optional(v.string()),
        isExpanded: v.optional(v.boolean()),
        password: v.optional(v.string()), // Only for type: "user"
    },
    handler: async (ctx, args) => {
        const updates: any = {
            updatedAt: Date.now(),
        };

        if (args.name !== undefined) {
            updates.name = args.name;
        }

        if (args.isExpanded !== undefined) {
            updates.isExpanded = args.isExpanded;
        }

        if (args.password !== undefined) {
            updates.password = args.password;
        }

        await ctx.db.patch(args.groupId, updates);
    },
});

// Verify password for a user channel group
export const verifyUserGroupPassword = mutation({
    args: {
        groupId: v.id("channelGroups"),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const group = await ctx.db.get(args.groupId);
        
        // Debug logging
        console.log("Group found:", !!group);
        console.log("Group type:", group?.type);
        console.log("Has password:", !!group?.password);
        console.log("Stored password:", group?.password);
        console.log("Input password:", args.password);
        console.log("Passwords match:", group?.password?.trim() === args.password.trim());
        
        if (!group || group.type !== "user" || !group.password) return false;
        return group.password.trim() === args.password.trim();
    },
});

// Delete a channel group
export const deleteChannelGroup = mutation({
    args: {
        groupId: v.id("channelGroups"),
    },
    handler: async (ctx, args) => {
        // First, update all channels in this group to have no group
        const channels = await ctx.db
            .query("channels")
            .withIndex("by_group_id", (q) => q.eq("groupId", args.groupId))
            .collect();

        for (const channel of channels) {
            await ctx.db.patch(channel._id, {
                groupId: undefined,
                updatedAt: Date.now(),
            });
        }

        // Then delete the group
        await ctx.db.delete(args.groupId);
    },
});

// Reorder channel groups
export const reorderChannelGroups = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        type: v.union(v.literal("group"), v.literal("user")),
        groupOrders: v.array(v.object({
            groupId: v.id("channelGroups"),
            order: v.number(),
        })),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        
        for (const { groupId, order } of args.groupOrders) {
            await ctx.db.patch(groupId, {
                order,
                updatedAt: now,
            });
        }
    },
});
