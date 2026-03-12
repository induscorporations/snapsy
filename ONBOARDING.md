# 📱 SNAPSY – UPDATED ONBOARDING FLOW (MVP)

## 🎯 Objective of Onboarding

The onboarding must:

1. Explain the product clearly in <15 seconds
2. Establish trust in AI + privacy
3. Enable push notifications
4. Capture user selfie for face recognition
5. Complete authentication
6. Land user inside Home screen fully ready

No optional steps.
No skipped selfie.
Push notification can be skipped but encouraged.

---

# 🧭 FULL ONBOARDING STRUCTURE

Total Slides: **5 Structured Steps**

1. Value Introduction
2. How It Works
3. Privacy Reassurance
4. Push Notification Permission
5. Selfie Capture for Face Recognition

After this → Authentication (if not logged in)

---

# 🟢 SCREEN 1 – VALUE INTRODUCTION

### Layout (Wise-inspired)

* Large centered heading
* Clean white or dark background
* Strong typographic hierarchy
* No illustrations

### Content

Headline:

> “Get only the photos that matter.”

Subtext:

> Snapsy automatically delivers photos featuring you.

CTA Button:

> Continue

---

### Motion

* Text fades in (React Motion)
* Button slides up subtly

---

# 🟢 SCREEN 2 – HOW IT WORKS

Headline:

> “Upload once. We do the sorting.”

Subtext:

> AI recognizes faces and sends photos to the right people.

Minimal graphic placeholder (flat, abstract)

CTA:

> Continue

---

# 🟢 SCREEN 3 – PRIVACY REASSURANCE

This slide is critical.

Headline:

> “Your face data stays private.”

Subtext:

> Face recognition runs on your device.
> We never sell or share your biometric data.

Design:

* Forest Green accent panel
* Bright Green check icon
* Clean spacing

CTA:

> Continue

---

# 🟢 SCREEN 4 – PUSH NOTIFICATION PERMISSION

### Purpose

Enable push notifications for:

* “New photos of you available”
* Event updates
* Retention expiry warnings

---

### Layout

Headline:

> “Stay updated instantly.”

Subtext:

> Get notified when new photos of you are available.

Primary Button:

> Enable Notifications

Secondary Text Button:

> Not Now

---

### Behavior

When user taps **Enable Notifications**:

1. Trigger native permission prompt
2. System dialog appears
3. Capture permission state
4. Store in local state
5. Move to next slide automatically

---

### Edge Cases

If denied:

* Show small helper text:

  > You can enable notifications later in Settings.

---

### Motion

* Button press scale animation (0.97)
* Native permission appears
* On approval → slide auto transitions

---

# 🟢 SCREEN 5 – SELFIE CAPTURE (MANDATORY)

This is not optional.

Snapsy cannot function without a face embedding.

---

## Layout

Headline:

> “Let’s find your photos.”

Subtext:

> Take a clear selfie to match you across events.

Camera preview full-width
Circular overlay guide
Minimal UI

Primary Button:

> Capture Photo

---

## After Capture

1. Show preview
2. Run ML Kit detection
3. Show bounding box highlight
4. Confirm face detected

If face detected:

* Button: Confirm

If no face:

* Show error state
* Allow retake

---

## On Confirm

1. Extract landmarks
2. Convert to embedding
3. Store locally
4. Send to Convex
5. Save face profile

Then:
→ Route to Authentication (if needed)
→ Or Home screen

---

## Error States

### No Face Detected

Message:

> We couldn’t detect a clear face. Try again in better lighting.

### Multiple Faces

Message:

> Make sure only you are in the frame.

---

# 🔐 AUTHENTICATION ORDER

Two possible flows:

### Flow A – Auth First

If user opened app directly:
Auth → Onboarding → Selfie → Home

### Flow B – Onboarding First

Onboarding → Selfie → Auth → Home

For MVP simplicity:
Onboarding → Auth → Selfie → Home

---

# 🧱 TECHNICAL IMPLEMENTATION DETAILS

---

## Push Notification Setup

Library:

* expo-notifications

Steps:

1. Request permission
2. Get Expo push token
3. Store in Convex user document
4. Handle foreground notifications

---

## Selfie Capture

Library:

* expo-camera

Face Detection:

* Google ML Kit

Embedding:

* Extract vector
* Store in Convex `faces` collection

---

# 🎨 DESIGN SYSTEM RULES DURING ONBOARDING

* Generous whitespace
* No clutter
* One action per screen
* Rounded buttons (16px)
* Satoshi typography
* Bright Green only for primary action
* Forest Green for privacy reinforcement

---

# 🔄 MOTION RULES (React Motion)

Transitions:

* Horizontal slide between slides
* Duration: 250ms
* Ease-out

Button interaction:

* Slight scale down
* Fade ripple effect

Face detection highlight:

* Soft Bright Green pulse

---

# 📊 ONBOARDING COMPLETION METRICS

Track:

* Slide completion rate
* Push notification acceptance rate
* Selfie success rate
* Drop-off before selfie
* Retake count

---

# 🧠 FINAL ONBOARDING FLOW SUMMARY

1. Value
2. How it works
3. Privacy
4. Push notifications
5. Selfie capture
6. Auth (if needed)
7. Home

No skips for selfie.
Push optional but strongly encouraged.

---

# 📦 FINAL COUNT (Updated)

Onboarding Screens: 5
Native Permission Trigger: 1
Camera Capture Screen: 1
Preview Confirmation: 1
Error States: 2

Total onboarding surfaces: 9 structured UI states