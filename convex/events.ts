import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getConvexUserId, requireConvexUserId, requireEventMember } from './lib/auth';

export const create = mutation({
  args: {
    name: v.string(),
    privacy: v.string(),
    retentionDays: v.number(),
    hostId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const callerId = await getConvexUserId(ctx) ?? args.hostId;
    if (!callerId || args.hostId !== callerId) throw new Error('Forbidden: can only create events as yourself');
    const eventId = await ctx.db.insert('events', {
      hostId: args.hostId,
      name: args.name,
      privacy: args.privacy,
      retentionDays: args.retentionDays,
      createdAt: Date.now(),
    });
    await ctx.db.insert('eventMembers', {
      eventId,
      userId: args.hostId,
      role: 'host',
    });
    return eventId;
  },
});

export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const callerId = await getConvexUserId(ctx) ?? userId;
    if (userId !== callerId) throw new Error('Forbidden: can only list your own events');
    const memberships = await ctx.db
      .query('eventMembers')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    const events = await Promise.all(
      memberships.map((m) => ctx.db.get(m.eventId))
    );
    return (events.filter(Boolean) as NonNullable<typeof events[0]>[]).sort(
      (a, b) => b.createdAt - a.createdAt
    );
  },
});

export const get = query({
  args: { eventId: v.id('events'), userId: v.optional(v.id('users')) },
  handler: async (ctx, { eventId, userId: clientUserId }) => {
    const userId = await getConvexUserId(ctx) ?? clientUserId;
    if (!userId) throw new Error('Unauthorized');
    const member = await ctx.db
      .query('eventMembers')
      .withIndex('by_event_user', (q: any) => q.eq('eventId', eventId).eq('userId', userId))
      .unique();
    if (!member) throw new Error('Forbidden: not an event member');
    return await ctx.db.get(eventId);
  },
});

export const getMembers = query({
  args: { eventId: v.id('events'), userId: v.optional(v.id('users')) },
  handler: async (ctx, { eventId, userId: clientUserId }) => {
    const userId = await getConvexUserId(ctx) ?? clientUserId;
    if (!userId) throw new Error('Unauthorized');
    const member = await ctx.db
      .query('eventMembers')
      .withIndex('by_event_user', (q: any) => q.eq('eventId', eventId).eq('userId', userId))
      .unique();
    if (!member) throw new Error('Forbidden: not an event member');
    return await ctx.db
      .query('eventMembers')
      .withIndex('by_event', (q: any) => q.eq('eventId', eventId))
      .collect();
  },
});

export const joinByInvite = mutation({
  args: {
    eventId: v.id('events'),
    userId: v.id('users'),
  },
  handler: async (ctx, { eventId, userId }) => {
    const callerId = await requireConvexUserId(ctx);
    if (userId !== callerId) throw new Error('Forbidden: can only join as yourself');
    const existing = await ctx.db
      .query('eventMembers')
      .withIndex('by_event_user', (q) =>
        q.eq('eventId', eventId).eq('userId', userId)
      )
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert('eventMembers', {
      eventId,
      userId,
      role: 'guest',
    });
  },
});

export const isMember = query({
  args: {
    eventId: v.id('events'),
    userId: v.id('users'),
  },
  handler: async (ctx, { eventId, userId }) => {
    const m = await ctx.db
      .query('eventMembers')
      .withIndex('by_event_user', (q) =>
        q.eq('eventId', eventId).eq('userId', userId)
      )
      .unique();
    return !!m;
  },
});
