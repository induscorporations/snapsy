# 📸 SNAPSY – COMPLETE MVP USER FLOW ARCHITECTURE

---

# 🟢 0. ENTRY STATES (APP LAUNCH)

When app opens, system checks:

1. Is user authenticated?
2. Is face profile created?
3. Has push permission been requested?
4. Is there a deep link?

Possible routes:

| Condition                         | Route              |
| --------------------------------- | ------------------ |
| Not authenticated                 | Onboarding         |
| Authenticated but no face profile | Face Setup         |
| Authenticated + Face exists       | Home               |
| Deep link present                 | Resolve Event Flow |

---

# 🟢 1. FIRST TIME USER FLOW

## Step 1 – Splash Screen

Shows:

* Logo centered
* Forest Green background
* Loading indicator

Checks:

* Clerk session
* Local state

→ Route to Onboarding

---

# 🟢 2. ONBOARDING FLOW (5 SCREENS)

---

## Screen 1 – Value

Shows:

* Headline
* Subtext
* Continue button

On Continue → Slide 2

---

## Screen 2 – How It Works

Shows:

* Explanation
* Continue

On Continue → Slide 3

---

## Screen 3 – Privacy

Shows:

* Privacy explanation
* Continue

On Continue → Slide 4

---

## Screen 4 – Push Notification

Shows:

* Enable Notifications button
* Not Now button

If Enable:
→ Native permission dialog
→ Store result
→ Move to Slide 5

If Not Now:
→ Move to Slide 5

---

## Screen 5 – Selfie Capture

Shows:

* Camera preview
* Capture button

On Capture:

* Run ML detection
* If no face → Error message
* If multiple faces → Error message
* If valid → Show preview

On Confirm:

* Generate embedding
* Save locally
* Save to Convex
  → Move to Authentication

---

# 🟢 3. AUTHENTICATION FLOW

Shows:

* Email / Password
* Google OAuth
* Forgot password
* Terms

On Success:

* Create Convex user record
* Store Clerk ID
  → Route to Home

---

# 🟢 4. HOME SCREEN (PRIMARY HUB)

Home shows:

1. Active Events (horizontal scroll)
2. Photos of You preview grid
3. Recently Downloaded
4. Storage usage bar

States:

### If no events:

* Empty state
* CTA: Create Event / Join Event

### If no matched photos:

* Message:

  > No photos of you yet.

---

## Actions from Home

Tap Event → Event Screen
Tap Photo → Photo Viewer
Long press Event → Event Quick Sheet
Tap Upload Tab → Upload Flow
Tap Profile Tab → Profile

---

# 🟢 5. CREATE EVENT FLOW (HOST)

Triggered from:

* Events tab
* Home empty state

---

## Create Event Sheet

Shows:

* Event Name
* Privacy (Public / Private)
* Retention days
* Create button

On Create:

* Save in Convex
* Add host as member
  → Route to Event Screen

---

# 🟢 6. JOIN EVENT FLOW

Triggered by:

* Invite link deep link
* Join Event Sheet

---

## Join Event Screen

Shows:

* Event name
* Host name
* Join button

On Join:

* Add user to eventMembers
  → Route to Event Screen

---

# 🟢 7. EVENT SCREEN STRUCTURE

Header:

* Event name
* Member count
* Upload button (host only)

Tabs:

1. My Photos
2. All Photos (Host only)
3. Members

---

# 🟢 7A. MY PHOTOS TAB

Shows:

* Grid of matched photos
* Infinite scroll
* Pull to refresh

Empty state:

> No photos of you yet.

Tap Photo → Photo Viewer

---

# 🟢 7B. ALL PHOTOS TAB (HOST)

Shows:

* Full event grid
* Upload indicator
* Bulk select toggle

Actions:

* Tap photo → Viewer
* Long press → Bulk mode

---

# 🟢 7C. MEMBERS TAB

Shows:

* List of members
* Role badge

Host can:

* Remove member
* Change role

---

# 🟢 8. PHOTO VIEWER

Shows:

* Fullscreen image
* Swipe left/right
* Pinch zoom
* Swipe down to close

Bottom Action Bar:

* Download
* Share
* Hide (guest)
* Delete (host)

---

# 🟢 9. UPLOAD FLOW

Triggered from:

* Upload Tab
* Event Screen (Host)

---

## Upload Source Screen

Options:

* Gallery
* Camera
* Files

---

## Photo Selection

Shows:

* Multi-select grid
* Confirm upload

---

## Upload Progress Screen

Shows:

* Upload progress bar
* Face detection status
* Matching status

For each photo:

1. Upload to storage
2. Detect faces
3. Generate embeddings
4. Compare embeddings
5. Create matches

On complete:

* Success toast
* Return to Event Screen

---

# 🟢 10. FACE MATCHING LOGIC FLOW

For each detected face:

1. Generate embedding
2. Query Convex for event members' embeddings
3. Compare cosine similarity
4. If > threshold:

   * Create photoMatch record

Edge Case:

* No matches → Photo only in All Photos

---

# 🟢 11. PROFILE FLOW

Profile Screen shows:

* Avatar
* Face profile
* Joined events
* Settings
* Logout

---

# 🟢 11A. MANAGE FACE

Options:

* Replace selfie
* Delete face

If delete:
→ Warning sheet
→ Remove embedding from Convex

---

# 🟢 11B. SETTINGS

Options:

* Privacy
* Notifications
* Retention info
* Delete Account

---

# 🟢 12. DELETE ACCOUNT FLOW

1. Confirmation sheet
2. Final confirm
3. Delete:

   * User record
   * Face embeddings
   * Memberships
4. Logout
   → Onboarding

---

# 🟢 13. EVENT EXPIRATION FLOW

If event expired:

Event screen shows:

> This event has expired.

Options:

* Contact host
* Dismiss

Expired events:

* Hidden from Home
* Removed from Convex via scheduled function

---

# 🟢 14. NOTIFICATION FLOW

When new match created:

1. Convex triggers notification
2. Push sent
3. User taps
4. Deep link opens:
   → Event → My Photos

---

# 🟢 15. EDGE CASE FLOWS

---

## No Face Detected During Upload

Photo:

* Uploaded
* No match created
* Host can manually assign (future feature)

---

## Multiple Faces in Selfie

Block confirmation
Prompt retake

---

## Network Failure During Upload

* Retry button
* Queue locally
* Sync when online

---

## Unauthorized Access

If user tries to open event not member of:
→ Unauthorized Screen

---

# 🟢 16. COMPLETE FLOW MAP SUMMARY

First Time:
Splash → Onboarding → Push → Selfie → Auth → Home

Host:
Home → Create Event → Upload → Match → Guests receive

Guest:
Invite → Join → Upload selfie (if needed) → My Photos

Daily Use:
Open → Home → View → Download

Edge:
Expire → Remove

---

# 🧠 FINAL STRUCTURE COUNT

Primary Screens: 20
Sub Screens: 15
Bottom Sheets: 12
System States: 8
Permission States: 3

Total interaction surfaces: ~58

---

# 🏁 MVP IS FLOW-COMPLETE WHEN

* User can install
* Enable push
* Upload selfie
* Join event
* Host uploads 500 photos
* Guests see only their photos
* Downloads work
* Expiration works
* Deletion works
* No permission dead-ends
* No navigation loops