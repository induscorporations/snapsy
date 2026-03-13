import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getConvexUserId } from './lib/auth';

export const save = mutation({
  args: {
    userId: v.id('users'),
    embedding: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    const callerId = await getConvexUserId(ctx) ?? args.userId;
    if (!callerId || args.userId !== callerId) throw new Error('Forbidden: can only save your own face');
    return await ctx.db.insert('faces', {
      userId: args.userId,
      embedding: args.embedding,
      createdAt: Date.now(),
    });
  },
});

export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const callerId = await getConvexUserId(ctx) ?? userId;
    if (userId !== callerId) throw new Error('Forbidden: can only list your own faces');
    return await ctx.db
      .query('faces')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
  },
});

export const getUserFace = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) return null;

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
      .unique();
    if (!user) return null;

    return await ctx.db
      .query('faces')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .unique();
  },
});

/** Delete all face embeddings for the current user. */
export const deleteMyFaces = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) throw new Error('Unauthorized');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
      .unique();
    if (!user) throw new Error('User not found');

    const faces = await ctx.db
      .query('faces')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect();
    for (const f of faces) {
      await ctx.db.delete(f._id);
    }
    return { deleted: faces.length };
  },
});
