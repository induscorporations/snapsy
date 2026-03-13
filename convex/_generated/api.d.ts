/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as eventMembers from "../eventMembers.js";
import type * as events from "../events.js";
import type * as expirationReminders from "../expirationReminders.js";
import type * as faces from "../faces.js";
import type * as lib_auth from "../lib/auth.js";
import type * as notifications from "../notifications.js";
import type * as onboardingEvents from "../onboardingEvents.js";
import type * as photoMatches from "../photoMatches.js";
import type * as photos from "../photos.js";
import type * as retention from "../retention.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  eventMembers: typeof eventMembers;
  events: typeof events;
  expirationReminders: typeof expirationReminders;
  faces: typeof faces;
  "lib/auth": typeof lib_auth;
  notifications: typeof notifications;
  onboardingEvents: typeof onboardingEvents;
  photoMatches: typeof photoMatches;
  photos: typeof photos;
  retention: typeof retention;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
