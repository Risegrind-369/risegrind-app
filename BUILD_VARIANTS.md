# RiseGrind Build Variants

This document explains how to build three separate, language-locked app variants for RiseGrind.

## Overview

RiseGrind now supports three independent app variants, each with a locked language setting:

- **RiseGrind EN** — English-only variant (app.config.en.ts)
- **RiseGrind FR** — French-only variant (app.config.fr.ts)
- **RiseGrind PT** — Portuguese-only variant (app.config.pt.ts)

Each variant has:
- Unique bundle ID (e.g., `space.manus.risegrind.en`)
- Unique app slug (e.g., `risegrind-en`)
- Locked language that cannot be changed by users
- Separate app store listings (iOS App Store, Google Play Store)

## Building Each Variant

### English Variant (RiseGrind EN)

```bash
# Development
EXPO_CONFIG_FILE=app.config.en.ts npx expo start

# Build for iOS
EXPO_CONFIG_FILE=app.config.en.ts eas build --platform ios

# Build for Android
EXPO_CONFIG_FILE=app.config.en.ts eas build --platform android
```

### French Variant (RiseGrind FR)

```bash
# Development
EXPO_CONFIG_FILE=app.config.fr.ts npx expo start

# Build for iOS
EXPO_CONFIG_FILE=app.config.fr.ts eas build --platform ios

# Build for Android
EXPO_CONFIG_FILE=app.config.fr.ts eas build --platform android
```

### Portuguese Variant (RiseGrind PT)

```bash
# Development
EXPO_CONFIG_FILE=app.config.pt.ts npx expo start

# Build for iOS
EXPO_CONFIG_FILE=app.config.pt.ts eas build --platform ios

# Build for Android
EXPO_CONFIG_FILE=app.config.pt.ts eas build --platform android
```

## Configuration Details

### Bundle IDs

Each variant has a unique bundle ID to ensure they can be installed simultaneously on the same device:

- **EN**: `space.manus.risegrind.en`
- **FR**: `space.manus.risegrind.fr`
- **PT**: `space.manus.risegrind.pt`

### App Slugs

Each variant has a unique slug for Expo Router and deployment:

- **EN**: `risegrind-en`
- **FR**: `risegrind-fr`
- **PT**: `risegrind-pt`

### Deep Linking

Each variant has a unique deep link scheme based on its bundle ID:

- **EN**: `manusrisegrindenxxx` (where xxx is timestamp)
- **FR**: `manusrisegrindfrxxx`
- **PT**: `manusrisegrindptxxx`

## Language Lock Implementation

Once a user selects a language during onboarding, the language is **permanently locked** and cannot be changed. This is enforced by:

1. **AppContext**: Stores `languageLocked: boolean` flag
2. **Settings Screen**: Displays current language with lock icon (🔒), no toggle button
3. **i18n**: Language changes are prevented after onboarding

## Theme Colors

All variants use the same premium theme system:

### Light Mode
- **Background**: Warm off-white (#F8F5F0)
- **Accents**: Italian Earth Green (#6B8E23, #8B9D3D)
- **Text**: Deep navy (#1A1A1A)

### Dark Mode
- **Background**: Deep black (#0A0A0A)
- **Accents**: Glowing orange (#FF9A3D, #FF6200)
- **Text**: Bright white (#F5F5F5)

## EAS Configuration

To build with EAS, ensure your `eas.json` includes all three variants:

```json
{
  "build": {
    "en": {
      "env": {
        "EXPO_CONFIG_FILE": "app.config.en.ts"
      }
    },
    "fr": {
      "env": {
        "EXPO_CONFIG_FILE": "app.config.fr.ts"
      }
    },
    "pt": {
      "env": {
        "EXPO_CONFIG_FILE": "app.config.pt.ts"
      }
    }
  }
}
```

Then build with:

```bash
eas build --profile en --platform ios
eas build --profile fr --platform android
eas build --profile pt --platform all
```

## Testing

To test each variant locally:

1. **English**: `EXPO_CONFIG_FILE=app.config.en.ts npx expo start --web`
2. **French**: `EXPO_CONFIG_FILE=app.config.fr.ts npx expo start --web`
3. **Portuguese**: `EXPO_CONFIG_FILE=app.config.pt.ts npx expo start --web`

Then open the Expo Go app or web preview and verify:
- App name displays correctly (RiseGrind EN/FR/PT)
- Language is locked and cannot be changed
- All UI is translated to the correct language
- Theme colors work correctly in Light/Dark mode

## App Store Submission

Each variant should be submitted as a separate app:

### iOS App Store
- Create three separate app records in App Store Connect
- Use unique bundle IDs for each
- Submit with localized screenshots and descriptions

### Google Play Store
- Create three separate app listings
- Use unique package names for each
- Submit with localized screenshots and descriptions

## Maintenance

When updating translations or features:

1. Update the translation files (`lib/i18n/en.json`, `fr.json`, `pt.json`)
2. Update all three `app.config.*.ts` files if needed
3. Build all three variants
4. Test each variant independently
5. Submit updates to all three app store listings

## Rollback

If you need to revert to the multi-language version:

1. Use the original `app.config.ts` (without language lock)
2. Re-enable the language toggle in Settings
3. Remove the `languageLocked` flag from AppContext
4. Rebuild and redeploy

---

**Last Updated**: April 17, 2026
**Status**: Production Ready
