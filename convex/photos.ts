import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getConvexUserId } from './lib/auth';
import { api } from './_generated/api';

export const generateUploadUrl = mutation({
  args: { userId: v.optional(v.id('users')) },
  handler: async (ctx, args) => {
    const callerId = await getConvexUserId(ctx) ?? args.userId;
    if (!callerId) throw new Error('Unauthorized');
    return await ctx.storage.generateUploadUrl();
  },
});

/** Placeholder confidence when creating matches without real face detection. */
const PLACEHOLDER_MATCH_CONFIDENCE = 0.85;

export const save = mutation({
  args: {
    eventId: v.id('events'),
    storageId: v.string(),
    uploadedBy: v.id('users'),
  },
  handler: async (ctx, args) => {
    const callerId = await getConvexUserId(ctx) ?? args.uploadedBy;
    if (!callerId || args.uploadedBy !== callerId) throw new Error('Forbidden: can only upload as yourself');
    const member = await ctx.db
      .query('eventMembers')
      .withIndex('by_event_user', (q: any) => q.eq('eventId', args.eventId).eq('userId', callerId))
      .unique();
    if (!member) throw new Error('Forbidden: not an event member');
    const photoId = await ctx.db.insert('photos', {
      eventId: args.eventId,
      storageId: args.storageId,
      uploadedBy: args.uploadedBy,
      createdAt: Date.now(),
    });
    const event = await ctx.db.get(args.eventId);
    // Placeholder face matching: create a match for each event member who has a face on file.
    // Replace with real face detection + similarity when ML is integrated.
    const members = await ctx.db
      .query('eventMembers')
      .withIndex('by_event', (q) => q.eq('eventId', args.eventId))
      .collect();
    for (const member of members) {
      const faces = await ctx.db
        .query('faces')
        .withIndex('by_user', (q) => q.eq('userId', member.userId))
        .first();
      if (!faces) continue;
      const existing = await ctx.db
        .query('photoMatches')
        .withIndex('by_photo', (q) => q.eq('photoId', photoId))
        .filter((q) => q.eq(q.field('userId'), member.userId))
        .unique();
      if (!existing) {
        const matchId = await ctx.db.insert('photoMatches', {
          photoId,
          userId: member.userId,
          confidence: PLACEHOLDER_MATCH_CONFIDENCE,
        });

        // Fire-and-forget push notification for the matched user
        if (event) {
          const matchedUser = await ctx.db.get(member.userId);
          const pushToken = (matchedUser as any)?.pushToken as string | undefined;
          if (pushToken) {
            await ctx.scheduler.runAfter(
              0,
              api.notifications.sendNewMatchNotification,
              {
                pushToken,
                eventName: event.name,
                eventId: event._id,
              } as any
            );
          }
        }
      }
    }
    return photoId;
  },
});

export const listByEvent = query({
  args: { eventId: v.id('events'), userId: v.optional(v.id('users')) },
  handler: async (ctx, { eventId, userId: clientUserId }) => {
    const userId = await getConvexUserId(ctx) ?? clientUserId;
    if (!userId) throw new Error('Unauthorized');
    const member = await ctx.db
      .query('eventMembers')
      .withIndex('by_event_user', (q: any) => q.eq('eventId', eventId).eq('userId', userId))
      .unique();
    if (!member) throw new Error('Forbidden: not an event member');
    const photos = await ctx.db
      .query('photos')
      .withIndex('by_event', (q) => q.eq('eventId', eventId))
      .order('desc')
      .collect();
    return await Promise.all(
      photos.map(async (p) => ({
        ...p,
        url: await ctx.storage.getUrl(p.storageId as import('./_generated/dataModel').Id<'_storage'>),
      }))
    );
  },
});

export const get = query({
  args: { photoId: v.id('photos'), userId: v.optional(v.id('users')) },
  handler: async (ctx, { photoId, userId: clientUserId }) => {
    const photo = await ctx.db.get(photoId);
    if (!photo) return null;
    const userId = await getConvexUserId(ctx) ?? clientUserId;
    if (!userId) throw new Error('Unauthorized');
    const member = await ctx.db
      .query('eventMembers')
      .withIndex('by_event_user', (q: any) => q.eq('eventId', photo.eventId).eq('userId', userId))
      .unique();
    if (!member) throw new Error('Forbidden: not an event member');
    const url = await ctx.storage.getUrl(photo.storageId as import('./_generated/dataModel').Id<'_storage'>);
    return { ...photo, url };
  },
});

export const listRecentlyDownloaded = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const downloads = await ctx.db
      .query('downloads')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .take(10);

    return await Promise.all(
      downloads.map(async (d) => {
        const photo = await ctx.db.get(d.photoId);
        if (!photo) return null;
        return {
          ...photo,
          url: await ctx.storage.getUrl(photo.storageId as any),
        };
      })
    ).then((ps) => ps.filter((p) => p !== null));
  },
});

export const recordDownload = mutation({
  args: { photoId: v.id('photos'), userId: v.id('users') },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('downloads')
      .withIndex('by_photo_user', (q) => q.eq('photoId', args.photoId).eq('userId', args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { downloadedAt: Date.now() });
    } else {
      await ctx.db.insert('downloads', {
        photoId: args.photoId,
        userId: args.userId,
        downloadedAt: Date.now(),
      });
    }
  },
});

export const deletePhoto = mutation({
  args: { photoId: v.id('photos') },
  handler: async (ctx, { photoId }) => {
    const userId = await getConvexUserId(ctx);
    if (!userId) throw new Error('Unauthorized');

    const photo = await ctx.db.get(photoId);
    if (!photo) return;

    const event = await ctx.db.get(photo.eventId);
    if (!event) return;
    if (event.hostId !== userId) {
      throw new Error('Only the host can delete this photo');
    }

    const matches = await ctx.db
      .query('photoMatches')
      .withIndex('by_photo', (q) => q.eq('photoId', photoId))
      .collect();
    for (const m of matches) {
      await ctx.db.delete(m._id);
    }

    await ctx.db.delete(photoId);
  },
});
