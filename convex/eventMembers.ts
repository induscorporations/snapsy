import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getConvexUserId } from './lib/auth';

export const listByEvent = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, args) => {
    const attendees = await ctx.db
      .query('eventMembers')
      .withIndex('by_event', (q) => q.eq('eventId', args.eventId))
      .collect();

    return await Promise.all(
      attendees.map(async (a) => {
        const user = await ctx.db.get(a.userId);
        return {
          ...a,
          userName: user?.clerkId ?? 'Unknown User',
        };
      })
    );
  },
});

export const remove = mutation({
  args: { membershipId: v.id('eventMembers'), userId: v.id('users') },
  handler: async (ctx, args) => {
    const callerId = await getConvexUserId(ctx) ?? args.userId;
    const membership = await ctx.db.get(args.membershipId);
    if (!membership) throw new Error('Membership not found');

    const event = await ctx.db.get(membership.eventId);
    if (!event) throw new Error('Event not found');

    if (event.hostId !== callerId) {
      throw new Error('Only the host can remove members');
    }

    if (membership.userId === event.hostId) {
      throw new Error('Cannot remove the host');
    }

    await ctx.db.delete(args.membershipId);
  },
});

export const updateRole = mutation({
  args: { membershipId: v.id('eventMembers'), role: v.string(), userId: v.id('users') },
  handler: async (ctx, args) => {
    const callerId = await getConvexUserId(ctx) ?? args.userId;
    const membership = await ctx.db.get(args.membershipId);
    if (!membership) throw new Error('Membership not found');

    const event = await ctx.db.get(membership.eventId);
    if (!event) throw new Error('Event not found');

    if (event.hostId !== callerId) {
      throw new Error('Only the host can update roles');
    }

    await ctx.db.patch(args.membershipId, { role: args.role });
  },
});
