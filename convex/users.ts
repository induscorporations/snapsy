import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getConvexUserId, requireConvexUserId } from './lib/auth';

export const getOrCreate = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId: clientClerkId }) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkId = identity?.subject ?? clientClerkId;
    if (!clerkId) {
      throw new Error('Unauthorized');
    }
    if (identity?.subject && identity.subject !== clientClerkId) {
      throw new Error('Unauthorized');
    }
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', clerkId))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert('users', {
      clerkId,
      createdAt: Date.now(),
    });
  },
});

export const getByClerkId = query({
  args: { clerkId: v.optional(v.string()) },
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) return null;
    const clerkId = identity.subject;
    return await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', clerkId))
      .unique();
  },
});

/**
 * Delete all data for the current user and remove the user document.
 * Call before signing out when the user requests account deletion.
 * Clerk account deletion must be done separately (backend or dashboard).
 */
export const deleteMyAccount = mutation({
  args: { userId: v.optional(v.id('users')) },
  handler: async (ctx, args) => {
    const userId = await getConvexUserId(ctx) ?? args.userId;
    if (!userId) throw new Error('Unauthorized');
    const faces = await ctx.db
      .query('faces')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    for (const f of faces) await ctx.db.delete(f._id);
    const matches = await ctx.db
      .query('photoMatches')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    for (const m of matches) await ctx.db.delete(m._id);
    const memberships = await ctx.db
      .query('eventMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    for (const m of memberships) await ctx.db.delete(m._id);
    await ctx.db.delete(userId);
    return { ok: true };
  },
});

export const getStorageUsage = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    // In a real app, we'd sum up the actual file sizes.
    // For MVP, we calculate based on a fixed photo size estimate (e.g., 2MB per photo).
    const photos = await ctx.db
      .query('photos')
      .withIndex('by_uploaded_by', (q) => q.eq('uploadedBy', args.userId))
      .collect();

    const usedBytes = photos.length * 2 * 1024 * 1024; // 2MB per photo
    return {
      usedBytes,
      totalBytes: 2 * 1024 * 1024 * 1024, // 2GB total
    };
  },
});

export const storePushToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) return;

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
      .unique();

    if (!user) return;
    await ctx.db.patch(user._id, { pushToken: token });
  },
});
