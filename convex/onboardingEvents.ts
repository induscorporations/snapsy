import { v } from 'convex/values';
import { mutation } from './_generated/server';
import { getConvexUserId } from './lib/auth';

/**
 * Record onboarding analytics events (slide completion, push acceptance, selfie success, etc.).
 */
export const record = mutation({
  args: {
    event: v.string(),
    slideIndex: v.optional(v.number()),
    pushAccepted: v.optional(v.boolean()),
    selfieSuccess: v.optional(v.boolean()),
    retakeCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getConvexUserId(ctx);
    if (!userId) return;
    await ctx.db.insert('onboardingEvents', {
      userId,
      event: args.event,
      slideIndex: args.slideIndex,
      pushAccepted: args.pushAccepted,
      selfieSuccess: args.selfieSuccess,
      retakeCount: args.retakeCount,
      createdAt: Date.now(),
    });
  },
});
