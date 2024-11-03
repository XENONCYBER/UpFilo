import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { auth } from "./auth";


export const generateCode = () => {
    const code = Array.from(
        {length: 6},
        () => "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random()*36)]).join('');
        return code;
}

export const create = mutation({
    args: {name: v.string()},
    handler: async (ctx, args) =>{
        const userId = await auth.getUserId(ctx);

        if(!userId){
            throw new Error("Unauthorized");
        }

        const joinCode = generateCode();

        const workspaceId = await ctx.db.insert("workspaces", {name: args.name, joinCode, userId});

        await ctx.db.insert("members", {userId, workspaceId, role: "admin"});

        await ctx.db.insert("channels", {name: "general", workspaceId, type: "chat"});

        return workspaceId;
    }
})

export const update = mutation({
    args: {name: v.string(), id: v.id("workspaces")},
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if(!userId){
            throw new Error("Unauthorized")
        }

        const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q)=> q.eq("workspaceId", args.id).eq("userId", userId)).unique();

        if(!member || member.role !== "admin"){
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, {name: args.name});
        }
})

export const remove = mutation({
    args: {id: v.id("workspaces")},
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if(!userId){
            throw new Error("Unauthorized")
        }

        const member = await ctx.db.query("members").withIndex("by_workspace_id_user_id", (q)=> q.eq("workspaceId", args.id).eq("userId", userId)).unique();

        if(!member || member.role !== "admin"){
            throw new Error("Unauthorized");
        }

        const [members] = await Promise.all([
            ctx.db
                .query("members")
                .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
                .collect(),
        ]);

        for (const member of members){
            await ctx.db.delete(member._id);
        }

        await ctx.db.delete(args.id);

        return args.id;
        }
})