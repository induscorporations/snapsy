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

export const listHostedByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const callerId = await getConvexUserId(ctx) ?? userId;
    if (userId !== callerId) throw new Error('Forbidden: can only list your own events');
    const events = await ctx.db
      .query('events')
      .withIndex('by_host', (q) => q.eq('hostId', userId))
      .collect();
    const now = Date.now();
    const active = events.filter((e) => {
      const expiresAt = e.createdAt + e.retentionDays * 24 * 60 * 60 * 1000;
      return now < expiresAt;
    });
    return active.sort((a, b) => b.createdAt - a.createdAt);
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
    const now = Date.now();
    const activeEvents = (events.filter(Boolean) as NonNullable<typeof events[0]>[]).filter(
      (e) => {
        const expiresAt = e.createdAt + e.retentionDays * 24 * 60 * 60 * 1000;
        return now < expiresAt;
      }
    );
    return activeEvents.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/** Returns minimal event info for invite link preview (event name, host label). Caller must be authenticated. */
export const getInvitePreview = query({
  args: { eventId: v.id('events') },
  handler: async (ctx, { eventId }) => {
    await getConvexUserId(ctx);
    const event = await ctx.db.get(eventId);
    if (!event) return null;
    const host = await ctx.db.get(event.hostId);
    const hostName = host?.clerkId ? `${host.clerkId.slice(0, 8)}…` : 'Host';
    return { name: event.name, hostName };
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
    if (!member) return null;
    const event = await ctx.db.get(eventId);
    if (!event) return null;

    const members = await ctx.db
      .query('eventMembers')
      .withIndex('by_event', (q: any) => q.eq('eventId', eventId))
      .collect();

    return {
      ...event,
      memberCount: members.length,
    };
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

export const leaveEvent = mutation({
  args: {
    eventId: v.id('events'),
    userId: v.id('users'),
  },
  handler: async (ctx, { eventId, userId }) => {
    const callerId = await requireConvexUserId(ctx);
    if (callerId !== userId) throw new Error('Forbidden: can only leave as yourself');

    const membership = await ctx.db
      .query('eventMembers')
      .withIndex('by_event_user', (q) =>
        q.eq('eventId', eventId).eq('userId', userId)
      )
      .unique();

    if (!membership) return;

    // Prevent host from leaving their own event (they should delete instead)
    const event = await ctx.db.get(eventId);
    if (event && event.hostId === userId) {
      throw new Error('Host cannot leave their own event');
    }

    await ctx.db.delete(membership._id);
  },
});

export const deleteEvent = mutation({
  args: {
    eventId: v.id('events'),
  },
  handler: async (ctx, { eventId }) => {
    const callerId = await requireConvexUserId(ctx);
    const event = await ctx.db.get(eventId);
    if (!event) return;
    if (event.hostId !== callerId) {
      throw new Error('Only the host can delete this event');
    }

    const memberships = await ctx.db
      .query('eventMembers')
      .withIndex('by_event', (q) => q.eq('eventId', eventId))
      .collect();
    for (const m of memberships) {
      await ctx.db.delete(m._id);
    }

    await ctx.db.delete(eventId);
  },
});
