# RiseGrind — RevenueCat + Superwall Connection Guide

This guide walks you through every step required to connect your RiseGrind app to **RevenueCat** (subscription management) and **Superwall** (paywall presentation). The code integration is already done — this guide covers the dashboard configuration and the final wiring steps.

---

## Architecture Overview

```
User taps premium feature
       │
       ▼
Superwall checks if user has active subscription
       │
       ├─ YES → Grant access immediately
       │
       └─ NO → Show paywall (designed in Superwall dashboard)
                    │
                    ▼
              User taps "Subscribe"
                    │
                    ▼
         RevenueCat PurchaseController
         (built into SuperwallProvider)
                    │
                    ▼
         App Store / Google Play processes payment
                    │
                    ▼
         RevenueCat records transaction
         + updates entitlements
                    │
                    ▼
         Superwall subscription status synced
         → User gets access
```

**Key principle:** Superwall handles *what the paywall looks like*. RevenueCat handles *the actual purchase and subscription state*. They are connected via a `PurchaseController` already implemented in `lib/superwall-provider.tsx`.

---

## Part 1: RevenueCat Setup

### Step 1.1 — Create a RevenueCat Account

1. Go to [app.revenuecat.com](https://app.revenuecat.com) and sign up (free)
2. Create a new **Project** — name it "RiseGrind"

### Step 1.2 — Add Your App

In your RevenueCat project:

1. Click **+ New App**
2. Select **App Store** (for iOS) or **Google Play** (for Android)
3. Enter your **Bundle ID**: `space.manus.risegrind.t20260410080735`
   - This must match exactly what is in `app.config.ts`
4. Click **Save**

### Step 1.3 — Create Products in App Store Connect (iOS)

Before RevenueCat can see your products, you must create them in Apple's system:

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Select your app → **In-App Purchases** → **+**
3. Create two subscription products:

| Field | Monthly Plan | Yearly Plan |
|-------|-------------|------------|
| **Type** | Auto-Renewable Subscription | Auto-Renewable Subscription |
| **Product ID** | `com.risegrind.premium.monthly` | `com.risegrind.premium.yearly` |
| **Reference Name** | RiseGrind Monthly | RiseGrind Yearly |
| **Price** | $4.99/month | $39.99/year |
| **Free Trial** | 3 days | 3 days |

4. For each product, add a **Subscription Group** (e.g., "RiseGrind Premium")
5. Fill in the **Localization** (display name and description)
6. Submit for review (or use sandbox for testing)

### Step 1.4 — Create an Entitlement in RevenueCat

> **Critical:** The entitlement identifier must be exactly `premium` — this is what the code checks.

1. In RevenueCat dashboard → **Entitlements** → **+ New Entitlement**
2. **Identifier:** `premium`
3. **Description:** "Full access to all RiseGrind features"
4. Click **Add**

### Step 1.5 — Create Products in RevenueCat

1. In RevenueCat → **Products** → **+ New Product**
2. Add both products:
   - `com.risegrind.premium.monthly`
   - `com.risegrind.premium.yearly`
3. RevenueCat will sync with App Store Connect automatically

### Step 1.6 — Create an Offering

1. In RevenueCat → **Offerings** → **+ New Offering**
2. **Identifier:** `default` (this is what the code fetches)
3. **Description:** "RiseGrind Premium Plans"
4. Under **Packages**, add:
   - Monthly package → link to `com.risegrind.premium.monthly`
   - Yearly package → link to `com.risegrind.premium.yearly`
5. Mark the **Yearly** package as the default (best value)
6. **Attach entitlement:** Link both packages to the `premium` entitlement

### Step 1.7 — Get Your RevenueCat API Keys

1. In RevenueCat → **Project Settings** → **API Keys**
2. Copy the **Public SDK key** for iOS (starts with `appl_`)
3. Copy the **Public SDK key** for Android (starts with `goog_`)
4. In your project, go to **Settings → Secrets** and enter:
   - `EXPO_PUBLIC_RC_API_KEY_IOS` = your iOS key
   - `EXPO_PUBLIC_RC_API_KEY_ANDROID` = your Android key

---

## Part 2: Superwall Setup

### Step 2.1 — Create a Superwall Account

1. Go to [superwall.com](https://superwall.com) and sign up (free tier available)
2. Create a new **App** — name it "RiseGrind"
3. Select **iOS** (or Android for Android builds)

### Step 2.2 — Get Your Superwall API Keys

1. In Superwall dashboard → **Settings** → **API Keys**
2. Copy the **Public API Key** for iOS (starts with `sup_`)
3. Copy the **Public API Key** for Android (starts with `sup_`)
4. In your project, go to **Settings → Secrets** and enter:
   - `EXPO_PUBLIC_SUPERWALL_API_KEY_IOS` = your iOS key
   - `EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID` = your Android key

### Step 2.3 — Create a Paywall in Superwall

1. In Superwall → **Paywalls** → **+ New Paywall**
2. Choose a template (or build from scratch)
3. Customize the design:
   - Title: "Unlock RiseGrind Premium"
   - Features list: Unlimited habits, AI insights, etc.
   - CTA button: "Start Free Trial"
4. Under **Products**, add your RevenueCat product IDs:
   - `com.risegrind.premium.yearly` (primary, recommended)
   - `com.risegrind.premium.monthly` (secondary)
5. Save the paywall

### Step 2.4 — Create Placements (Events)

Placements are the named triggers that show a paywall. The code already calls these:

1. In Superwall → **Placements** → **+ New Placement**
2. Create the following placements and attach your paywall to each:

| Placement Name | Where It's Triggered | When to Show |
|----------------|---------------------|--------------|
| `onboarding_paywall` | End of onboarding flow | Always (for non-premium users) |
| `premium_feature_tapped` | When user taps a locked feature | Always |
| `insights_locked` | AI Insights tab | Always |

3. For each placement, set the **Audience** to "Non-subscribers only"
4. Attach your paywall to each placement

### Step 2.5 — Connect RevenueCat to Superwall (Dashboard)

This step ensures Superwall's analytics are enriched with RevenueCat revenue data:

1. In Superwall → **Integrations** → **RevenueCat**
2. Enter your RevenueCat **Secret API Key** (found in RevenueCat → Project Settings → API Keys → Secret key)
3. Click **Connect**

---

## Part 3: Using the Integration in Code

The integration is already implemented. Here is how to use it:

### Show a Superwall Paywall

```typescript
import { showSuperwallPaywall } from '@/lib/superwall-provider';

// In any screen or component:
await showSuperwallPaywall('premium_feature_tapped');
```

### Check Premium Status

```typescript
import { useRevenueCat } from '@/lib/revenuecat-provider';

function MyScreen() {
  const { isPremium, isLoading } = useRevenueCat();

  if (isLoading) return <LoadingSpinner />;

  return isPremium ? <PremiumContent /> : <FreeContent />;
}
```

### Trigger Paywall from Onboarding

The onboarding paywall screen (`app/onboarding/paywall.tsx`) already uses `useRevenueCat()` to:
- Display offerings from RevenueCat
- Process purchases via `purchasePackage()`
- Restore previous purchases via `restorePurchases()`

### Identify Users (After Login)

```typescript
import { identifySuperwallUser } from '@/lib/superwall-provider';
import Purchases from 'react-native-purchases';

// After user logs in:
await Purchases.logIn(userId);           // RevenueCat
await identifySuperwallUser(userId);     // Superwall
```

### Reset on Logout

```typescript
import { resetSuperwallUser } from '@/lib/superwall-provider';
import Purchases from 'react-native-purchases';

// After user logs out:
await Purchases.logOut();                // RevenueCat
await resetSuperwallUser();              // Superwall
```

---

## Part 4: Building for Device Testing

> **Important:** RevenueCat and Superwall require a **native build** — they do not work in Expo Go or the web preview.

### Option A: EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS (first time only)
eas build:configure

# Build for iOS simulator (fastest for testing)
eas build --platform ios --profile development

# Build for physical device
eas build --platform ios --profile preview
```

### Option B: Local Build

```bash
# Generate native iOS project
npx expo prebuild --clean

# Open in Xcode
open ios/risegrind.xcworkspace

# In Xcode: Select your Team, then Product → Run
```

---

## Part 5: Testing Purchases

### iOS Sandbox Testing

1. In App Store Connect → **Users and Access** → **Sandbox Testers**
2. Create a sandbox tester account (use a new Apple ID)
3. On your test device: **Settings** → **App Store** → Sign out of your real account
4. Run the app and attempt a purchase — use the sandbox account when prompted
5. Sandbox purchases process instantly (no real charge)

### RevenueCat Testing Dashboard

1. In RevenueCat → **Customer Lookup**
2. Search for your test device's anonymous user ID (shown in debug logs)
3. Verify entitlements are being granted after purchase

### Superwall Testing

1. In Superwall → **Debugger** → enable debug mode
2. Run the app — a floating debug button will appear
3. Tap it to see which placements are being triggered and which paywalls would show

---

## Part 6: Troubleshooting

| Problem | Solution |
|---------|----------|
| "RevenueCat API key not configured" | Set `EXPO_PUBLIC_RC_API_KEY_IOS` in Secrets |
| "Superwall API key not configured" | Set `EXPO_PUBLIC_SUPERWALL_API_KEY_IOS` in Secrets |
| Paywall doesn't show | Check placement name matches exactly in Superwall dashboard |
| Purchase succeeds but `isPremium` is false | Verify entitlement identifier is exactly `premium` in RevenueCat |
| "Product not found" error | Ensure product IDs in RevenueCat match App Store Connect exactly |
| Superwall paywall shows but purchase fails | Check RevenueCat is initialized before Superwall (it is in the current layout) |
| Works on web but not on device | These SDKs are native-only; build with EAS or local Xcode build |

---

## File Reference

| File | Purpose |
|------|---------|
| `lib/revenuecat-provider.tsx` | RevenueCat SDK initialization + subscription state context |
| `lib/superwall-provider.tsx` | Superwall initialization + RevenueCat PurchaseController |
| `lib/paywall-trigger.tsx` | Time-based paywall modal (shows after 1-2 days) |
| `app/_layout.tsx` | Provider hierarchy (RevenueCat → Superwall → App) |
| `app/onboarding/paywall.tsx` | Onboarding paywall screen using RevenueCat offerings |
| `app/(tabs)/profile.tsx` | Profile screen with subscription management |

---

## Quick Reference: Environment Variables

| Variable | Where to Get | Format |
|----------|-------------|--------|
| `EXPO_PUBLIC_RC_API_KEY_IOS` | RevenueCat → Project → Apps → iOS → API Keys | `appl_xxx...` |
| `EXPO_PUBLIC_RC_API_KEY_ANDROID` | RevenueCat → Project → Apps → Android → API Keys | `goog_xxx...` |
| `EXPO_PUBLIC_SUPERWALL_API_KEY_IOS` | Superwall → Settings → API Keys | `sup_xxx...` |
| `EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID` | Superwall → Settings → API Keys | `sup_xxx...` |

---

*RiseGrind v1.0 — RevenueCat + Superwall Integration*
