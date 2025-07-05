import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

const schema = defineSchema({
    workspaces: defineTable({
        name: v.string(),
        customId: v.string(),
        description: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
    .index("by_custom_id", ["customId"])
    .index("by_name", ["name"]),
    
    channelGroups: defineTable({
        name: v.string(),
        workspaceId: v.id("workspaces"),
        type: v.union(v.literal("group"), v.literal("user")),
        isExpanded: v.optional(v.boolean()),
        order: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
    .index("by_workspace_id", ["workspaceId"])
    .index("by_workspace_id_and_type", ["workspaceId", "type"]),
    
    channels: defineTable({
        name: v.string(),
        workspaceId: v.id("workspaces"),
        groupId: v.optional(v.id("channelGroups")),
        type: v.union(v.literal("group"), v.literal("user")),
        subType: v.union(
            v.literal("text"), 
            v.literal("voice"), 
            v.literal("announcement"), 
            v.literal("private")
        ),
        description: v.optional(v.string()),
        isActive: v.optional(v.boolean()),
        order: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
    .index("by_workspace_id", ["workspaceId"])
    .index("by_group_id", ["groupId"])
    .index("by_workspace_id_and_type", ["workspaceId", "type"]),
    
    messages: defineTable({
        content: v.string(),
        richContent: v.optional(v.any()), // Store rich text data
        channelId: v.id("channels"),
        userId: v.string(),
        userName: v.string(),
        userAvatar: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
        isEdited: v.optional(v.boolean()),
    })
    .index("by_channel_id", ["channelId"])
    .index("by_user_id", ["userId"]),
    
    users: defineTable({
        name: v.string(),
        email: v.string(),
        avatar: v.optional(v.string()),
        status: v.union(v.literal("online"), v.literal("offline"), v.literal("away")),
        workspaceIds: v.array(v.id("workspaces")),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
    .index("by_email", ["email"]),
});

export default schema;