import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get messages for a channel
export const getMessages = query({
    args: {
        channelId: v.id("channels"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_channel_id", (q) => q.eq("channelId", args.channelId))
            .order("desc")
            .take(args.limit || 50);

        return messages.reverse(); // Return in chronological order
    },
});

// Send a message
export const sendMessage = mutation({
    args: {
        channelId: v.id("channels"),
        content: v.string(),
        userName: v.string(),
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("messages", {
            channelId: args.channelId,
            content: args.content,
            userId: "session-user", // Simple session-based user ID
            userName: args.userName,
            createdAt: Date.now(),
            isEdited: false,
        });

        return messageId;
    },
});

// Edit a message
export const editMessage = mutation({
    args: {
        messageId: v.id("messages"),
        content: v.string(),
        userName: v.string(), // For session-based verification
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message) {
            throw new Error("Message not found");
        }

        // Check if user owns this message (session-based)
        if (message.userName !== args.userName) {
            throw new Error("Unauthorized to edit this message");
        }

        await ctx.db.patch(args.messageId, {
            content: args.content,
            updatedAt: Date.now(),
            isEdited: true,
        });

        return args.messageId;
    },
});

// Delete a message
export const deleteMessage = mutation({
    args: {
        messageId: v.id("messages"),
        userName: v.string(), // For session-based verification
    },
    handler: async (ctx, args) => {
        const message = await ctx.db.get(args.messageId);
        if (!message) {
            throw new Error("Message not found");
        }

        // Check if user owns this message (session-based)
        if (message.userName !== args.userName) {
            throw new Error("Unauthorized to delete this message");
        }

        await ctx.db.delete(args.messageId);
        return args.messageId;
    },
});
