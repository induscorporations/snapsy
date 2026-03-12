import { internalMutation } from './_generated/server';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Delete photos (and their matches) that are past the event's retention period.
 * Called by cron daily. No auth - runs as system.
 */
export const deleteExpiredPhotos = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const allPhotos = await ctx.db.query('photos').collect();
    let deleted = 0;
    for (const photo of allPhotos) {
      const event = await ctx.db.get(photo.eventId);
      if (!event) continue;
      const expiresAt = photo.createdAt + event.retentionDays * 24 * 60 * 60 * 1000;
      if (expiresAt > now) continue;
      const matches = await ctx.db
        .query('photoMatches')
        .withIndex('by_photo', (q: any) => q.eq('photoId', photo._id))
        .collect();
      for (const m of matches) {
        await ctx.db.delete(m._id);
      }
      try {
        await ctx.storage.delete(photo.storageId as import('./_generated/dataModel').Id<'_storage'>);
      } catch {
        // Storage may already be gone
      }
      await ctx.db.delete(photo._id);
      deleted++;
    }
    return { deleted };
  },
});

/**
 * Create or update expiration reminders for photos expiring in the next 7 days.
 * One reminder per (event, user) so each event member sees "Photos in [Event] expire in X days."
 */
export const createExpirationReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const sevenDaysFromNow = now + SEVEN_DAYS_MS;
    const allPhotos = await ctx.db.query('photos').collect();
    const eventCounts: Map<string, { eventName: string; expiresAt: number; count: number }> = new Map();
    for (const photo of allPhotos) {
      const event = await ctx.db.get(photo.eventId);
      if (!event) continue;
      const expiresAt = photo.createdAt + event.retentionDays * 24 * 60 * 60 * 1000;
      if (expiresAt <= now || expiresAt > sevenDaysFromNow) continue;
      const key = photo.eventId;
      const existing = eventCounts.get(key);
      if (existing) {
        existing.count += 1;
        if (expiresAt < existing.expiresAt) existing.expiresAt = expiresAt;
      } else {
        eventCounts.set(key, { eventName: event.name, expiresAt, count: 1 });
      }
    }
    for (const [eventId, info] of eventCounts) {
      const members = await ctx.db
        .query('eventMembers')
        .withIndex('by_event', (q: any) => q.eq('eventId', eventId))
        .collect();
      for (const m of members) {
        const existing = await ctx.db
          .query('expirationReminders')
          .withIndex('by_event_user', (q: any) => q.eq('eventId', eventId).eq('userId', m.userId))
          .unique();
        const payload = {
          eventId: eventId as import('./_generated/dataModel').Id<'events'>,
          userId: m.userId,
          eventName: info.eventName,
          photoCount: info.count,
          expiresAt: info.expiresAt,
          createdAt: now,
        };
        if (existing) {
          await ctx.db.patch(existing._id, payload);
        } else {
          await ctx.db.insert('expirationReminders', payload);
        }
      }
    }
    const expiredReminders = await ctx.db.query('expirationReminders').collect();
    for (const r of expiredReminders) {
      if (r.expiresAt <= now) await ctx.db.delete(r._id);
    }
    return { reminders: eventCounts.size };
  },
});
