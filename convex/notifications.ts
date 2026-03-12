import { v } from 'convex/values';
import { action } from './_generated/server';

export const sendNewMatchNotification = action({
  args: {
    pushToken: v.string(),
    eventName: v.string(),
    eventId: v.id('events'),
  },
  handler: async (ctx, { pushToken, eventName, eventId }) => {
    // Best-effort push; failures shouldn't fail the action
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: pushToken,
          title: '📸 New photo of you!',
          body: `A new photo of you was found in "${eventName}"`,
          data: { eventId, screen: 'my-photos' },
          sound: 'default',
        }),
      });
    } catch {
      // Swallow errors; logging can be added later if needed
    }
  },
});

