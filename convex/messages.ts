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

// Get all media files from messages across a workspace
export const getWorkspaceMedia = query({
    args: {
        workspaceId: v.id("workspaces"),
        mediaType: v.optional(v.union(
            v.literal("all"),
            v.literal("images"), 
            v.literal("videos"),
            v.literal("audio"),
            v.literal("documents")
        )),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // First get all channels for this workspace
        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .collect();

        const channelIds = channels.map(channel => channel._id);

        // Get all messages from these channels that have attachments
        const messagesWithMedia: any[] = [];
        
        for (const channelId of channelIds) {
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_channel_id", (q) => q.eq("channelId", channelId))
                .order("desc")
                .collect();

            // Filter messages that have richContent with attachments
            const mediaMessages = messages.filter(message => 
                message.richContent && 
                message.richContent.attachments && 
                message.richContent.attachments.length > 0
            );

            messagesWithMedia.push(...mediaMessages);
        }

        // Sort by creation time (newest first)
        messagesWithMedia.sort((a, b) => b.createdAt - a.createdAt);

        // Extract and flatten all media files
        const allMedia: any[] = [];
        
        messagesWithMedia.forEach(message => {
            if (message.richContent && message.richContent.attachments) {
                message.richContent.attachments.forEach((attachment: any) => {
                    // Determine media category
                    let category = "documents";
                    if (attachment.type.startsWith("image/")) {
                        category = "images";
                    } else if (attachment.type.startsWith("video/")) {
                        category = "videos";
                    } else if (attachment.type.startsWith("audio/")) {
                        category = "audio";
                    }

                    // Filter by media type if specified
                    if (args.mediaType && args.mediaType !== "all" && category !== args.mediaType) {
                        return;
                    }

                    allMedia.push({
                        id: `${message._id}_${attachment.name}`,
                        name: attachment.name,
                        url: attachment.url,
                        type: attachment.type,
                        size: attachment.size,
                        category: category,
                        messageId: message._id,
                        channelId: message.channelId,
                        uploadedBy: message.userName,
                        uploadedAt: message.createdAt,
                        messageContent: message.content,
                    });
                });
            }
        });

        // Apply limit if specified
        const limitedMedia = args.limit ? allMedia.slice(0, args.limit) : allMedia;

        return limitedMedia;
    },
});

// Get media statistics for a workspace
export const getWorkspaceMediaStats = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        // First get all channels for this workspace
        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .collect();

        const channelIds = channels.map(channel => channel._id);

        // Get all messages from these channels that have attachments
        const messagesWithMedia: any[] = [];
        
        for (const channelId of channelIds) {
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_channel_id", (q) => q.eq("channelId", channelId))
                .collect();

            // Filter messages that have richContent with attachments
            const mediaMessages = messages.filter(message => 
                message.richContent && 
                message.richContent.attachments && 
                message.richContent.attachments.length > 0
            );

            messagesWithMedia.push(...mediaMessages);
        }

        // Extract and flatten all media files
        const allMedia: any[] = [];
        
        messagesWithMedia.forEach(message => {
            if (message.richContent && message.richContent.attachments) {
                message.richContent.attachments.forEach((attachment: any) => {
                    // Determine media category
                    let category = "documents";
                    if (attachment.type.startsWith("image/")) {
                        category = "images";
                    } else if (attachment.type.startsWith("video/")) {
                        category = "videos";
                    } else if (attachment.type.startsWith("audio/")) {
                        category = "audio";
                    }

                    allMedia.push({
                        id: `${message._id}_${attachment.name}`,
                        name: attachment.name,
                        url: attachment.url,
                        type: attachment.type,
                        size: attachment.size,
                        category: category,
                        messageId: message._id,
                        channelId: message.channelId,
                        uploadedBy: message.userName,
                        uploadedAt: message.createdAt,
                    });
                });
            }
        });

        // Calculate statistics
        const stats = {
            total: allMedia.length,
            images: allMedia.filter((item: any) => item.category === "images").length,
            videos: allMedia.filter((item: any) => item.category === "videos").length,
            audio: allMedia.filter((item: any) => item.category === "audio").length,
            documents: allMedia.filter((item: any) => item.category === "documents").length,
            totalSize: allMedia.reduce((sum: number, item: any) => sum + (item.size || 0), 0),
        };

        return stats;
    },
});

// Send a message
export const sendMessage = mutation({
    args: {
        channelId: v.id("channels"),
        content: v.string(),
        userName: v.string(),
        richContent: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("messages", {
            channelId: args.channelId,
            content: args.content,
            richContent: args.richContent,
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
        richContent: v.optional(v.any()),
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
            richContent: args.richContent,
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

// Search messages in a channel
export const searchMessages = query({
    args: {
        channelId: v.id("channels"),
        searchQuery: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        if (!args.searchQuery.trim()) {
            return [];
        }

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_channel_id", (q) => q.eq("channelId", args.channelId))
            .order("desc")
            .take(args.limit || 100);

        // Filter messages that contain the search query (case-insensitive)
        const filteredMessages = messages.filter(message => 
            message.content.toLowerCase().includes(args.searchQuery.toLowerCase()) ||
            message.userName.toLowerCase().includes(args.searchQuery.toLowerCase())
        );

        return filteredMessages.reverse(); // Return in chronological order
    },
});

// Search messages across all channels in a workspace
export const searchWorkspaceMessages = query({
    args: {
        workspaceId: v.id("workspaces"),
        searchQuery: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        if (!args.searchQuery.trim()) {
            return [];
        }

        // Get all channels in the workspace
        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .collect();

        const channelIds = channels.map(channel => channel._id);
        const allMessages: any[] = [];

        // Search messages in all channels
        for (const channelId of channelIds) {
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_channel_id", (q) => q.eq("channelId", channelId))
                .order("desc")
                .take(50); // Limit per channel to avoid performance issues

            // Filter messages that contain the search query
            const filteredMessages = messages.filter(message => 
                message.content.toLowerCase().includes(args.searchQuery.toLowerCase()) ||
                message.userName.toLowerCase().includes(args.searchQuery.toLowerCase())
            );

            // Add channel information to messages
            const channel = channels.find(c => c._id === channelId);
            const messagesWithChannel = filteredMessages.map(message => ({
                ...message,
                channelName: channel?.name || "Unknown",
                channelType: channel?.type || "text",
            }));

            allMessages.push(...messagesWithChannel);
        }

        // Sort by creation time (newest first) and apply limit
        allMessages.sort((a, b) => b.createdAt - a.createdAt);
        return allMessages.slice(0, args.limit || 50);
    },
});

// Search files/attachments in a workspace
export const searchWorkspaceFiles = query({
    args: {
        workspaceId: v.id("workspaces"),
        searchQuery: v.string(),
        fileType: v.optional(v.union(
            v.literal("all"),
            v.literal("images"), 
            v.literal("videos"),
            v.literal("audio"),
            v.literal("documents")
        )),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        if (!args.searchQuery.trim()) {
            return [];
        }

        // Get all channels for this workspace
        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .collect();

        const channelIds = channels.map(channel => channel._id);
        const allFiles: any[] = [];

        // Search through messages with attachments
        for (const channelId of channelIds) {
            const messages = await ctx.db
                .query("messages")
                .withIndex("by_channel_id", (q) => q.eq("channelId", channelId))
                .order("desc")
                .collect();

            // Filter messages that have attachments
            const messagesWithMedia = messages.filter(message => 
                message.richContent && 
                message.richContent.attachments && 
                message.richContent.attachments.length > 0
            );

            // Extract files that match the search query
            messagesWithMedia.forEach(message => {
                if (message.richContent && message.richContent.attachments) {
                    message.richContent.attachments.forEach((attachment: any) => {
                        // Check if file name matches search query
                        if (attachment.name.toLowerCase().includes(args.searchQuery.toLowerCase())) {
                            // Determine file category
                            let category = "documents";
                            if (attachment.type.startsWith("image/")) {
                                category = "images";
                            } else if (attachment.type.startsWith("video/")) {
                                category = "videos";
                            } else if (attachment.type.startsWith("audio/")) {
                                category = "audio";
                            }

                            // Filter by file type if specified
                            if (args.fileType && args.fileType !== "all" && category !== args.fileType) {
                                return;
                            }

                            const channel = channels.find(c => c._id === channelId);
                            allFiles.push({
                                id: `${message._id}_${attachment.name}`,
                                name: attachment.name,
                                url: attachment.url,
                                type: attachment.type,
                                size: attachment.size,
                                category: category,
                                messageId: message._id,
                                channelId: message.channelId,
                                channelName: channel?.name || "Unknown",
                                uploadedBy: message.userName,
                                uploadedAt: message.createdAt,
                            });
                        }
                    });
                }
            });
        }

        // Sort by upload time (newest first) and apply limit
        allFiles.sort((a, b) => b.uploadedAt - a.uploadedAt);
        return allFiles.slice(0, args.limit || 50);
    },
});
