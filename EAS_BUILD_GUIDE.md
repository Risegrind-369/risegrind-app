# EAS Build Setup Guide for RiseGrind

This guide walks you through building your RiseGrind app for iOS and Android using EAS Build.

## Prerequisites

1. **Expo Account** — Create one at https://expo.dev
2. **EAS CLI** — Already installed in the project
3. **Apple Developer Account** (for iOS) — https://developer.apple.com
4. **Google Play Developer Account** (for Android) — https://play.google.com/console

## Step 1: Log in to EAS

```bash
cd /home/ubuntu/risegrind
eas login
```

You'll be prompted to enter your Expo credentials.

## Step 2: Configure App Signing

### For iOS:

```bash
eas build --platform ios --profile production
```

On first run, EAS will ask you to:
- Create an Apple Team ID (requires Apple Developer account)
- Generate certificates and provisioning profiles
- Choose between managed or manual signing

**Recommended:** Let EAS manage signing automatically.

### For Android:

```bash
eas build --platform android --profile production
```

On first run, EAS will ask you to:
- Create a keystore (signing key)
- Generate a release key

**Recommended:** Let EAS manage the keystore automatically.

## Step 3: Build for Single Language Variant

### Build English Version:

```bash
eas build --platform ios --profile en
# or
eas build --platform android --profile en
```

### Build French Version:

```bash
eas build --platform ios --profile fr
# or
eas build --platform android --profile fr
```

### Build Portuguese Version:

```bash
eas build --platform ios --profile pt
# or
eas build --platform android --profile pt
```

## Step 4: Build for Both Platforms

```bash
eas build --platform all --profile production
```

This builds for both iOS and Android simultaneously.

## Step 5: Monitor Build Status

After starting a build, you can:

1. **View in Dashboard** — https://expo.dev/builds
2. **Check CLI** — The build URL will be printed in the terminal
3. **Wait for Completion** — Builds typically take 10-15 minutes

## Step 6: Download Build Artifacts

Once the build completes:

- **iOS (.ipa)** — Can be tested with TestFlight or submitted to App Store
- **Android (.apk or .aab)** — Can be tested on device or submitted to Google Play

## RevenueCat Configuration

Your RevenueCat SDK key is already configured:
```
EXPO_PUBLIC_RC_SDK_KEY=test_fPLEXDsXJkmpdJbobXUsyWlKiSo
```

This will work automatically in production builds. For real purchases, you'll need to:

1. Create a RevenueCat project at https://app.revenuecat.com
2. Set up iOS and Android products in RevenueCat
3. Configure App Store and Google Play connections
4. Update the SDK key in `eas.json` or environment variables

## Language-Locked App Variants

Your app has three separate variants:

| Variant | App Name | Bundle ID | Language |
|---------|----------|-----------|----------|
| **en** | RiseGrind EN | space.manus.risegrind.en | English 🇺🇸 |
| **fr** | RiseGrind FR | space.manus.risegrind.fr | Français 🇫🇷 |
| **pt** | RiseGrind PT | space.manus.risegrind.pt | Português 🇧🇷 |

Each variant:
- Has a unique bundle ID (required for separate App Store listings)
- Locks to its language on first launch
- Includes all features (RevenueCat, Dark Mode, Earth Green Light Mode, etc.)

## Common Commands

```bash
# Build preview for internal testing
eas build --platform ios --profile preview

# Build development client (for local testing)
eas build --platform ios --profile development

# Build production for App Store
eas build --platform ios --profile production

# Build all variants
eas build --platform all --profile en
eas build --platform all --profile fr
eas build --platform all --profile pt

# View build status
eas build:list

# Cancel a build
eas build:cancel <build-id>
```

## Troubleshooting

### Build Fails with "Certificate Error"
- Ensure your Apple Developer account is active
- Check that your Team ID is correct in eas.json
- Try regenerating certificates: `eas credentials`

### Build Fails with "Keystore Error"
- Ensure your Google Play Developer account is active
- Try regenerating keystore: `eas credentials`

### RevenueCat Not Working in Build
- Verify `EXPO_PUBLIC_RC_SDK_KEY` is set in environment
- Check that RevenueCat products are configured in your dashboard
- Ensure iOS and Android products are linked to your app

## Next Steps

1. **Set up App Store Listings** — Create three separate app listings for EN/FR/PT variants
2. **Configure RevenueCat Products** — Set up pricing tiers in RevenueCat dashboard
3. **Submit to App Stores** — Use `eas submit` to automatically submit builds
4. **Monitor Analytics** — Track downloads, crashes, and revenue in dashboards

## Support

- **Expo Docs** — https://docs.expo.dev/build/introduction/
- **EAS CLI Docs** — https://docs.expo.dev/eas-update/introduction/
- **RevenueCat Docs** — https://docs.revenuecat.com

---

**Ready to build?** Run:
```bash
eas build --platform ios --profile production
```

Good luck! 🚀
