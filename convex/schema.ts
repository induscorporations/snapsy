import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    createdAt: v.number(),
    pushToken: v.optional(v.string()),
  }).index('by_clerk_id', ['clerkId']),

  events: defineTable({
    hostId: v.id('users'),
    name: v.string(),
    privacy: v.string(),
    retentionDays: v.number(),
    createdAt: v.number(),
  }).index('by_host', ['hostId']),

  eventMembers: defineTable({
    eventId: v.id('events'),
    userId: v.id('users'),
    role: v.string(),
  })
    .index('by_event', ['eventId'])
    .index('by_user', ['userId'])
    .index('by_event_user', ['eventId', 'userId']),

  photos: defineTable({
    eventId: v.id('events'),
    storageId: v.string(),
    uploadedBy: v.id('users'),
    createdAt: v.number(),
  })
    .index('by_event', ['eventId'])
    .index('by_uploaded_by', ['uploadedBy']),

  faces: defineTable({
    userId: v.id('users'),
    embedding: v.array(v.number()),
    createdAt: v.number(),
  }).index('by_user', ['userId']),

  photoFaces: defineTable({
    photoId: v.id('photos'),
    embedding: v.array(v.number()),
  }).index('by_photo', ['photoId']),

  photoMatches: defineTable({
    photoId: v.id('photos'),
    userId: v.id('users'),
    confidence: v.number(),
  })
    .index('by_photo', ['photoId'])
    .index('by_user', ['userId']),

  downloads: defineTable({
    photoId: v.id('photos'),
    userId: v.id('users'),
    downloadedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_photo_user', ['photoId', 'userId']),

  expirationReminders: defineTable({
    eventId: v.id('events'),
    userId: v.id('users'),
    eventName: v.string(),
    photoCount: v.number(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_event_user', ['eventId', 'userId']),

  onboardingEvents: defineTable({
    userId: v.id('users'),
    event: v.string(),
    slideIndex: v.optional(v.number()),
    pushAccepted: v.optional(v.boolean()),
    selfieSuccess: v.optional(v.boolean()),
    retakeCount: v.optional(v.number()),
    createdAt: v.number(),
  }).index('by_user', ['userId']),
});
