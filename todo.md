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

## Ghost Mode Transformation
- [x] Apply Ghost Mode branding + slogans to Home dashboard
- [ ] Apply Ghost Mode tone to Onboarding slides
- [x] Redesign paywall with Ghost Mode copy and dark styling
- [x] Add speech-to-text button to Journal screen
- [x] Upgrade Insights to Ghost Mode analytics (days won, year overview, motivational messages)
- [x] Add Side Quests / Mini-Challenges screen with 8 Ghost Mode quests
- [x] Add SideQuest state to app-context (active quests, completions)
- [ ] Upgrade streak fire animation (grows with particles)
- [ ] Upgrade rank unlock animation (pop + glow + confetti)
- [ ] Upgrade habit completion animation (check + confetti)
- [ ] Add Ghost Mode slogan banner to Home screen
- [ ] Update theme with Ghost Mode dark accent colors
- [x] Add "Days Won" stat to Insights
- [x] Add motivational micro-copy throughout all screens

## Multi-Language + Ghost Mode Onboarding
- [ ] Install i18next + react-i18next + AsyncStorage language persistence
- [ ] Create translation files: en.json, fr.json, pt.json with all UI strings
- [ ] Create LanguageContext provider wrapping the whole app
- [ ] Build Language Selection screen (before onboarding) with EN/FR/PT-BR flags
- [ ] Rewrite onboarding/index.tsx as 4-step Ghost Mode journey with Reanimated
- [ ] Localize onboarding slides (EN/FR/PT-BR Ghost Mode copy)
- [ ] Localize paywall screen copy (EN/FR/PT-BR)
- [ ] Localize tab labels, habit names, and all UI strings
- [ ] Wire AI journal prompt to send language instruction to LLM
- [ ] Add language to app-context state (persist with AsyncStorage)
- [ ] Update OnboardingGuard to show language screen first if no language set
- [ ] Localize profile screen and settings labels

## Advanced Analytics, Community, Notifications & Full i18n

### Full i18n Coverage
- [ ] Expand EN/FR/PT translation files with community, notifications, analytics, filter keys
- [ ] Wire t() into tab labels, rank names, achievement titles, habit suggestions
- [ ] Ensure AI system prompt uses localized language instruction from i18n
- [ ] Remove all hardcoded English strings from all screens

### Advanced Analytics (Insights Screen Rebuild)
- [ ] Add daily/weekly/monthly/yearly filter tabs to Insights screen
- [ ] Build correlation bar chart (bar height = habits completed, bar color = mood)
- [ ] Wire chart to filter selection (aggregate data by period)
- [ ] AI insight text box below chart with pattern explanation

### Ghost Community Tab
- [ ] Add Friend type and community state to app-context
- [ ] Create community.tsx tab screen with friend code display
- [ ] Add friend via unique code flow
- [ ] Leaderboard showing friends' streaks and ranks
- [ ] Add community tab to tab layout with icon

### Viral Share Image
- [ ] Install react-native-view-shot for screenshot capture
- [ ] Build ShareCard component (dark aesthetic, badge icon, slogan, QR)
- [ ] Trigger share sheet on badge unlock and rank-up
- [ ] Generate QR code linking to app

### Smart Push Notifications
- [ ] Request notification permissions on app launch
- [ ] Schedule daily habit reminder (customizable time)
- [ ] Trigger rank-up celebration notification
- [ ] Schedule inactivity warning after 2 days without journal entry
- [ ] Add notification settings to Profile screen

## Universal Translation & Critical Fixes (Sprint 4)
- [ ] Fix RevenueCat/Superwall crash in Expo Go — wrap in Constants.executionEnvironment guard
- [ ] Localize tab bar labels in _layout.tsx using t("tabs.*")
- [ ] Wire AI system prompt per language in journal and insights screens
- [ ] Add "tabs" key to all 3 translation files (en/fr/pt)
- [ ] Add "shareCard" key to all 3 translation files for quest sharing
- [ ] Add "manageSubscription" deep link button in profile
- [ ] Add viral quest sharing modal in quests.tsx
- [ ] Review Home screen — zero hardcoded strings
- [ ] Review Routine screen — zero hardcoded strings
- [ ] Review Journal screen — zero hardcoded strings
- [ ] Review Intel screen — zero hardcoded strings
- [ ] Review Quests screen — zero hardcoded strings
- [ ] Review Crew screen — zero hardcoded strings
- [ ] Review Profile screen — zero hardcoded strings
- [ ] Review Notifications screen — zero hardcoded strings
- [ ] Review Onboarding screens — zero hardcoded strings

## Sprint 5: Health, AI Chat, Visual Onboarding & Pricing
- [ ] Install react-native-health and add HealthKit permissions to app.config.ts
- [ ] Create lib/health-provider.tsx with Steps + Sleep data fetching
- [ ] Auto-validate Movement/Sleep habits from HealthKit data
- [ ] Show health correlation card on Home/Insights dashboard
- [ ] Add central AI chat floating action button to tab bar area
- [ ] Create app/ai-chat.tsx full-screen chat interface with visual report generation
- [ ] Add icon-symbol mapping for sparkles/wand icon
- [ ] Rewrite onboarding/index.tsx with animated growth chart slide (Cal AI style)
- [ ] Add "Potential Progress" curve: 30% -> 90% discipline animation
- [ ] Add trust-building copy slide: encryption, privacy, AI mentor
- [ ] Fully localize all onboarding slides (EN/FR/PT) including chart labels
- [ ] Update paywall with $4.99/month and $29.99/year pricing + Save 50% badge
- [ ] Localize paywall pricing copy and currency in all 3 languages
- [ ] Ensure language is saved to AsyncStorage immediately on language screen selection
- [ ] Wire all onboarding i18n keys into en.json, fr.json, pt.json
