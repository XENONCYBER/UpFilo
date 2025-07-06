import { ConvexClient } from "convex/browser";

const client = new ConvexClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

async function seedData() {
  try {
    // Create a test workspace
    console.log("Creating workspace...");
    const workspaceId = await client.mutation("workspaces:create", {
      name: "Test Workspace",
      description: "A test workspace for development",
    });
    console.log("Workspace created:", workspaceId);

    // Create a general channel group
    console.log("Creating channel group...");
    const groupId = await client.mutation("channelGroups:create", {
      workspaceId: workspaceId.workspaceId,
      name: "General",
      description: "General discussion channels",
    });
    console.log("Channel group created:", groupId);

    // Create a general channel
    console.log("Creating channel...");
    const channelId = await client.mutation("channels:create", {
      workspaceId: workspaceId.workspaceId,
      groupId: groupId,
      name: "general",
      description: "General discussion",
      type: "group",
    });
    console.log("Channel created:", channelId);

    // Create a welcome message
    console.log("Creating welcome message...");
    const messageId = await client.mutation("messages:sendMessage", {
      channelId: channelId,
      content: "Welcome to the test workspace!",
      userName: "System",
    });
    console.log("Message created:", messageId);

    console.log("✅ Seed data created successfully!");
    console.log(`🔗 Visit: http://localhost:3000/${workspaceId.customId}`);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  }
}

seedData();
