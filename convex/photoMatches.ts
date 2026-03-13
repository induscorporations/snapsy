import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getConvexUserId, requireEventMember } from './lib/auth';

export const create = mutation({
  args: {
    photoId: v.id('photos'),
    userId: v.id('users'),
    confidence: v.number(),
  },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.photoId);
    if (!photo) throw new Error('Photo not found');
    await requireEventMember(ctx, photo.eventId);
    const existing = await ctx.db
      .query('photoMatches')
      .withIndex('by_photo', (q) => q.eq('photoId', args.photoId))
      .filter((q) => q.eq(q.field('userId'), args.userId))
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert('photoMatches', args);
  },
});

export const listByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const callerId = await getConvexUserId(ctx) ?? userId;
    if (userId !== callerId) throw new Error('Forbidden: can only list your own matches');
    return await ctx.db
      .query('photoMatches')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
  },
});

export const countByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const callerId = await getConvexUserId(ctx) ?? userId;
    if (userId !== callerId) throw new Error('Forbidden: can only count your own matches');
    const matches = await ctx.db
      .query('photoMatches')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    return matches.length;
  },
});

export const getPhotosForUser = query({
  args: { userId: v.id('users'), eventId: v.optional(v.id('events')) },
  handler: async (ctx, { userId, eventId }) => {
    const callerId = await getConvexUserId(ctx) ?? userId;
    if (userId !== callerId) throw new Error('Forbidden: can only get your own photos');
    const matches = await ctx.db
      .query('photoMatches')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    const photos = await Promise.all(
      matches.map((m) => ctx.db.get(m.photoId))
    );
    const valid = photos.filter(Boolean) as NonNullable<(typeof photos)[0]>[];
    if (eventId) {
      return valid.filter((p) => p.eventId === eventId);
    }
    return valid.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getMatchedPhotosWithUrls = query({
  args: { userId: v.id('users'), eventId: v.id('events') },
  handler: async (ctx, { userId, eventId }) => {
    const callerId = await getConvexUserId(ctx) ?? userId;
    if (userId !== callerId) throw new Error('Forbidden: can only get your own matched photos');
    if (await getConvexUserId(ctx)) {
      await requireEventMember(ctx, eventId);
    }
    const matches = await ctx.db
      .query('photoMatches')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    const photos = await Promise.all(
      matches.map((m) => ctx.db.get(m.photoId))
    );
    const valid = photos.filter(Boolean) as NonNullable<(typeof photos)[0]>[];
    const forEvent = valid.filter((p) => p.eventId === eventId);
    return await Promise.all(
      forEvent.map(async (p) => ({
        ...p,
        url: await ctx.storage.getUrl(p.storageId as import('./_generated/dataModel').Id<'_storage'>),
      }))
    );
  },
});

/**
 * Remove this photo from "Photos of you" for the current user (hide / "Not me").
 * Deletes the photoMatch so the photo no longer appears in the user's matched feed.
 */
export const hideFromMyPhotos = mutation({
  args: { photoId: v.id('photos'), userId: v.optional(v.id('users')) },
  handler: async (ctx, { photoId, userId: clientUserId }) => {
    const userId = await getConvexUserId(ctx) ?? clientUserId;
    if (!userId) throw new Error('Unauthorized');
    const match = await ctx.db
      .query('photoMatches')
      .withIndex('by_photo', (q) => q.eq('photoId', photoId))
      .filter((q) => q.eq(q.field('userId'), userId))
      .unique();
    if (match) await ctx.db.delete(match._id);
    return { ok: true };
  },
});

/**
 * Paginated matched photos for a user in an event (for infinite scroll).
 * Returns { items, nextCursor } where nextCursor is set if there are more.
 */
export const getMatchedPhotosWithUrlsPaginated = query({
  args: {
    userId: v.id('users'),
    eventId: v.id('events'),
    limit: v.optional(v.number()),
    cursor: v.optional(v.id('photos')),
  },
  handler: async (ctx, { userId, eventId, limit = 24, cursor }) => {
    const callerId = await getConvexUserId(ctx) ?? userId;
    if (userId !== callerId) throw new Error('Forbidden: can only list your own matched photos');
    await requireEventMember(ctx, eventId);
    const matches = await ctx.db
      .query('photoMatches')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    const photos = await Promise.all(matches.map((m) => ctx.db.get(m.photoId)));
    const valid = photos.filter(Boolean) as NonNullable<(typeof photos)[0]>[];
    const forEvent = valid.filter((p) => p.eventId === eventId).sort((a, b) => b.createdAt - a.createdAt);
    let startIndex = 0;
    if (cursor) {
      const idx = forEvent.findIndex((p) => p._id === cursor);
      if (idx >= 0) startIndex = idx + 1;
    }
    const page = forEvent.slice(startIndex, startIndex + limit + 1);
    const hasMore = page.length > limit;
    const items = page.slice(0, limit);
    const withUrls = await Promise.all(
      items.map(async (p) => ({
        ...p,
        url: await ctx.storage.getUrl(p.storageId as import('./_generated/dataModel').Id<'_storage'>),
      }))
    );
    return {
      items: withUrls,
      nextCursor: hasMore ? items[items.length - 1]._id : null,
    };
  },
});

/** All matched photos for a user with URLs (for global "Photos of You" screen). */
export const getAllMatchedPhotosWithUrls = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    const callerId = await getConvexUserId(ctx) ?? userId;
    if (userId !== callerId) throw new Error('Forbidden: can only get your own matched photos');
    const matches = await ctx.db
      .query('photoMatches')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    const photos = await Promise.all(
      matches.map((m) => ctx.db.get(m.photoId))
    );
    const valid = photos.filter(Boolean) as NonNullable<(typeof photos)[0]>[];
    const sorted = valid.sort((a, b) => b.createdAt - a.createdAt);
    return await Promise.all(
      sorted.map(async (p) => ({
        ...p,
        url: await ctx.storage.getUrl(p.storageId as import('./_generated/dataModel').Id<'_storage'>),
      }))
    );
  },
});
