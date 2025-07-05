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