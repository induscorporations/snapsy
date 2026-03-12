# Snapsy MVP – Implementation Audit

**Reference docs:** USER-FLOW.md, SCREENS.md, ONBOARDING.md  
**Audit date:** March 2025  
**Purpose:** Compare current app implementation against the three spec documents and list what is implemented, partially implemented, mock implemented, pending, or completely missed.

---

# 1. USER-FLOW.md – Audit

## 0. ENTRY STATES (APP LAUNCH)

| Spec | Status | Notes |
|------|--------|--------|
| Check: authenticated? | ✅ Implemented | `app/index.tsx`: if `!isSignedIn` → `/(auth)/sign-in`. |
| Check: face profile created? | ❌ **Missed** | No route to “Face Setup” when authenticated but no face. User goes to tabs; face is only required inside onboarding. |
| Check: push permission requested? | ⚠️ Partial | Requested during onboarding (slide 4); not used for routing. |
| Check: deep link present? | ⚠️ Partial | `/join?eventId=` works when app opens to join; no central “resolve deep link first” entry. |
| Route: Not authenticated → Onboarding | ❌ **Different** | Implementation: Not authenticated → **Sign-in** (not Onboarding). Onboarding is shown only after sign-in if `!hasCompletedOnboarding`. |
| Route: Authenticated but no face → Face Setup | ❌ **Missed** | No dedicated Face Setup screen; selfie is only in onboarding. |
| Route: Authenticated + Face → Home | ✅ Implemented | After onboarding complete → `/(tabs)`. |
| Route: Deep link → Resolve Event Flow | ⚠️ Partial | `/join` exists; not all deep links (e.g. event ID only) resolved at root. |

---

## 1. FIRST TIME USER FLOW – Splash Screen

| Spec | Status | Notes |
|------|--------|--------|
| Splash shows: Logo centered, Forest Green background | ✅ Implemented | `app/splash.tsx` has logo + tagline, dark background. | 
| Splash shows: Loading indicator | ❌ **Missed** | No loading indicator on splash; `index` has ActivityIndicator but is a different screen. |
| Splash checks: Clerk session, local state | ❌ **Missed** | Splash is never used as entry; `index` does the checks and never navigates to `splash`. |
| Splash → Route to Onboarding | ❌ **Missed** | Entry is `index` → sign-in or onboarding or tabs; splash is registered but unused in flow. |

---

## 2. ONBOARDING FLOW (5 SCREENS)

| Spec | Status | Notes |
|------|--------|--------|
| Screen 1 – Value: Headline, subtext, Continue | ✅ Implemented | Slide 1: “Your photos, only your face” + body + Continue (wording differs from ONBOARDING.md). |
| Screen 2 – How It Works | ✅ Implemented | Slide 2: “Join events. Get your pics.” + body. |
| Screen 3 – Privacy | ✅ Implemented | Slide 3: “Private by design” + body. |
| Screen 4 – Push: Enable / Not Now | ✅ Implemented | Slide 4: “Enable Notifications” + alert with Continue if denied. |
| Screen 5 – Selfie: Camera preview, Capture | ⚠️ Partial | Selfie via ImagePicker (camera or library), not full-width camera preview; no “Capture” then “Confirm” flow. |
| Screen 5 – After capture: ML detection, no face / multiple faces errors | ❌ **Mock / Missed** | No ML Kit; no “no face” or “multiple faces” validation; placeholder embedding saved for any image. |
| Screen 5 – On Confirm: Embedding, save locally, save to Convex | ⚠️ Mock | Placeholder embedding (`lib/embedding.ts`); save to Convex only (no explicit “save locally” of embedding). |
| After onboarding → Authentication (if needed) | ❌ **Different** | Flow is **Auth first**: sign-in → then onboarding. So “after onboarding → auth” never happens. |

---

## 3. AUTHENTICATION FLOW

| Spec | Status | Notes |
|------|--------|--------|
| Email / Password | ✅ Implemented | `(auth)/sign-in.tsx`. |
| Google OAuth | ✅ Implemented | `SocialAuthButtons` on sign-in/sign-up. |
| Forgot password | ✅ Implemented | `(auth)/reset-password.tsx` + link from sign-in. |
| Terms link | ❌ **Missed** | No Terms of Service / Privacy link on sign-in or sign-up. |
| On success: Create Convex user, store Clerk ID, → Home | ✅ Implemented | `users.getOrCreate` from index; then replace to `/(tabs)`. |

---

## 4. HOME SCREEN (PRIMARY HUB)

| Spec | Status | Notes |
|------|--------|--------|
| 1. Active Events (horizontal scroll) | ⚠️ Partial | “YOUR EVENTS” is a vertical list/cards, not horizontal scroll. |
| 2. Photos of You preview grid | ✅ Implemented | Card with count + tap → my-photos. |
| 3. Recently Downloaded | ✅ Implemented | Horizontal row of thumbnails. |
| 4. Storage usage bar | ✅ Implemented | ProgressBar + “X MB of 2 GB used”. |
| Empty state: No events | ✅ Implemented | “No events yet. Create one…” + Create button. |
| Empty state: No matched photos | ⚠️ Partial | “Photos of you” card only shows when `myPhotosCount > 0`; no explicit “No photos of you yet” message on Home (message exists on my-photos). |
| CTA: Create Event / Join Event | ⚠️ Partial | “Create” opens Create Event sheet; no “Join Event” CTA or paste-link entry on Home. |
| Tap Event → Event Screen | ✅ Implemented | |
| Tap Photo → Photo Viewer | ✅ Implemented | |
| Long press Event → Event Quick Sheet | ❌ **Missed** | No long-press on event cards; no Event Quick Actions sheet (View Event, Share Invite, Delete Event). |
| Tap Upload Tab → Upload Flow | ❌ **Missed** | No Upload tab in tab bar (only Home + Profile). Upload is only from Event screen (host). |
| Tap Profile Tab → Profile | ✅ Implemented | |

---

## 5. CREATE EVENT FLOW (HOST)

| Spec | Status | Notes |
|------|--------|--------|
| Trigger: Events tab, Home empty state | ⚠️ Partial | Only from Home (“Create” in YOUR EVENTS); no separate Events tab. |
| Create Event Sheet: Event Name, Privacy, Retention, Create | ✅ Implemented | `CreateEventSheet`: name, invite_only/link_only, 7/14/30/90 days, Create. |
| On Create: Save Convex, add host as member, → Event Screen | ✅ Implemented | Invite URL + Copy/Share + “Go to Event”. |
| Privacy: Public / Private | ⚠️ Partial | Labels are “Invite Only” / “Public Link”, not “Public/Private”. |

---

## 6. JOIN EVENT FLOW

| Spec | Status | Notes |
|------|--------|--------|
| Trigger: Invite link deep link | ✅ Implemented | `/join?eventId=...` in URL. |
| Trigger: Join Event Sheet | ❌ **Missed** | No “Join Event” sheet (paste link) anywhere; join only via URL. |
| Join Event Screen: Event name, Host name, Join button | ❌ **Missed** | `join.tsx` shows only loading or error; no pre-join screen with event name/host name. |
| On Join: Add to eventMembers, → Event Screen | ✅ Implemented | `events.joinByInvite` then replace to `/event/[id]`. |

---

## 7. EVENT SCREEN STRUCTURE

| Spec | Status | Notes |
|------|--------|--------|
| Header: Event name | ✅ Implemented | |
| Header: Member count | ❌ **Missed** | Shows “privacy · Xd left” (and “Xd left” misuses retentionDays); no member count. |
| Header: Upload button (host only) | ✅ Implemented | |
| Tab: My Photos | ✅ Implemented | Label “For You”. |
| Tab: All Photos (Host only) | ⚠️ Partial | “All Activity” tab exists but is visible to **all** members, not host-only. |
| Tab: Members | ✅ Implemented | List + host can Remove / Promote-Demote. |

---

## 7A. MY PHOTOS TAB (EVENT)

| Spec | Status | Notes |
|------|--------|--------|
| Grid of matched photos | ✅ Implemented | |
| Infinite scroll | ❌ **Missed** | FlatList with all data; no pagination/infinite scroll. |
| Pull to refresh | ❌ **Missed** | No RefreshControl. |
| Empty state: “No photos of you yet.” | ✅ Implemented | In grid empty component. |
| Tap Photo → Photo Viewer | ✅ Implemented | |

---

## 7B. ALL PHOTOS TAB (HOST)

| Spec | Status | Notes |
|------|--------|--------|
| Full event grid | ✅ Implemented | Same grid as “For You” but with `allPhotos`. |
| Upload indicator | ⚠️ Partial | Upload button in header (all tabs except Members); no per-photo “uploading” indicator. |
| Bulk select toggle | ❌ **Missed** | No bulk selection mode. |
| Long press → Bulk mode | ❌ **Missed** | No long-press or bulk actions. |
| Bulk Action Sheet (Delete, Download) | ❌ **Missed** | Not implemented. |
| Photo Action Sheet (Remove from user, Delete) | ❌ **Missed** | No per-photo sheet for host (delete/remove from user). |

---

## 7C. MEMBERS TAB

| Spec | Status | Notes |
|------|--------|--------|
| List of members, role badge | ✅ Implemented | userName + role. |
| Host: Remove member, Change role | ✅ Implemented | Remove, Promote/Demote. |
| Member Action Sheet (drawer) | ⚠️ Partial | Actions are inline buttons, not a bottom sheet. |

---

## 8. PHOTO VIEWER

| Spec | Status | Notes |
|------|--------|--------|
| Fullscreen image | ✅ Implemented | |
| Swipe left/right | ✅ Implemented | Pan gesture. |
| Pinch zoom | ❌ **Missed** | Not implemented. |
| Swipe down to close | ✅ Implemented | |
| Download | ✅ Implemented | “Save to Device” + recordDownload. |
| Share | ❌ **Missed** | No Share button in modal. |
| Hide (guest) | ✅ Implemented | “Not me? Hide from my photos”. |
| Delete (host) | ❌ **Missed** | No host-only delete photo action. |

---

## 9. UPLOAD FLOW

| Spec | Status | Notes |
|------|--------|--------|
| Trigger: Upload Tab | ❌ **Missed** | No Upload tab. |
| Trigger: Event Screen (Host) | ✅ Implemented | Upload button on event. |
| Upload Source: Gallery, Camera, Files | ⚠️ Partial | Only **Gallery** (multi-select); no Camera or Files option in upload flow. |
| Photo selection: Multi-select grid, Confirm | ✅ Implemented | ImagePicker multi-select then upload. |
| Upload Progress Screen: Progress bar, face detection status, matching status | ⚠️ Mock | Screen exists; progress and status are **simulated** (timer), not tied to real upload/matching. |
| For each photo: Upload → Detect faces → Embeddings → Compare → Create matches | ⚠️ Mock | Backend creates placeholder matches for all members with a face; no real detection/embedding/compare. |
| On complete: Success toast, return to Event | ⚠️ Partial | “Done” button to go back; no success toast/snackbar. No Cancel Upload sheet. |

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
| Avatar | ❌ **Missed** | No avatar/photo on profile. |
| Face profile | ✅ Implemented | Card + SelfiePicker. |
| Joined events | ❌ **Missed** | No list of joined events on Profile (events are on Home). |
| Settings | ❌ **Missed** | No Settings screen or entry. |
| Logout | ✅ Implemented | Sign out. |

---

## 11A. MANAGE FACE

| Spec | Status | Notes |
|------|--------|--------|
| Replace selfie | ✅ Implemented | SelfiePicker “Update selfie” / “Change Selfie”. |
| Delete face | ❌ **Missed** | No “Delete face” or “Remove embedding”; only replace. No Convex mutation to delete user’s face doc. |

---

## 11B. SETTINGS

| Spec | Status | Notes |
|------|--------|--------|
| Privacy, Notifications, Retention info, Delete Account | ❌ **Missed** | No Settings screen. Delete account exists on Profile directly, not under Settings. Privacy/Notifications/Retention screens not present. |

---

## 12. DELETE ACCOUNT FLOW

| Spec | Status | Notes |
|------|--------|--------|
| Confirmation sheet | ⚠️ Partial | Alert.confirm, not a bottom sheet. |
| Final confirm | ⚠️ Partial | Single confirmation only. |
| Delete: User, face embeddings, memberships | ✅ Implemented | `users.deleteMyAccount`. |
| Logout → Onboarding | ⚠️ Partial | Logout → sign-in screen; spec says “Onboarding”. |

---

## 13. EVENT EXPIRATION FLOW

| Spec | Status | Notes |
|------|--------|--------|
| Event screen when expired: “This event has expired”, Contact host, Dismiss | ❌ **Missed** | No expired-state UI on event screen; backend deletes photos but event doc remains. No “expired” banner or actions. |
| Expired events hidden from Home | ❌ **Missed** | All events from memberships are listed; no filter by expiration. |
| Convex scheduled function removes expired | ✅ Implemented | `retention.deleteExpiredPhotos` cron. |

---

## 14. NOTIFICATION FLOW

| Spec | Status | Notes |
|------|--------|--------|
| Convex triggers notification on new match | ❌ **Missed** | No Convex trigger for “new match” → push. |
| Push sent, user taps, deep link → Event → My Photos | ❌ **Missed** | Push token not stored in Convex; no push send; no deep link from notification. |

---

## 15. EDGE CASE FLOWS

| Spec | Status | Notes |
|------|--------|--------|
| No face during upload: Photo uploaded, no match, host can manually assign (future) | ✅ Implemented | Backend only creates matches for members who have a face; no manual assign. |
| Multiple faces in selfie: Block confirmation, prompt retake | ❌ **Missed** | No validation; any image accepted. |
| Network failure: Retry, queue locally, sync when online | ⚠️ Partial | Pending queue + UploadQueueProcessor retry; no explicit “Retry” button on UI. |
| Unauthorized: User opens event not member of → Unauthorized Screen | ❌ **Missed** | Backend returns Forbidden; app replaces to tabs with no dedicated “Unauthorized” screen/message. |

---

# 2. SCREENS.md – Audit

## ROOT & ENTRY

| Screen | Status | Notes |
|--------|--------|--------|
| 1. Splash Screen | ⚠️ Partial | Exists; not used in entry flow (index does not route to splash). |
| 2. Onboarding Screen | ✅ Implemented | 5 slides; content differs slightly from ONBOARDING.md. |
| Auth Options Sheet (Email / Google) | ❌ **Missed** | Flow is Auth first; no sheet after onboarding. |
| 3. Login / Signup | ✅ Implemented | sign-in, sign-up, reset-password. |
| Forgot Password, Email Verification | ✅ Implemented | reset-password; sign-up has email verification step. |
| Terms link | ❌ **Missed** | Not on auth screens. |

## MAIN APP TABS

| Screen | Status | Notes |
|--------|--------|--------|
| Tabs: Home, Events, Upload, Profile | ⚠️ Partial | Only **Home** and **Profile** visible. Events and Upload tabs are not present (explore exists but `href: null`). |

## HOME TAB

| Screen | Status | Notes |
|--------|--------|--------|
| 4. Home Screen (sections) | ✅ Implemented | Storage, Photos of you, Expiring soon, Recently downloaded, Your events. |
| Event Quick Actions Sheet | ❌ **Missed** | Not implemented. |
| Photo Quick Actions Sheet | ❌ **Missed** | Tapping photo goes to modal; no separate quick-action sheet. |
| Upgrade Prompt Sheet | ❌ **Missed** | Not implemented. |

## EVENTS TAB / LIST

| Screen | Status | Notes |
|--------|--------|--------|
| 5. Events List Screen | ⚠️ Partial | Events list is on **Home** (“YOUR EVENTS”), not a separate Events tab. |
| Create Event Sheet | ✅ Implemented | From Home. |
| Join Event Sheet | ❌ **Missed** | No paste-invite-link sheet. |

## EVENT DETAIL

| Screen | Status | Notes |
|--------|--------|--------|
| 6. Event Screen (name, member count, Upload) | ⚠️ Partial | Name + Upload; no member count. |
| 6A. My Photos Tab | ✅ Implemented | No infinite scroll or pull-to-refresh. |
| Photo Action Sheet (Download, Share, Hide) | ⚠️ Partial | Actions in modal; no separate sheet. Share not in modal. |
| 6B. All Photos Tab | ✅ Implemented | Shown to all, not host-only. No bulk mode/sheets. |
| Bulk Action Sheet, Photo Action Sheet (host) | ❌ **Missed** | Not implemented. |
| 6C. Members Tab | ✅ Implemented | Inline actions, not Member Action Sheet. |

## PHOTO VIEWER

| Screen | Status | Notes |
|--------|--------|--------|
| 7. Fullscreen Photo Viewer | ✅ Implemented | Swipe L/R, swipe down; no pinch zoom. Download, Hide; no Share or Delete (host). |

## UPLOAD

| Screen | Status | Notes |
|--------|--------|--------|
| 8. Upload Screen (Gallery, Camera, Files) | ⚠️ Partial | Only gallery multi-select from event; no standalone Upload screen/tab. |
| 8A. Upload Progress Screen | ✅ Implemented | Progress/messages simulated; no per-item list. |
| Cancel Upload Confirmation Sheet | ❌ **Missed** | Not implemented. |

## FACE PROFILE

| Screen | Status | Notes |
|--------|--------|--------|
| 9. Face Setup (first-time) | ⚠️ Partial | Selfie is slide 5 of onboarding; no bounding box, no dedicated “Face Setup” screen. |
| Retake Photo Sheet, Face Detection Error Sheet | ❌ **Missed** | No retake/error sheets; Alert used on error. |
| 9A. Manage Face (Profile) | ⚠️ Partial | Replace selfie only; no “view current face” image, no delete face. |

## PROFILE TAB

| Screen | Status | Notes |
|--------|--------|--------|
| 10. Profile (Profile Info, Face, Joined Events, Storage, Settings, Logout) | ⚠️ Partial | Face + Account (Sign out, Delete account). No avatar, no joined events list, no storage on profile, no Settings. |
| 10A. Settings Screen | ❌ **Missed** | Not implemented. |
| 10B. Privacy Settings Screen | ❌ **Missed** | Not implemented. |
| 10C. Delete Account Confirmation | ⚠️ Partial | Alert confirmation only; no dedicated screen/sheet. |

## SYSTEM STATES (Overlays)

| Item | Status | Notes |
|------|--------|--------|
| Offline Banner | ❌ **Missed** | Not implemented. |
| Upload Success Snackbar | ❌ **Missed** | Not implemented. |
| Face Match Success Indicator | ❌ **Missed** | Not implemented. |
| Error Toast | ❌ **Missed** | No global toast; alerts only. |
| Expiration Warning Banner | ⚠️ Partial | “Expiring soon” cards on Home; no global banner. |

## EDGE CASE SCREENS

| Screen | Status | Notes |
|--------|--------|--------|
| No Events Screen | ✅ Implemented | Empty state on Home. |
| No Photos Screen | ✅ Implemented | Empty state in event grid / my-photos. |
| No Face Detected Screen | ❌ **Missed** | No dedicated screen; no ML validation. |
| Event Expired Screen | ❌ **Missed** | Not implemented. |
| Unauthorized Access Screen | ❌ **Missed** | Backend error; app just redirects, no dedicated screen. |

## DRAWER INVENTORY (SCREENS.md)

| Drawer | Status |
|--------|--------|
| 1. Auth Options Sheet | ❌ Missed |
| 2. Create Event Sheet | ✅ Implemented |
| 3. Join Event Sheet | ❌ Missed |
| 4. Event Quick Actions Sheet | ❌ Missed |
| 5. Photo Action Sheet | ❌ Missed (actions in modal) |
| 6. Bulk Action Sheet | ❌ Missed |
| 7. Member Action Sheet | ❌ Missed (inline actions) |
| 8. Upgrade Prompt Sheet | ❌ Missed |
| 9. Cancel Upload Sheet | ❌ Missed |
| 10. Retake Face Sheet | ❌ Missed |
| 11. Face Error Sheet | ❌ Missed |
| 12. Delete Account Confirmation Sheet | ❌ Missed (Alert only) |

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
| Get Expo push token | ❌ **Missed** | Not implemented. |
| Store in Convex user document | ❌ **Missed** | No push token storage; users table has no token field. |
| Foreground handling | ❌ **Missed** | Not implemented. |

## Selfie capture

| Spec | Status | Notes |
|------|--------|--------|
| expo-camera | ⚠️ Partial | ImagePicker (camera or library); not full expo-camera preview. |
| Google ML Kit face detection | ❌ **Missed** | Not used; placeholder embedding. |
| Bounding box highlight | ❌ **Missed** | Not implemented. |
| No face / Multiple faces error messages | ❌ **Missed** | Not implemented. |
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
| Track slide completion, push acceptance, selfie success, drop-off, retake count | ❌ **Missed** | No analytics. |

---

# 4. Summary Tables

## Implemented (done)

- Entry: auth check; Convex user getOrCreate; route to sign-in / onboarding / tabs.
- Onboarding: 5 slides (value, how it works, privacy, push, selfie); SelfiePicker with Convex save (placeholder embedding).
- Auth: Sign-in, sign-up, email verification, forgot password, Google OAuth; Convex user creation.
- Home: Storage bar, Photos of you card, Expiring soon, Recently downloaded, Your events, Create Event sheet, empty state for no events.
- Create Event: Sheet with name, privacy, retention; invite URL copy/share; go to event.
- Join: Deep link `/join?eventId=`; joinByInvite; redirect to event.
- Event screen: Header (name, retention label, back), Upload (host); tabs For You / All Activity / Members; grid; members list with remove/promote-demote.
- My Photos (event): Grid; empty state.
- All Photos (event): Same grid with all photos (visible to all).
- Members: List and host actions.
- Photo viewer (modal): Fullscreen, swipe L/R and down, Download (save + recordDownload), Hide (“Not me”).
- Upload: From event (host); gallery multi-select; upload to Convex; placeholder matching in backend; upload progress screen (simulated).
- Profile: Face profile card, SelfiePicker (replace), Sign out, Delete account (single Alert).
- Delete account: Backend deletes user, faces, memberships, matches; sign out.
- Retention: Cron to delete expired photos and create expiration reminders; reminders on Home.
- Pending upload queue: Persist and retry via UploadQueueProcessor.
- Splash screen: UI exists (not in flow).
- No events / no photos empty states.
- Event expired: Backend cron only; no “expired” UI.

## Partially implemented

- Entry: Deep link join works; no “face profile” or “push” routing; splash not in flow.
- Home: Events as vertical list (not “Active Events” horizontal); no “Join Event” CTA; no Event Quick Sheet.
- Event: “All Activity” visible to all (spec: host only); no member count; retention shown as “Xd left” (misuse of retentionDays).
- Photo viewer: No Share, no Delete (host), no pinch zoom.
- Upload: Gallery only (no Camera/Files in flow); progress screen simulated; no success toast or cancel sheet.
- Face: Replace selfie only; no delete face; no bounding box or ML.
- Profile: No avatar, no joined events, no Settings/Privacy/Retention screens.
- Delete account: Alert only; no two-step sheet.
- Onboarding: Copy differs from ONBOARDING.md; selfie via picker, not full camera + confirm flow.
- Join: No pre-join screen (event name, host name).
- Network failure: Queue + retry; no “Retry” button in UI.
- Members: Inline actions, not bottom sheet.

## Mock implemented

- Face embedding: Placeholder 128-d vector; no ML Kit or real embedding.
- Face matching on upload: Backend creates one match per member-with-face at fixed confidence; no similarity.
- Upload progress: Timer-driven “uploading / matching / notifying / done”; not tied to real uploads.

## Pending (spec’d but not done)

- Real face detection (ML Kit) and embedding pipeline.
- Real face matching (embeddings + similarity threshold).
- Push: get token, store in Convex, send on new match, deep link to event/my photos.
- Event expiration UI: “Event expired” screen/banner, hide expired from Home.
- Join Event sheet (paste link) and pre-join screen (event name, host name).
- Upload tab and standalone Upload screen (Gallery/Camera/Files).
- Settings screen and sub-screens (Privacy, Notifications, Retention, Delete account).
- Delete face (mutation + UI).
- Terms link on auth.

## Completely missed

- Splash as first screen with loading + route to Onboarding.
- Route: Not authenticated → Onboarding (app goes to Sign-in first).
- Route: Authenticated but no face → Face Setup screen.
- Auth Options Sheet (Email/Google after onboarding).
- Events tab and Upload tab in tab bar.
- Event Quick Actions Sheet (long-press event).
- Photo Quick Actions Sheet; Upgrade Prompt Sheet.
- Join Event Sheet (paste link).
- Member count in event header.
- All Photos: host-only visibility, bulk select, long-press, Bulk Action Sheet, Photo Action Sheet (host).
- My Photos (event): infinite scroll, pull to refresh.
- Photo viewer: pinch zoom, Share, Delete (host).
- Upload: Camera/Files options; Cancel Upload sheet; real progress tied to uploads.
- Face: ML detection, bounding box, no-face/multiple-faces errors; Retake/Error sheets; delete face.
- Profile: Avatar, Joined events list, Storage, Settings entry.
- Settings, Privacy Settings, Delete Account as sheet/screen.
- System states: Offline banner, Upload success snackbar, Face match indicator, Error toast.
- Edge screens: No Face Detected, Event Expired, Unauthorized Access.
- Push token in Convex and notification flow.
- Onboarding copy exactly per ONBOARDING.md; auth order (Onboarding → Auth → Selfie).
- Onboarding metrics (slide completion, push acceptance, selfie success, etc.).

---

# 5. Doc vs implementation – order of flows

- **USER-FLOW.md** (first time): Splash → Onboarding → Push → Selfie → **Auth** → Home.  
- **Implementation**: **Auth** (sign-in) → Onboarding (Push + Selfie) → Home. Splash not in flow.

So “Splash then Onboarding then Auth then Selfie then Home” is not implemented; the app does “Auth then Onboarding (including selfie) then Home.”

---

*End of audit. Use this to prioritize spec alignment, UX fixes, and missing features.*
