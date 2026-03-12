import { v } from 'convex/values';
import { query } from './_generated/server';
import { getConvexUserId } from './lib/auth';

/**
 * List expiration reminders for the current user (photos expiring within 7 days).
 * Pass userId when token is not available (e.g. right after sign-in).
 */
export const listForUser = query({
  args: { userId: v.optional(v.id('users')) },
  handler: async (ctx, { userId: clientUserId }) => {
    const userId = await getConvexUserId(ctx) ?? clientUserId ?? null;
    if (!userId) return [];
    return await ctx.db
      .query('expirationReminders')
      .withIndex('by_user', (q: any) => q.eq('userId', userId))
      .collect();
  },
});
