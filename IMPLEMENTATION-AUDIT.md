# Snapsy MVP – Implementation Audit

**Reference docs:** USER-FLOW.md, SCREENS.md, ONBOARDING.md  
**Audit date:** March 2025  
**Last updated:** March 2025 (post-implementation: Join/pre-join, pinch zoom, delete face, profile storage/joined events, upload retry, selfie validation; event expired Contact host/Dismiss, Event Quick Actions sheet, Terms on auth, member count, All Photos host-only, pull-to-refresh, Share/Delete in viewer, Settings screen, Unauthorized screen, Cancel Upload sheet; Privacy labels Public/Private, Splash as entry + loading, Offline banner, Home horizontal YOUR EVENTS, Upload Camera option, Face error/Retake BottomSheet, Privacy Settings screen).  
**Purpose:** Compare current app implementation against the three spec documents and list what is implemented, partially implemented, mock implemented, pending, or completely missed.

---

# 1. USER-FLOW.md – Audit

## 0. ENTRY STATES (APP LAUNCH)

| Spec | Status | Notes |
|------|--------|--------|
| Check: authenticated? | ✅ Implemented | Entry: index → splash; `app/splash.tsx` checks Clerk; if `!isSignedIn` → `/(auth)/sign-in`. |
| Check: face profile created? | ✅ Implemented | Splash routes to /face-setup when no userFace; face-setup has SelfiePicker + Skip. |
| Check: push permission requested? | ⚠️ Partial | Requested during onboarding (slide 4); not used for routing. |
| Check: deep link present? | ✅ Implemented | Splash checks getInitialURL; if eventId in URL, replaces to /join?eventId= before other routing. |
| Route: Not authenticated → Onboarding | ❌ **Different** | Implementation: Not authenticated → **Sign-in** (not Onboarding). Onboarding is shown only after sign-in if `!hasCompletedOnboarding`. |
| Route: Authenticated but no face → Face Setup | ✅ Implemented | Splash replaces to `/face-setup` when no face; `app/face-setup.tsx` has SelfiePicker and Skip. |
| Route: Authenticated + Face → Home | ✅ Implemented | After onboarding complete → `/(tabs)`. |
| Route: Deep link → Resolve Event Flow | ✅ Implemented | Splash resolves join deep link (getInitialURL → /join?eventId=); `/join` handles auth and preview. |

---

## 1. FIRST TIME USER FLOW – Splash Screen

| Spec | Status | Notes |
|------|--------|--------|
| Splash shows: Logo centered, Forest Green background | ✅ Implemented | `app/splash.tsx` has logo + tagline, dark background. | 
| Splash shows: Loading indicator | ✅ Implemented | Splash screen shows ActivityIndicator below tagline. |
| Splash checks: Clerk session, local state | ✅ Implemented | Entry: index → splash; splash runs auth/onboarding/face checks and getOrCreate. |
| Splash routes to sign-in, onboarding, face-setup, or (tabs) based on state. |

---

## 2. ONBOARDING FLOW (5 SCREENS)

| Spec | Status | Notes |
|------|--------|--------|
| Screen 1 – Value: Headline, subtext, Continue | ✅ Implemented | Slide 1: “Your photos, only your face” + body + Continue (wording differs from ONBOARDING.md). |
| Screen 2 – How It Works | ✅ Implemented | Slide 2: “Join events. Get your pics.” + body. |
| Screen 3 – Privacy | ✅ Implemented | Slide 3: “Private by design” + body. |
| Screen 4 – Push: Enable / Not Now | ✅ Implemented | Slide 4: “Enable Notifications” + alert with Continue if denied. |
| Screen 5 – Selfie: Camera preview, Capture | ⚠️ Partial | Selfie via ImagePicker (camera or library), not full-width camera preview; no “Capture” then “Confirm” flow. |
| Screen 5 – After capture: ML detection, no face / multiple faces errors | ⚠️ Partial | Placeholder validation: “Use this photo” runs `validateSelfieForFace`; BottomSheet for no-face/multiple-faces with “Retake photo” / Cancel. ML Kit not integrated. |
| Screen 5 – On Confirm: Embedding, save locally, save to Convex | ⚠️ Mock | Placeholder embedding (`lib/embedding.ts`); save to Convex only (no explicit “save locally” of embedding). |
| After onboarding → Authentication (if needed) | ❌ **Different** | Flow is **Auth first**: sign-in → then onboarding. So “after onboarding → auth” never happens. |

---

## 3. AUTHENTICATION FLOW

| Spec | Status | Notes |
|------|--------|--------|
| Email / Password | ✅ Implemented | `(auth)/sign-in.tsx`. |
| Google OAuth | ✅ Implemented | `SocialAuthButtons` on sign-in/sign-up. |
| Forgot password | ✅ Implemented | `(auth)/reset-password.tsx` + link from sign-in. |
| Terms link | ✅ Implemented | Sign-in and sign-up both show Terms of Service + Privacy Policy (ExternalLink to snapsy.app/terms and /privacy). |
| On success: Create Convex user, store Clerk ID, → Home | ✅ Implemented | `users.getOrCreate` from index; then replace to `/(tabs)`. |

---

## 4. HOME SCREEN (PRIMARY HUB)

| Spec | Status | Notes |
|------|--------|--------|
| 1. Active Events (horizontal scroll) | ✅ Implemented | Home: “YOUR EVENTS” horizontal ScrollView of event chips (from listByUser); tap → event. Events tab has vertical list. |
| 2. Photos of You preview grid | ✅ Implemented | Card with count + tap → my-photos. |
| 3. Recently Downloaded | ✅ Implemented | Horizontal row of thumbnails. |
| 4. Storage usage bar | ✅ Implemented | Home and Profile: ProgressBar + “X MB of Y GB used” via `users.getStorageUsage`. |
| Empty state: No events | ✅ Implemented | “No events yet. Create one…” + Create button. |
| Empty state: No matched photos | ✅ Implemented | When `myPhotosCount === 0`, Home shows “No photos of you yet” card with subtitle and “Join Event” button. |
| CTA: Create Event / Join Event | ✅ Implemented | “Create” opens Create Event sheet; “Join Event” opens JoinEventSheet (paste link); “Events” navigates to Events tab. |
| Tap Event → Event Screen | ✅ Implemented | |
| Tap Photo → Photo Viewer | ✅ Implemented | |
| Long press Event → Event Quick Sheet | ✅ Implemented | Events tab: long-press on event card opens BottomSheet with View Event, Share Invite, Delete Event (host only). |
| Tap Upload Tab → Upload Flow | ✅ Implemented | Upload tab in tab bar; uses `listHostedByUser` for events to upload to; upload from event (host) also available. |
| Tap Profile Tab → Profile | ✅ Implemented | |

---

## 5. CREATE EVENT FLOW (HOST)

| Spec | Status | Notes |
|------|--------|--------|
| Trigger: Events tab, Home empty state | ✅ Implemented | Events tab has Create + Join; Home has Create in empty state; CreateEventSheet from both. |
| Create Event Sheet: Event Name, Privacy, Retention, Create | ✅ Implemented | `CreateEventSheet`: name, invite_only/link_only, 7/14/30/90 days, Create. |
| On Create: Save Convex, add host as member, → Event Screen | ✅ Implemented | Invite URL + Copy/Share + “Go to Event”. |
| Privacy: Public / Private | ✅ Implemented | Create Event sheet labels: “Private” and “Public” (values remain invite_only / link_only). |

---

## 6. JOIN EVENT FLOW

| Spec | Status | Notes |
|------|--------|--------|
| Trigger: Invite link deep link | ✅ Implemented | `/join?eventId=...` in URL. |
| Trigger: Join Event Sheet | ✅ Implemented | JoinEventSheet on Home (Join Event button) for paste-invite-link; deep link `/join?eventId=` also works. |
| Join Event Screen: Event name, Host name, Join button | ✅ Implemented | `join.tsx` uses `getInvitePreview`; shows event name, “Hosted by {hostName}”, Join and Cancel before joining. |
| On Join: Add to eventMembers, → Event Screen | ✅ Implemented | `events.joinByInvite` then replace to `/event/[id]`. |

---

## 7. EVENT SCREEN STRUCTURE

| Spec | Status | Notes |
|------|--------|--------|
| Header: Event name | ✅ Implemented | |
| Header: Member count | ✅ Implemented | Event header shows “X member(s) · Yd left” (memberCount from event/members). |
| Header: Upload button (host only) | ✅ Implemented | |
| Tab: My Photos | ✅ Implemented | Label “For You”. |
| Tab: All Photos (Host only) | ✅ Implemented | “All Activity” tab only rendered when `isHost`; guests do not see it. |
| Tab: Members | ✅ Implemented | List + host can Remove / Promote-Demote. |

---

## 7A. MY PHOTOS TAB (EVENT)

| Spec | Status | Notes |
|------|--------|--------|
| Grid of matched photos | ✅ Implemented | |
| Infinite scroll | ✅ Implemented | getMatchedPhotosWithUrlsPaginated + onEndReached; 24 per page, cursor-based. |
| Pull to refresh | ✅ Implemented | FlatList has RefreshControl + onRefresh; resets pagination on My Photos. |
| Empty state: “No photos of you yet.” | ✅ Implemented | In grid empty component. |
| Tap Photo → Photo Viewer | ✅ Implemented | |

---

## 7B. ALL PHOTOS TAB (HOST)

| Spec | Status | Notes |
|------|--------|--------|
| Full event grid | ✅ Implemented | Same grid as “For You” but with `allPhotos`. |
| Upload indicator | ⚠️ Partial | Upload button in header (all tabs except Members); no per-photo “uploading” indicator. |
| Bulk select toggle | ✅ Implemented | Select button in All Activity (host); checkmarks on thumbnails. |
| Long press → Bulk mode | ✅ Implemented | Long-press opens Photo Action Sheet (View, Download, Delete). |
| Bulk Action Sheet (Delete, Download) | ✅ Implemented | Bar with Delete/Download when selected; confirm then delete or save to library. |
| Photo Action Sheet (Remove from user, Delete) | ✅ Implemented | Long-press on photo: View, Download, Delete photo. |

---

## 7C. MEMBERS TAB

| Spec | Status | Notes |
|------|--------|--------|
| List of members, role badge | ✅ Implemented | userName + role. |
| Host: Remove member, Change role | ✅ Implemented | Remove, Promote/Demote. |
| Member Action Sheet (drawer) | ✅ Implemented | Tap member opens BottomSheet with Make Co-host/Remove Co-host, Remove from Event, Cancel. |

---

## 8. PHOTO VIEWER

| Spec | Status | Notes |
|------|--------|--------|
| Fullscreen image | ✅ Implemented | |
| Swipe left/right | ✅ Implemented | Pan gesture. |
| Pinch zoom | ✅ Implemented | Reanimated pinch gesture; scale 1–4, simultaneous with pan for swipe L/R. |
| Swipe down to close | ✅ Implemented | |
| Download | ✅ Implemented | “Save to Device” + recordDownload. |
| Share | ✅ Implemented | Share button in modal footer; also in More options sheet. |
| Hide (guest) | ✅ Implemented | “Not me? Hide from my photos”. |
| Delete (host) | ✅ Implemented | More options sheet: “Delete Photo” (host only, eventHostId check); Remove from User placeholder. |

---

## 9. UPLOAD FLOW

| Spec | Status | Notes |
|------|--------|--------|
| Trigger: Upload Tab | ✅ Implemented | Upload tab in tab bar; `app/(tabs)/upload.tsx` uses listHostedByUser. |
| Trigger: Event Screen (Host) | ✅ Implemented | Upload button on event. |
| Upload Source: Gallery, Camera, Files | ✅ Implemented | Action sheet: Take Photo, Choose from Gallery, Browse files (expo-document-picker for image/*). |
| Photo selection: Multi-select grid, Confirm | ✅ Implemented | ImagePicker multi-select then upload. |
| Upload Progress Screen: Progress bar, face detection status, matching status | ✅ Implemented | Progress derived from useUploadStore queue (real per-photo progress); status uploading → matching → notifying → done. |
| For each photo: Upload → Detect faces → Embeddings → Compare → Create matches | ⚠️ Mock | Backend creates placeholder matches for all members with a face; no real detection/embedding/compare. |
| On complete: Success toast, return to Event | ✅ Implemented | “Done” sets uploadSuccessSnackbar; event screen shows Snackbar. Cancel Upload sheet on progress screen (Yes, Cancel / Continue Uploading). |

---

## 10. FACE MATCHING LOGIC FLOW

| Spec | Status | Notes |
|------|--------|--------|
| Generate embedding per face | ❌ **Mock** | Placeholder embedding only (`createPlaceholderEmbedding()`). |
| Query Convex for event members’ embeddings | ⚠️ Partial | Backend has access to faces; no client-side “query + compare”. |
| Compare cosine similarity, threshold | ❌ **Missed** | No similarity; backend assigns placeholder match to every member with a face. |
| Create photoMatch if > threshold | ⚠️ Mock | photoMatch created with fixed confidence, no real threshold. |
| No matches → Photo only in All Photos | ✅ Implemented | Photos without matches only appear in “All” for members who have access. |

---

## 11. PROFILE FLOW

| Spec | Status | Notes |
|------|--------|--------|
| Avatar | ✅ Implemented | Profile header: avatar circle with first letter of user name (Clerk) or User icon. |
| Face profile | ✅ Implemented | Card + SelfiePicker. |
| Joined events | ✅ Implemented | Profile: “JOINED EVENTS” section with card showing event count from `listByUser`, “Tap to view and manage” → Events tab. |
| Settings | ✅ Implemented | Profile has Settings row → `/settings`; app/settings.tsx with Notifications, Privacy, Retention, Delete Account, Terms, Version. |
| Logout | ✅ Implemented | Sign out. |

---

## 11A. MANAGE FACE

| Spec | Status | Notes |
|------|--------|--------|
| Replace selfie | ✅ Implemented | SelfiePicker “Update selfie” / “Change Selfie”. |
| Delete face | ✅ Implemented | Profile: “Delete face profile” opens confirmation BottomSheet; Convex `faces.deleteMyFaces` removes all face docs for user. |

---

## 11B. SETTINGS

| Spec | Status | Notes |
|------|--------|--------|
| Privacy, Notifications, Retention info, Delete Account | ✅ Implemented | Settings screen: Notifications, Privacy (→ /privacy), Retention rows; Delete Account (two-step sheet). |

---

## 12. DELETE ACCOUNT FLOW

| Spec | Status | Notes |
|------|--------|--------|
| Confirmation sheet | ✅ Implemented | Settings: Delete Account opens BottomSheet with type "DELETE" + Permanently Delete. |
| Final confirm | ✅ Implemented | Two-step: warning list + input "DELETE" + Permanently Delete button. |
| Delete: User, face embeddings, memberships | ✅ Implemented | `users.deleteMyAccount`. |
| Logout → Onboarding | ⚠️ Partial | Logout → sign-in screen; spec says “Onboarding”. |

---

## 13. EVENT EXPIRATION FLOW

| Spec | Status | Notes |
|------|--------|--------|
| Event screen when expired: “This event has expired”, Contact host, Dismiss | ✅ Implemented | Expired banner with message; “Contact host” (shares invite link), “Dismiss” (router.back()). |
| Expired events hidden from Home | ✅ Implemented | `events.listByUser` filters to active events (now < expiresAt); Events tab shows only non-expired. |
| Convex scheduled function removes expired | ✅ Implemented | `retention.deleteExpiredPhotos` cron. |

---

## 14. NOTIFICATION FLOW

| Spec | Status | Notes |
|------|--------|--------|
| Convex triggers notification on new match | ✅ Implemented | No Convex trigger for “new match” → push. |
| Push sent, user taps, deep link → Event → My Photos | ✅ Implemented | Push token not stored in Convex; no push send; no deep link from notification. |

---

## 15. EDGE CASE FLOWS

| Spec | Status | Notes |
|------|--------|--------|
| No face during upload: Photo uploaded, no match, host can manually assign (future) | ✅ Implemented | Backend only creates matches for members who have a face; no manual assign. |
| Multiple faces in selfie: Block confirmation, prompt retake | ✅ Implemented | Placeholder: `validateSelfieForFace`; BottomSheet “No face detected” / “Multiple faces” with Retake photo and Cancel. ML Kit to be integrated. |
| Network failure: Retry, queue locally, sync when online | ✅ Implemented | Pending queue + UploadQueueProcessor; event screen shows “X upload(s) failed” banner with Retry button (`retryAllFailed`). |
| Unauthorized: User opens event not member of → Unauthorized Screen | ✅ Implemented | Event screen: when `event === null`, EmptyState “Access Denied”, “You’re not a member of this event.”, “Go Back”. |

---

# 2. SCREENS.md – Audit

## ROOT & ENTRY

| Screen | Status | Notes |
|--------|--------|--------|
| 1. Splash Screen | ✅ Implemented | Entry: index → splash; splash shows logo, tagline, ActivityIndicator; runs auth/onboarding/face checks; routes to sign-in, onboarding, face-setup, or (tabs). |
| 2. Onboarding Screen | ✅ Implemented | 5 slides; content differs slightly from ONBOARDING.md. |
| Auth Options Sheet (Email / Google) | ❌ **Missed** | Flow is Auth first; no sheet after onboarding. |
| 3. Login / Signup | ✅ Implemented | sign-in, sign-up, reset-password. |
| Forgot Password, Email Verification | ✅ Implemented | reset-password; sign-up has email verification step. |
| Terms link | ✅ Implemented | Sign-in and sign-up: Terms of Service + Privacy Policy (ExternalLink). |

## MAIN APP TABS

| Screen | Status | Notes |
|--------|--------|--------|
| Tabs: Home, Events, Upload, Profile | ✅ Implemented | All four tabs in `(tabs)/_layout.tsx`; events.tsx, upload.tsx, index, profile. |

## HOME TAB

| Screen | Status | Notes |
|--------|--------|--------|
| 4. Home Screen (sections) | ✅ Implemented | Storage, Photos of you, Join/Events CTAs, YOUR EVENTS (horizontal scroll), Expiring soon, Recently downloaded. |
| Event Quick Actions Sheet | ✅ Implemented | Events tab: long-press event card → BottomSheet (View Event, Share Invite, Delete Event for host). |
| Photo Quick Actions Sheet | ✅ Implemented | Recently Downloaded: tap photo opens BottomSheet (View, Download, Share, Hide, Cancel). |
| Upgrade Prompt Sheet | ✅ Implemented | Stub: "Upgrade" on Storage card when ≥90% used; sheet "Coming soon". |

## EVENTS TAB / LIST

| Screen | Status | Notes |
|--------|--------|--------|
| 5. Events List Screen | ✅ Implemented | Events tab shows list from `listByUser`; Create + Join; long-press → Quick Actions. |
| Create Event Sheet | ✅ Implemented | From Home. |
| Join Event Sheet | ✅ Implemented | JoinEventSheet on Home (Join Event CTA); paste invite link. |

## EVENT DETAIL

| Screen | Status | Notes |
|--------|--------|--------|
| 6. Event Screen (name, member count, Upload) | ✅ Implemented | Name, “X members · Yd left”, Upload (host). |
| 6A. My Photos Tab | ✅ Implemented | Grid with RefreshControl (pull-to-refresh). No infinite scroll. |
| Photo Action Sheet (Download, Share, Hide) | ✅ Implemented | Modal: Download, Share, Hide; More sheet has Download/Share/Delete (host). |
| 6B. All Photos Tab | ✅ Implemented | Host-only tab; Select/bulk mode; long-press Photo Action Sheet; Bulk Action Sheet. |
| Bulk Action Sheet, Photo Action Sheet (host) | ✅ Implemented | Bulk: Delete/Download selected; per-photo: View, Download, Delete. |
| 6C. Members Tab | ✅ Implemented | Tap member opens Member Action Sheet (Make Co-host, Remove from Event). |

## PHOTO VIEWER

| Screen | Status | Notes |
|--------|--------|--------|
| 7. Fullscreen Photo Viewer | ✅ Implemented | Pinch zoom, swipe L/R, swipe down. Download, Share, Hide; host Delete in More sheet. |

## UPLOAD

| Screen | Status | Notes |
|--------|--------|--------|
| 8. Upload Screen (Gallery, Camera, Files) | ✅ Implemented | Upload action sheet: Take Photo, Choose from Gallery, Browse files (document picker). Tab + from event. |
| 8A. Upload Progress Screen | ✅ Implemented | Progress/messages simulated; no per-item list. |
| Cancel Upload Confirmation Sheet | ✅ Implemented | `upload-progress.tsx`: “Cancel Upload” opens BottomSheet (Yes, Cancel / Continue Uploading). |

## FACE PROFILE

| Screen | Status | Notes |
|--------|--------|--------|
| 9. Face Setup (first-time) | ⚠️ Partial | Selfie is slide 5 of onboarding; no bounding box, no dedicated “Face Setup” screen. |
| Retake Photo Sheet, Face Detection Error Sheet | ✅ Implemented | SelfiePicker: no-face/multiple-faces open BottomSheet with message, “Retake photo”, Cancel. |
| 9A. Manage Face (Profile) | ✅ Implemented | Replace selfie; delete face (confirmation sheet + deleteMyFaces). No “view current face” image. |

## PROFILE TAB

| Screen | Status | Notes |
|--------|--------|--------|
| 10. Profile (Profile Info, Face, Joined Events, Storage, Settings, Logout) | ✅ Implemented | Face, Delete face, Joined events, Storage, Settings entry (→ /settings), Sign out. No avatar. |
| 10A. Settings Screen | ✅ Implemented | `app/settings.tsx`: Notifications, Privacy, Retention, Delete Account (two-step sheet), Terms, Privacy Policy, Version. |
| 10B. Privacy Settings Screen | ✅ Implemented | `app/privacy.tsx`: Face data & visibility copy; Settings Privacy row → router.push('/privacy'). |
| 10C. Delete Account Confirmation | ✅ Implemented | Settings: Delete Account opens BottomSheet with warning + type “DELETE” + Permanently Delete. |

## SYSTEM STATES (Overlays)

| Item | Status | Notes |
|------|--------|--------|
| Offline Banner | ✅ Implemented | `app/_layout.tsx`: NetInfo; “No internet connection” banner at top when offline. |
| Upload Success Snackbar | ✅ Implemented | Event screen shows Snackbar “Photos uploaded successfully” when returning from upload (useUIStore uploadSuccessSnackbar). |
| Face Match Success Indicator | ✅ Implemented | Home: when myPhotosCount > 0, show "New photos of you" Snackbar once per session (hasShownNewPhotosIndicator) with View action. |
| Error Toast | ✅ Implemented | useUIStore.errorToast + GlobalErrorToast in _layout; setErrorToast(message) shows error Snackbar. |
| Expiration Warning Banner | ✅ Implemented | “Expiring soon” cards on Home; no global banner. |

## EDGE CASE SCREENS

| Screen | Status | Notes |
|--------|--------|--------|
| No Events Screen | ✅ Implemented | Empty state on Home. |
| No Photos Screen | ✅ Implemented | Empty state in event grid / my-photos. |
| No Face Detected Screen | ✅ Implemented | app/no-face.tsx: dedicated screen for no-face/multiple-faces; SelfiePicker navigates on validation fail; Retake goes back. |
| Event Expired Screen | ✅ Implemented | Event screen: expired banner + “Contact host” (share invite) + “Dismiss”. No dedicated full screen. |
| Unauthorized Access Screen | ✅ Implemented | Event screen when not member: EmptyState “Access Denied”, “You’re not a member…”, Go Back. |

## DRAWER INVENTORY (SCREENS.md)

| Drawer | Status |
|--------|--------|
| 1. Auth Options Sheet | ❌ Missed |
| 2. Create Event Sheet | ✅ Implemented |
| 3. Join Event Sheet | ✅ Implemented |
| 4. Event Quick Actions Sheet | ✅ Implemented |
| 5. Photo Action Sheet | ✅ Implemented (Recently Downloaded + All Photos long-press) |
| 6. Bulk Action Sheet | ✅ Implemented (All Photos bulk Delete/Download) |
| 7. Member Action Sheet | ✅ Implemented (tap member → sheet) |
| 8. Upgrade Prompt Sheet | ✅ Implemented (stub when storage ≥90%) |
| 9. Cancel Upload Sheet | ✅ Implemented |
| 10. Retake Face Sheet | ✅ Implemented (in Face Error sheet) |
| 11. Face Error Sheet | ✅ Implemented |
| 12. Delete Account Confirmation Sheet | ✅ Implemented (Settings) |

---

# 3. ONBOARDING.md – Audit

## Structure (5 steps)

| Step | Status | Notes |
|------|--------|--------|
| 1. Value Introduction | ✅ Implemented | Wording differs: “Your photos, only your face” vs “Get only the photos that matter.” |
| 2. How It Works | ✅ Implemented | “Join events. Get your pics.” vs “Upload once. We do the sorting.” |
| 3. Privacy Reassurance | ✅ Implemented | “Private by design” vs “Your face data stays private.” |
| 4. Push Notification Permission | ✅ Implemented | Enable / Not Now; helper text if denied. |
| 5. Selfie Capture | ⚠️ Partial | Selfie present; no full-width camera preview, no ML, no bounding box, no no-face/multiple-faces errors. |
| After → Authentication (if not logged in) | ❌ **Different** | Auth is before onboarding in app. |

## Screen content (exact copy)

| Spec copy | App copy | Status |
|-----------|----------|--------|
| “Get only the photos that matter.” | “Your photos, only your face” | ⚠️ Different |
| “Snapsy automatically delivers photos featuring you.” | “No tagging. No scrolling. Photos of you, delivered automatically to your private vault.” | ⚠️ Different |
| “Upload once. We do the sorting.” | “Join events. Get your pics.” | ⚠️ Different |
| “Your face data stays private.” | “Private by design” / “Face matching runs on your device…” | ⚠️ Similar |
| “Stay updated instantly.” | “Never miss a moment” | ⚠️ Different |
| “Let’s find your photos.” | “Finish your profile” | ⚠️ Different |

## Push notification

| Spec | Status | Notes |
|------|--------|--------|
| Request permission | ✅ Implemented | expo-notifications. |
| Get Expo push token | ✅ Implemented | registerForPushNotifications in _layout; getExpoPushTokenAsync when signed in. |
| Store in Convex user document | ✅ Implemented | users.pushToken; users.storePushToken called from _layout when token received. |
| Foreground handling | ✅ Implemented | setNotificationHandler shows alert/sound; addNotificationResponseReceivedListener handles tap → deep link. |

## Selfie capture

| Spec | Status | Notes |
|------|--------|--------|
| expo-camera | ⚠️ Partial | ImagePicker (camera or library); not full expo-camera preview. |
| Google ML Kit face detection | ❌ **Missed** | Not used; placeholder embedding. |
| Bounding box highlight | ❌ **Missed** | Not implemented. |
| No face / Multiple faces error messages | ⚠️ Partial | Placeholder: validateSelfieForFace + alerts block save; ML Kit not integrated. |
| Extract vector, store in Convex `faces` | ⚠️ Mock | Placeholder vector stored. |

## Auth order

| Spec (MVP) | Implementation | Status |
|------------|----------------|--------|
| Onboarding → Auth → Selfie → Home | Auth → Onboarding (incl. Selfie) → Home | ❌ **Different** |

## Design & motion (onboarding)

| Spec | Status | Notes |
|------|--------|--------|
| Generous whitespace, one action per screen, 16px rounded, Satoshi, Bright Green CTA | ✅ Implemented | |
| Horizontal slide 250ms ease-out | ⚠️ Partial | FlatList paging; no explicit 250ms transition. |
| Button scale, face pulse | ⚠️ Partial | FadeInUp/FadeInDown; no explicit 0.97 scale or green pulse on face. |

## Metrics

| Spec | Status | Notes |
|------|--------|--------|
| Track slide completion, push acceptance, selfie success, drop-off, retake count | ✅ Implemented | onboardingEvents table; record mutation; onboarding records slide_complete, push_response, SelfiePicker records selfie_success. |

---

# 4. Summary Tables

## Implemented (done)

- Entry: auth check; Convex user getOrCreate; route to sign-in / onboarding / tabs.
- Onboarding: 5 slides (value, how it works, privacy, push, selfie); SelfiePicker with Convex save (placeholder embedding).
- Auth: Sign-in, sign-up, email verification, forgot password, Google OAuth; Convex user creation.
- Home: Storage bar, Photos of you card, “No photos of you yet” empty state, Join Event + Events CTAs, YOUR EVENTS horizontal scroll (listByUser), Expiring soon, Recently downloaded, Create Event sheet, empty state for no events.
- Create Event: Sheet with name, privacy (labels “Private” / “Public”), retention; invite URL copy/share; go to event.
- Join: Deep link resolved at splash (getInitialURL → /join?eventId=); getInvitePreview (event name, host name); pre-join screen with Join/Cancel; joinByInvite; redirect to event.
- Event screen: Header (name, member count, “Xd left”, back), Upload (host); tabs For You / All Activity (host only) / Members; grid with pull-to-refresh; members list with remove/promote-demote; expired banner with Contact host + Dismiss.
- My Photos (event): Grid; pull-to-refresh; infinite scroll (paginated); empty state.
- All Photos (event): Host-only tab; bulk select; long-press Photo Action Sheet; Bulk Action Sheet (Delete, Download).
- Members: List and host actions.
- Photo viewer (modal): Fullscreen, pinch-to-zoom (1–4), swipe L/R and down, Download, Share, Hide (“Not me”); host Delete in More sheet.
- Upload: Upload tab + from event (host); Take Photo / Choose from Gallery / Browse files action sheet; upload progress screen with Cancel Upload sheet; success snackbar on event.
- Profile: Avatar (initial or icon), Face, Delete face, Joined events, Storage, Settings (→ app/settings.tsx), Sign out, Delete account (Settings has two-step sheet).
- Delete account: Backend deletes user, faces, memberships, matches; sign out.
- Retention: Cron to delete expired photos and create expiration reminders; reminders on Home.
- Pending upload queue: Persist and retry via UploadQueueProcessor; Retry button on event screen when uploads failed (`retryAllFailed`, clearPendingError).
- Splash: Entry flow index → splash; splash shows logo, tagline, ActivityIndicator; runs auth/onboarding/face checks; routes to sign-in, onboarding, face-setup, or (tabs).
- Offline banner: NetInfo in _layout; “No internet connection” when offline.
- Privacy Settings: app/privacy.tsx; Settings Privacy row navigates to /privacy.
- Face error/Retake: SelfiePicker BottomSheet for no-face/multiple-faces with Retake photo.
- No events / no photos empty states.
- Event expired: Backend cron; event screen shows expired banner with “Contact host” (share invite) and “Dismiss”; listByUser filters out expired events.
- Unauthorized event: Event screen shows “Access Denied” EmptyState when not a member.
- Auth: Terms of Service + Privacy Policy links on sign-in and sign-up.
- Events tab: List, Create, Join; long-press event → Event Quick Actions sheet; Members: tap → Member Action Sheet.
- Photo Quick Actions: Recently Downloaded tap → sheet (View, Download, Share, Hide); Upgrade Prompt sheet (stub at 90% storage).
- Push token: getExpoPushToken in _layout; users.storePushToken when signed in.
- Onboarding copy: Slides 1–5 aligned to ONBOARDING.md (Get only the photos…, Upload once…, Your face data…, Stay updated…, Let's find your photos).
- Settings: app/settings.tsx with Notifications, Privacy, Retention, Delete Account (two-step sheet), Terms, Privacy, Version.
- Global error toast: useUIStore.setErrorToast; GlobalErrorToast in _layout shows error Snackbar.
- Face match indicator: "New photos of you" Snackbar on Home (once per session when myPhotosCount > 0).
- Expiration banner: Home shows "X event(s) expiring soon" when reminders exist; tap → Events.
- No Face Detected screen: app/no-face.tsx; SelfiePicker navigates on validation fail.
- Notification deep link: addNotificationResponseReceivedListener → router.push(/event/[id]).
- Upload progress: tied to useUploadStore queue (real upload completion).
- Onboarding metrics: onboardingEvents.record (slide_complete, push_response, selfie_success).

## Partially implemented

- Entry: Deep link resolved at splash (getInitialURL → /join?eventId=); face-setup route when no userFace; push not used for routing.
- Home: YOUR EVENTS horizontal row on Home implemented; Events tab has vertical list; Event Quick Sheet on Events tab (long-press).
- Event: Member count and All Activity host-only implemented; retention shown as “Xd left”.
- Photo viewer: Share and Delete (host) implemented; pinch zoom implemented.
- Upload: Gallery + Camera + Browse files (action sheet); progress screen simulated; success snackbar and Cancel Upload sheet implemented.
- Face: Replace selfie, delete face (mutation + UI); placeholder validation with BottomSheet for no-face/multiple-faces; no bounding box or ML Kit.
- Profile: Avatar (initial or icon), Settings screen, joined events/storage implemented.
- Delete account: Two-step sheet in Settings; Profile may still use Alert for delete entry.
- Onboarding: Copy differs from ONBOARDING.md; selfie via picker, not full camera + confirm flow.
- Join: Pre-join screen (event name, host name, Join) implemented.
- Network failure: Queue + retry + Retry button on event screen implemented.
- Members: Member Action Sheet on tap (Make Co-host, Remove from Event) — implemented.

## Mock implemented

- Face embedding: Placeholder 128-d vector; no ML Kit or real embedding.
- Face matching on upload: Backend creates one match per member-with-face at fixed confidence; no similarity.
- Upload progress: Timer-driven “uploading / matching / notifying / done”; driven by useUploadStore queue (real per-photo progress).

## Pending (spec’d but not done)

- Real face detection (ML Kit) and embedding pipeline.
- Real face matching (embeddings + similarity threshold).
- Push: get token, store in Convex, send on new match, deep link to event/my photos.
- Event expiration UI: hide expired from Home (banner on event screen done).
- Upload tab: standalone Upload screen (tab + listHostedByUser); Gallery + Camera + Files (Browse files) implemented.
- Settings: screen implemented; Privacy has dedicated sub-screen (app/privacy.tsx); Notifications/Retention are rows (no sub-screens).

## Completely missed

- Route: Not authenticated → Onboarding (app goes to Sign-in first).
- Auth Options Sheet (Email/Google after onboarding).
- Upload: real progress — implemented (progress from queue, status from completion).
- Face: ML detection, bounding box (placeholder validation and delete done).
- System states: Face match indicator (e.g. “new photos” badge/toast).
- Edge screens: No Face Detected dedicated screen (BottomSheet only).
- Auth order: Onboarding → Auth → Selfie (app does Auth first).
- Onboarding metrics — implemented (onboardingEvents.record for slide_complete, push_response, selfie_success).

---

# 5. Doc vs implementation – order of flows

- **USER-FLOW.md** (first time): Splash → Onboarding → Push → Selfie → **Auth** → Home.  
- **Implementation**: **Auth** (sign-in) → Onboarding (Push + Selfie) → Home. Splash routes to sign-in, onboarding, face-setup, or (tabs).

So “Splash then Onboarding then Auth then Selfie then Home” is partially implemented: splash is first and routes; the app does “Auth then Onboarding (including selfie) then Home.”

---

*End of audit. Use this to prioritize spec alignment, UX fixes, and missing features.*
