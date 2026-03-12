import Constants from 'expo-constants';

const ENV = {
  clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '',
  convexUrl: process.env.EXPO_PUBLIC_CONVEX_URL ?? '',
};

export function getEnv() {
  return ENV;
}

export function getClerkPublishableKey() {
  const key = Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
    ?? process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
    ?? ENV.clerkPublishableKey;
  return key;
}

export function getConvexUrl() {
  const url = Constants.expoConfig?.extra?.EXPO_PUBLIC_CONVEX_URL
    ?? process.env.EXPO_PUBLIC_CONVEX_URL
    ?? ENV.convexUrl;
  return url;
}
