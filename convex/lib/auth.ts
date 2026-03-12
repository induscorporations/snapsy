import type { Id } from '../_generated/dataModel';
import type { QueryCtx, MutationCtx } from '../_generated/server';

type Ctx = QueryCtx | MutationCtx;

/**
 * Resolve Convex userId from the current auth token (Clerk).
 * Returns null if not authenticated or user not found in users table.
 */
export async function getConvexUserId(ctx: Ctx): Promise<Id<'users'> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.subject) return null;
  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q: any) => q.eq('clerkId', identity.subject))
    .unique();
  return user?._id ?? null;
}

/** Throw if not authenticated; return Convex userId. */
export async function requireConvexUserId(ctx: Ctx): Promise<Id<'users'>> {
  const userId = await getConvexUserId(ctx);
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

/** Check if the authenticated user is a member of the event. */
export async function requireEventMember(
  ctx: Ctx,
  eventId: Id<'events'>
): Promise<Id<'users'>> {
  const userId = await requireConvexUserId(ctx);
  const member = await ctx.db
    .query('eventMembers')
    .withIndex('by_event_user', (q: any) =>
      q.eq('eventId', eventId).eq('userId', userId)
    )
    .unique();
  if (!member) throw new Error('Forbidden: not an event member');
  return userId;
}
