Perfect — this will be the **complete structural map of Snapsy MVP**.

Below is a **full inventory of every Screen, Bottom Sheet (Drawers), and Sub-Screen** in the MVP.

Nothing is skipped. This reflects:

* ✅ Convex backend
* ✅ Clerk auth
* ✅ Wise-based design system
* ✅ Satoshi typography
* ✅ React Motion animations
* ✅ Flat premium UI
* ✅ Bottom-sheet-first interaction model

---

# 📱 SNAPSY MVP – COMPLETE SCREEN ARCHITECTURE

---

# 🟢 ROOT LEVEL STRUCTURE

### App Entry Layers

1. Splash Screen
2. Onboarding Flow
3. Authentication Flow
4. Main App (Tab Navigation)

---

# 1️⃣ SPLASH & ENTRY

## 1. Splash Screen

* Logo centered
* Forest Green background
* Session check
* Auto route to:

  * Home (if authenticated)
  * Onboarding (if not)

No drawers.

---

# 2️⃣ ONBOARDING FLOW

## 2. Onboarding Screen
as per the ONBOARDING.md file

### Bottom Sheet

* Auth Options Sheet

  * Continue with Email
  * Continue with Google

---

# 3️⃣ AUTHENTICATION

## 3. Login / Signup Screen

* Email
* Password
* Google OAuth
* Error states
* Terms link

### Sub-Screens

* Forgot Password
* Email Verification

No drawers here.

---

# 4️⃣ MAIN APP STRUCTURE (After Login)

## Bottom Tab Navigation (Persistent)

Tabs:

1. Home
2. Events
3. Upload
4. Profile

---

# 🏠 HOME TAB

## 4. Home Screen

Sections:

* Active Events
* Photos of You (preview grid)
* Recently Downloaded
* Storage Indicator

### Drawers from Home

1. Event Quick Actions Sheet

   * View Event
   * Share Invite
   * Delete Event (Host only)

2. Photo Quick Actions Sheet

   * Download
   * Share
   * Hide Photo

3. Upgrade Prompt Sheet (if limits reached)

---

# 📅 EVENTS TAB

## 5. Events List Screen

* List of events user belongs to
* Create Event button (Host)

### Drawers

1. Create Event Sheet

   * Event name
   * Privacy
   * Retention days
   * Create

2. Join Event Sheet

   * Paste invite link
   * Confirm

---

# 🖼 EVENT DETAIL SCREEN

## 6. Event Screen

Top:

* Event name
* Member count
* Upload button (Host)

Tabs inside:

* My Photos
* All Photos (Host only)
* Members

---

## 6A. My Photos Tab

* Grid layout
* Infinite scroll
* Pull to refresh

### Drawers

* Photo Action Sheet

  * Download
  * Share
  * Hide

---

## 6B. All Photos Tab (Host Only)

* Full grid
* Upload indicator
* Bulk selection mode

### Drawers

* Bulk Action Sheet

  * Delete
  * Download
* Photo Action Sheet

  * Remove from user
  * Delete

---

## 6C. Members Tab

* List of users
* Role indicator

### Drawer

* Member Action Sheet

  * Remove member
  * Change role

---

# 🖼 PHOTO VIEWER

## 7. Fullscreen Photo Viewer

* Swipe left/right
* Pinch zoom
* Swipe down dismiss

### Bottom Action Bar

* Download
* Share
* Hide

---

# ⬆️ UPLOAD TAB

## 8. Upload Screen

Options:

* From Gallery
* From Camera
* From Files

---

## 8A. Upload Progress Screen

* List of uploading images
* Face detection indicator
* Upload status

### Drawer

* Cancel Upload Confirmation Sheet

---

# 🤖 FACE PROFILE SYSTEM

## 9. Face Setup Screen (First-Time Only)

* Capture selfie
* Show bounding box
* Confirm face

### Drawer

* Retake Photo Sheet
* Face Detection Error Sheet

---

## 9A. Manage Face Profiles (Profile Tab)

* View current face
* Replace selfie
* Delete face

---

# 👤 PROFILE TAB

## 10. Profile Screen

Sections:

* Profile Info
* Face Profiles
* Joined Events
* Storage Usage
* Settings
* Logout

---

## 10A. Settings Screen

Options:

* Privacy
* Retention settings
* Notifications
* Delete account

---

## 10B. Privacy Settings Screen

* Face recognition explanation
* Data storage explanation
* Delete my data

---

## 10C. Delete Account Confirmation Screen

### Drawer

* Final Delete Confirmation Sheet

---

# 🔔 SYSTEM STATES

These are not full screens but appear as overlays or system layers:

1. Offline Banner
2. Upload Success Snackbar
3. Face Match Success Indicator
4. Error Toast
5. Expiration Warning Banner

---

# 📂 EDGE CASE SCREENS

1. No Events Screen
2. No Photos Screen
3. No Face Detected Screen
4. Event Expired Screen
5. Unauthorized Access Screen

---

# 📦 COMPLETE DRAWER INVENTORY

All bottom sheets in MVP:

1. Auth Options Sheet
2. Create Event Sheet
3. Join Event Sheet
4. Event Quick Actions Sheet
5. Photo Action Sheet
6. Bulk Action Sheet
7. Member Action Sheet
8. Upgrade Prompt Sheet
9. Cancel Upload Sheet
10. Retake Face Sheet
11. Face Error Sheet
12. Delete Account Confirmation Sheet

All drawers:

* Rounded top corners
* Snap points
* React Motion entrance
* Drag-to-close

---

# 🧭 Navigation Depth Map

Root
→ Auth
→ Tabs
→ Event
→ Photo Viewer
→ Drawers

Maximum depth: 4 levels (kept minimal)

---

# 📊 Total Structure Count

Primary Screens: 18
Sub-Screens: 12
Bottom Sheets / Drawers: 12
System States: 5

Total UI Surfaces in MVP: ~47

---

# 🧠 Architectural Note

Despite 47 surfaces, the experience feels minimal because:

* Most complexity is hidden in bottom sheets
* Tabs reduce navigation depth
* Wise-style layout keeps UI clean
* Motion is subtle and functional