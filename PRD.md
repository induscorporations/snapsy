# 📸 SNAPSY – MVP PRODUCT REQUIREMENTS DOCUMENT

**Tagline:** Every moment, perfectly yours.
**Version:** MVP v1.0
**Platform:** Android (Expo React Native)

---

# 1️⃣ Product Vision

Snapsy is a privacy-first AI-powered photo sharing platform that automatically delivers photos to the right people using on-device face recognition.

It eliminates:

* Manual tagging
* Endless scrolling
* Album chaos

Snapsy delivers:

* Precision
* Simplicity
* Emotional clarity

---

# 2️⃣ Core Product Principles

## 2.1 Design Philosophy (Wise-Based)

Snapsy’s entire design system will be inspired by **Wise Design System principles**:

* Clean grid systems
* Soft but precise spacing
* Functional minimalism
* Flat surfaces
* No decorative noise
* Strong hierarchy
* Clear intent in every interaction
* Controlled color usage
* Subtle motion with purpose

No skeuomorphism.
No shadows unless structural.
No gradients unless brand-critical.
No decorative icons.

---

# 3️⃣ Tech Stack (Updated)

## 3.1 Frontend

* Expo SDK 51+
* React Native
* TypeScript
* Expo Router (file-based navigation)
* NativeWind (for consistent styling)
* Zustand (state management)
* React Motion (animations + micro-interactions)
* @gorhom/bottom-sheet (structural sheets only)
* expo-image
* expo-image-picker
* expo-camera
* expo-media-library
* AsyncStorage (local cache)
* Satoshi Font Family

---

## 3.2 Backend – Convex

Convex replaces Supabase completely.

Why Convex:

* Real-time reactive database
* Serverless functions
* Type-safe queries
* Built-in subscriptions
* No REST boilerplate
* Automatic reactivity to UI

Architecture:

* Convex DB
* Convex Functions (queries + mutations)
* Convex Storage (for photo metadata)
* Cloud storage bucket integration (S3-compatible)

---

## 3.3 Authentication

* Clerk (Expo SDK)
* Email/password
* Google OAuth
* Clerk JWT passed to Convex
* Secure token storage

---

# 4️⃣ Design System

## 4.1 Typography

Primary Font: **Satoshi**

Hierarchy:

H1 – Satoshi Bold
H2 – Satoshi Medium
Body – Satoshi Regular
Meta – Satoshi Light

Spacing ratio: 4pt base grid (Wise-style strict spacing)

---

## 4.2 Color System

Primary Accent:

* Bright Green: #9FE870

Primary Base:

* Forest Green: #163300

Background:

* Light: #FFFFFF
* Dark: #0E1A00

Neutrals:

* Wise-style soft greys for structure

Color Usage Rules:

* Green only for action and success
* Forest Green for trust & headers
* No overuse of primary color

---

## 4.3 Component System (Wise-Based)

All components follow Wise principles:

### Buttons

* Rounded 16px
* No heavy shadows
* Clear label hierarchy
* Minimal padding

### Cards

* Flat
* Thin border
* Structured padding
* No elevation stacking

### Inputs

* Soft border
* Clear active state (Bright Green underline)

### Sheets

* Bottom-docked
* Rounded top corners
* No dimming overlays

---

# 5️⃣ MVP Scope

## Included

* Authentication
* Selfie capture & embedding
* Create event
* Join event via link
* Upload photos
* On-device face detection
* Face matching
* My Photos feed
* Event view
* Basic retention
* Download feature
* Real-time updates via Convex subscriptions

## Excluded

* Payments
* Advanced analytics
* Studio tools
* Video recognition
* Complex ML tuning

---

# 6️⃣ System Architecture

---

## 6.1 Data Architecture (Convex)

### users

* _id
* clerkId
* createdAt

### events

* _id
* hostId
* name
* privacy
* retentionDays
* createdAt

### eventMembers

* _id
* eventId
* userId
* role

### photos

* _id
* eventId
* storageUrl
* uploadedBy
* createdAt

### faces

* _id
* userId
* embedding (array)
* createdAt

### photoFaces

* _id
* photoId
* embedding

### photoMatches

* _id
* photoId
* userId
* confidence

All queries are reactive using Convex subscriptions.

---

# 7️⃣ Face Recognition System

MVP Implementation:

1. User uploads selfie
2. Google ML Kit detects face
3. Extract landmarks
4. Convert to embedding vector
5. Store in Convex

When photo uploaded:

* Detect faces
* Generate embeddings
* Compare against user embeddings
* If similarity > threshold → create photoMatch entry

Matching logic runs client-side initially for MVP simplicity.

---

# 8️⃣ User Flows

---

## 8.1 First-Time Flow

Splash
→ Onboarding
→ Clerk Signup
→ Upload Selfie
→ Store embedding
→ Home

---

## 8.2 Host Flow

Home
→ Create Event (bottom sheet)
→ Generate invite link
→ Upload photos
→ Faces detected
→ Matches created
→ Guests auto receive

---

## 8.3 Guest Flow

Click link
→ Join event
→ Upload selfie (if needed)
→ My Photos tab
→ Download

---

# 9️⃣ Screens

---

## Splash

Minimal logo centered
Forest Green background

---

## Onboarding

3 slides
Large typography
Centered alignment
Primary CTA in Bright Green

---

## Home

Event list
Photos of You preview
Minimal layout
Wise-style spacing

---

## Create Event Sheet

Name
Privacy
Retention
Confirm

No multi-step wizard.

---

## Event Screen

Tabs:

* My Photos
* All Photos (Host only)

Grid layout:

* Flat
* Even spacing
* No decorative overlays

---

## Photo Viewer

Fullscreen
Swipe left/right
Swipe down to dismiss
Bottom action bar

---

## Profile

Face management
Delete account
Logout

---

# 10️⃣ Animation Strategy (React Motion)

All motion must:

* Be purposeful
* Not decorative
* Fast (200–300ms)
* Ease-out curves

Examples:

* Sheet slide up
* Upload progress grow animation
* Face detection highlight pulse
* Grid fade-in on load
* Button press scale (0.97)

No bouncy animations.
No playful effects.
Motion must feel premium.

---

# 11️⃣ State Management

Zustand stores:

* Auth state
* Current event
* Upload queue
* Face profile
* UI sheet visibility

Convex handles:

* Reactive data sync
* Event updates
* Photo matches

---

# 12️⃣ Security

* Clerk authentication
* Convex server-side authorization checks
* Only event members can query event data
* Photo URLs signed
* No public access

---

# 13️⃣ Performance Requirements

* 500 photo upload per batch
* Face detection <500ms per photo
* Grid scrolling 60fps
* Cold start <2s

---

# 14️⃣ Offline Strategy

* Cache thumbnails locally
* Queue uploads when offline
* Sync when reconnected

---

# 15️⃣ Retention Logic

Each event stores retentionDays.

Convex scheduled function:

* Auto-delete expired photos
* Remove matches
* Notify users 7 days before expiration

---

# 16️⃣ MVP KPIs

* Selfie upload completion rate
* Face match success %
* Photo download rate
* Event size average
* Mismatch reports

---

# 17️⃣ Release Plan

Phase 1 – Auth + Convex setup
Phase 2 – Events + Upload
Phase 3 – Face detection + Matching
Phase 4 – UI polish (Wise alignment)
Phase 5 – Play Store submission

---

# 18️⃣ Risk Mitigation

Face mismatch → Allow user to hide photo
Storage overload → Strict retention
Privacy concern → Clear messaging: “Processed on your device”

---

# 19️⃣ Final MVP Definition

MVP is complete when:

* Host uploads 500 photos
* Guests upload selfie
* Guests receive only matched photos
* Real-time updates work
* No major UI inconsistencies
* Motion feels refined
* Design aligns with Wise philosophy
* Performance stable

---

# 🔥 Strategic Outcome

Snapsy will feel:

* Premium but minimal
* Intelligent but simple
* Emotional but structured
* Technical but invisible

Not flashy.
Not playful.
Not cluttered.

Precise. Clean. Confident.