# RiseGrind TODO

## Branding & Setup
- [x] Generate app icon/logo
- [x] Configure theme colors (blues/greens/neutrals)
- [x] Update app.config.ts with branding
- [x] Install dependencies (react-native-purchases, react-native-svg, etc.)

## Navigation & Architecture
- [x] Configure tab navigation (Home, Routine, Journal, Insights, Profile)
- [x] Set up onboarding stack (shown before main tabs)
- [x] Set up global state/context (AppContext)
- [x] AsyncStorage persistence layer

## Onboarding
- [x] Welcome slides (3 pages, swipeable)
- [x] Paywall screen with RevenueCat integration
- [x] Name setup screen
- [x] Onboarding completion → navigate to main tabs

## RevenueCat / Paywall
- [x] Install react-native-purchases
- [x] RevenueCat paywall screen ("Try 3 Days Free")
- [x] Monthly ($4.99) and yearly ($39.99) plan display
- [x] Entitlement check ("premium") hook
- [x] Restore purchases button

## Home Dashboard
- [x] Greeting header with date
- [x] Mood check-in banner with emoji picker
- [x] Mood modal with 5 levels
- [x] Central progress ring (Apple Activity style)
- [x] Streak card with fire emoji
- [x] XP bar with rank label
- [x] Quick action buttons (Routine, Journal, Insights)

## Morning Routine
- [x] Habit list with FlatList
- [x] Default 7 habits with icons
- [x] Habit checkbox with animation
- [x] Routine progress ring
- [x] Add habit bottom sheet
- [x] Edit/delete habit functionality (long press)
- [x] Completion banner with XP reward

## Journaling
- [x] Journal entry list (grouped by date)
- [x] New entry screen with AI prompt
- [x] Free text editor
- [x] Auto mood tag from today's check-in
- [x] Save/delete entries
- [x] Empty state illustration

## AI Insights
- [x] 7-day mood trend chart
- [x] AI weekly review (tRPC + LLM backend call)
- [x] Routine suggestions (AI)
- [x] Activity calendar (28 days)
- [x] Stats summary row

## Profile & Settings
- [x] Display name + avatar (editable)
- [x] Rank badge with progress
- [x] Stats grid (streak, XP, habits, entries)
- [x] Achievements/badges grid
- [x] Subscription management (RevenueCat)
- [x] Reset data option

## Gamification
- [x] XP calculation and awarding
- [x] Streak tracking (daily reset logic)
- [x] Rank system (4 tiers)
- [x] Achievement unlocking
- [x] XP bar with animated fill

## Polish & Final
- [x] Light/dark mode automatic switching
- [x] Haptic feedback throughout
- [x] Empty states for all screens
- [x] App icon and splash screen
- [x] RevenueCat API key env var setup


## Premium Animation Enhancements
- [x] Install react-native-reanimated and Lottie
- [x] Create AnimatedMoodPicker with spring scale + color transition
- [x] Create AnimatedHabitCheckbox with satisfying check animation
- [x] Create particle effect system for habit completion
- [x] Create AnimatedProgressRing with spring easing
- [x] Create StreakFireAnimation with realistic flame flicker
- [x] Build BadgeGallery screen with pop animations
- [x] Add typewriter effect to AI insights reveal
- [x] Smooth screen transitions with Reanimated
- [x] Button press animations (scale down + spring back)
- [x] Paywall trigger after 1-2 days with smooth sheet
- [x] Theme transition animations
- [x] Haptic feedback polish on all interactions

## RevenueCat + Superwall Integration (New Task)
- [x] Install react-native-purchases and react-native-purchases-ui
- [x] Install @superwall/react-native-superwall
- [x] Rewrite RevenueCatProvider with full entitlement checking and real-time listener
- [x] Rewrite SuperwallProvider with RevenueCat PurchaseController
- [x] Update app/_layout.tsx with correct provider hierarchy (RC → SW → App)
- [x] Update paywall-trigger.tsx to use useRevenueCat instead of old usePurchases
- [x] Update onboarding/paywall.tsx to use useRevenueCat
- [x] Update profile.tsx to use useRevenueCat
- [x] Add iOS deployment target 15.1 to app.config.ts
- [x] Set EXPO_PUBLIC_RC_API_KEY_IOS env var
- [x] Set EXPO_PUBLIC_RC_API_KEY_ANDROID env var
- [x] Set EXPO_PUBLIC_SUPERWALL_API_KEY_IOS env var
- [x] Set EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID env var
- [x] Write REVENUECAT_SUPERWALL_GUIDE.md with full step-by-step instructions
- [ ] Configure RevenueCat dashboard: create entitlement "premium"
- [ ] Configure RevenueCat dashboard: create offerings with monthly + yearly packages
- [ ] Configure Superwall dashboard: create paywalls and placements
- [ ] Connect RevenueCat integration in Superwall dashboard
- [ ] Test with EAS development build on physical device
