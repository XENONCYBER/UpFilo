import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate URL-friendly custom ID from name
export const generateCustomId = (name: string) => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')  // Replace non-alphanumeric with hyphens
        .replace(/-+/g, '-')         // Replace multiple hyphens with single
        .replace(/^-|-$/g, '');      // Remove leading/trailing hyphens
}

export const create = mutation({
    args: { 
        name: v.string(), 
        workspaceId: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Skip authentication for now - can be added back later with proper auth setup
        // const identity = await ctx.auth.getUserIdentity();
        // if (!identity) {
        //     throw new Error("Unauthorized");
        // }

        let customId = args.workspaceId || generateCustomId(args.name);
        
        // Check if name already exists
        const existingByName = await ctx.db
            .query("workspaces")
            .withIndex("by_name", (q: any) => q.eq("name", args.name))
            .first();
        
        if (existingByName) {
            throw new Error("Workspace name already exists");
        }
        
        // Check if customId already exists, generate new one if needed
        let existingByCustomId = await ctx.db
            .query("workspaces")
            .withIndex("by_custom_id", (q: any) => q.eq("customId", customId))
            .first();
        
        // If customId exists, append random suffix
        while (existingByCustomId) {
            customId = `${generateCustomId(args.name)}-${Math.floor(Math.random() * 1000)}`;
            existingByCustomId = await ctx.db
                .query("workspaces")
                .withIndex("by_custom_id", (q: any) => q.eq("customId", customId))
                .first();
        }

        const now = Date.now();

        const workspaceId = await ctx.db.insert("workspaces", {
            name: args.name, 
            customId,
            description: args.description,
            createdAt: now,
            updatedAt: now,
        });

        // Create default channel groups
        const generalGroupId = await ctx.db.insert("channelGroups", {
            name: "General",
            workspaceId,
            type: "group",
            isExpanded: true,
            order: 0,
            createdAt: now,
            updatedAt: now,
        });

        const teamGroupId = await ctx.db.insert("channelGroups", {
            name: "Team",
            workspaceId,
            type: "user",
            isExpanded: true,
            order: 0,
            createdAt: now,
            updatedAt: now,
        });

        // Create default general channel
        await ctx.db.insert("channels", {
            name: "general",
            workspaceId,
            groupId: generalGroupId,
            type: "group",
            subType: "text",
            description: "General team discussions",
            isActive: true,
            order: 0,
            createdAt: now,
            updatedAt: now,
        });

        return { workspaceId, customId };
    }
});

export const update = mutation({
    args: { 
        id: v.id("workspaces"), 
        name: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const updates: any = {
            updatedAt: Date.now(),
        };

        if (args.name !== undefined) {
            updates.name = args.name;
        }

        if (args.description !== undefined) {
            updates.description = args.description;
        }

        await ctx.db.patch(args.id, updates);
        return args.id;
    }
});

export const remove = mutation({
    args: { id: v.id("workspaces") },
    handler: async (ctx, args) => {
        // Delete all channels in this workspace
        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
            .collect();

        for (const channel of channels) {
            // Delete all messages in each channel
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_channel_id", (q) => q.eq("channelId", channel._id))
                .collect();

            for (const message of messages) {
                await ctx.db.delete(message._id);
            }

            await ctx.db.delete(channel._id);
        }

        // Delete all channel groups in this workspace
        const channelGroups = await ctx.db
            .query("channelGroups")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
            .collect();

        for (const group of channelGroups) {
            await ctx.db.delete(group._id);
        }

        // Finally delete the workspace
        await ctx.db.delete(args.id);
        return args.id;
    }
});

export const get = query({
    args: {},
    handler: async (ctx) => {
        const workspaces = await ctx.db.query("workspaces").collect();
        return workspaces;
    },
});

export const getInfoById = query({
    args: { id: v.id("workspaces") },
    handler: async (ctx, args) => {
        const workspace = await ctx.db.get(args.id);        

        return {
            name: workspace?.name,
            description: workspace?.description,
            isMember: true,
        };
    },
});

export const getById = query({
    args: { id: v.id("workspaces") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    }, 
});

export const getByCustomId = query({
    args: { customId: v.string() },
    handler: async (ctx, args) => {
        const workspace = await ctx.db
            .query("workspaces")
            .withIndex("by_custom_id", (q: any) => q.eq("customId", args.customId))
            .first();
        return workspace;
    },
});

export const getByName = query({
    args: { name: v.string() },
    handler: async (ctx, args) => {
        const workspace = await ctx.db
            .query("workspaces")
            .withIndex("by_name", (q: any) => q.eq("name", args.name))
            .first();
        return workspace;
    },
});

// Get active users in a workspace (users who have sent messages recently)
export const getActiveUsers = query({
    args: { 
        workspaceId: v.id("workspaces"),
        timeWindow: v.optional(v.number()), // Time window in milliseconds, default 24 hours
    },
    handler: async (ctx, args) => {
        const timeWindow = args.timeWindow || 24 * 60 * 60 * 1000; // 24 hours
        const cutoffTime = Date.now() - timeWindow;

        // Get all channels in this workspace
        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .collect();

        const channelIds = channels.map(channel => channel._id);
        const activeUsers = new Map<string, {
            userName: string;
            lastActivity: number;
            messageCount: number;
        }>();

        // Get recent messages from all channels
        for (const channelId of channelIds) {
            const recentMessages = await ctx.db
                .query("messages")
                .withIndex("by_channel_id", (q) => q.eq("channelId", channelId))
                .filter((q) => q.gte(q.field("createdAt"), cutoffTime))
                .collect();

            // Track user activity
            recentMessages.forEach(message => {
                const existing = activeUsers.get(message.userName);
                if (!existing || message.createdAt > existing.lastActivity) {
                    activeUsers.set(message.userName, {
                        userName: message.userName,
                        lastActivity: message.createdAt,
                        messageCount: (existing?.messageCount || 0) + 1,
                    });
                }
            });
        }

        // Convert to array and sort by last activity
        const activeUsersList = Array.from(activeUsers.values())
            .sort((a, b) => b.lastActivity - a.lastActivity);

        return activeUsersList;
    },
});

// Get all users who have ever interacted with a workspace (for mentions)
export const getAllWorkspaceUsers = query({
    args: { 
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        // Get all channels in this workspace
        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .collect();

        const channelIds = channels.map(channel => channel._id);
        const allUsers = new Map<string, {
            userName: string;
            lastActivity: number;
            messageCount: number;
            isActive: boolean;
        }>();

        // Get all messages from all channels to find all users
        for (const channelId of channelIds) {
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_channel_id", (q) => q.eq("channelId", channelId))
                .collect();

            // Track all users who have sent messages
            messages.forEach(message => {
                const existing = allUsers.get(message.userName);
                const now = Date.now();
                const isActive = (now - message.createdAt) < (5 * 60 * 1000); // Active if message sent in last 5 minutes
                
                if (!existing || message.createdAt > existing.lastActivity) {
                    allUsers.set(message.userName, {
                        userName: message.userName,
                        lastActivity: message.createdAt,
                        messageCount: (existing?.messageCount || 0) + 1,
                        isActive: isActive || (existing?.isActive || false),
                    });
                }
            });
        }

        // Add some default users for demo purposes if no users found
        if (allUsers.size === 0) {
            const defaultUsers = [
                { userName: "john_doe", lastActivity: Date.now() - 10000, messageCount: 0, isActive: false },
                { userName: "jane_smith", lastActivity: Date.now() - 30000, messageCount: 0, isActive: false },
                { userName: "alex_chen", lastActivity: Date.now() - 60000, messageCount: 0, isActive: false },
                { userName: "sarah_wilson", lastActivity: Date.now() - 120000, messageCount: 0, isActive: false },
                { userName: "mike_brown", lastActivity: Date.now() - 300000, messageCount: 0, isActive: false },
            ];

            defaultUsers.forEach(user => {
                allUsers.set(user.userName, user);
            });
        }

        // Convert to array and sort by activity (active users first, then by last activity)
        const allUsersList = Array.from(allUsers.values())
            .sort((a, b) => {
                // Active users first
                if (a.isActive && !b.isActive) return -1;
                if (!a.isActive && b.isActive) return 1;
                // Then by last activity
                return b.lastActivity - a.lastActivity;
            });

        return allUsersList;
    },
});