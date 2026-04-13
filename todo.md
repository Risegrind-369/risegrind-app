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

## Sprint 8 - Icon Refinement + RevenueCat Hardening

- [x] Generate refined app icon (finer mountain, subtle sun glow, elegant rays)
- [x] Generate refined splash screen (dark bg, centered logo, elegant "RiseGrind" + tagline typography)
- [x] Compress and deploy all new icon assets
- [x] Audit RevenueCat init: platform key selection, verbose logging, single init on mount
- [x] Ensure paywall uses react-native-purchases-ui bottom sheet
- [x] Verify 3-day trial copy and entitlement gating
- [x] Add real-time customerInfo listener for instant unlock after purchase
- [x] Update paywall copy: "Start your 3-day free trial – Full access..."
- [x] Ensure premium feature gating (habits, AI, voice, quests) uses entitlement check

## Sprint 9 - Bug Fixes

- [x] Fix "Maximum update depth exceeded" infinite loop crash on web preview
- [x] Fix OnboardingGuard router.replace loop causing Maximum update depth exceeded

## Sprint 10 - Onboarding Rebuild

- [x] Update theme colors to earth palette (deep navy, terracotta, olive, orange)
- [x] Build onboarding Step 1: name + age screen
- [x] Build onboarding Step 2: empathy question screen
- [x] Build onboarding Step 3: future goal question screen
- [x] Build AI personalization message screen (server LLM call)
- [x] Build animated comparison graphs screen (Without vs With RiseGrind)
- [x] Build free trial reveal screen with premium feature list
- [x] Rebuild post-trial paywall (transparent pricing, social proof, RevenueCat)
- [x] Wire up full onboarding navigation flow
- [x] Update i18n keys for all new screens

## Sprint 11 - Comprehensive App Polish & Conversion Optimization

### Phase 1: Color Theme
- [ ] Update theme.config.js: deep navy/black bg, warm terracotta/orange accents, soft olive, glowing orange highlights
- [ ] Update progress ring: use glowing orange/terracotta gradient (never dark blue on dark bg)
- [ ] Update streak fire animation: use orange/glow colors
- [ ] Update all badges/achievements: use orange accent
- [ ] Update graphs/charts: use orange for primary data series
- [ ] Update paywall CTA buttons: use glowing orange

### Phase 2: Full i18n Coverage
- [ ] Audit all screens for hardcoded English text
- [ ] Add i18n keys for: quests, challenges, badges, ranks, analytics labels, habit suggestions
- [ ] Wire AI system prompt to use user's selected language
- [ ] Update all 3 translation files (en/fr/pt) with new keys
- [ ] Test language switching on all screens

### Phase 3: Navigation Redesign
- [ ] Reduce tab bar to 3 tabs: Home, Journal, Intel
- [ ] Move AI chat FAB to bottom-right corner (outside tab bar)
- [ ] Update tab icons and labels
- [ ] Hide Community/Crew tab (merge into Intel if needed)
- [ ] Update tab layout TypeScript

### Phase 4: Journal Screen Rebuild
- [ ] Replace "Save" button with prominent "AI Analysis" button
- [ ] Show AI response BELOW user entry (not above)
- [ ] Add "Save" button to top-right corner
- [ ] Add "Cancel" button to top-left corner
- [ ] Implement long-press delete on journal list items
- [ ] Update journal entry form layout

### Phase 5: Onboarding Enhancement
- [ ] Keep Step 1: name + age
- [ ] Reduce to exactly 3 questions (remove old Step 3):
  - Q1: "Why do you currently feel like you're not good enough?"
  - Q2: "How do you want to become better using RiseGrind?"
  - Add bold instruction: "Write as much as possible..."
- [ ] AI generates short, deeply personal, caring message
- [ ] Build animated potential graphs: X-axis (3mo/6mo/1yr), Y-axis (improvement)
  - Gray flat curve: "Without RiseGrind"
  - Glowing orange steep curve: "With RiseGrind"
  - Subtitle: "Most people stay here... You can be here in just 30 days."
- [ ] AI suggests relevant morning habits based on answers
- [ ] Pre-populate suggested habits in routine

### Phase 6: Smart Habit Validation
- [ ] Add habit validation logic: check for "bad habits" (alcohol, smoking, etc.)
- [ ] Bad habits: no XP reward, gentle flag/suggestion
- [ ] Suggest better alternatives based on context
- [ ] Update habit creation flow

### Phase 7: Testing & Polish
- [ ] TypeScript: 0 errors
- [ ] Test all 3 languages on all screens
- [ ] Test navigation flow (3 tabs + AI FAB)
- [ ] Test journal AI analysis workflow
- [ ] Test onboarding with AI personalization
- [ ] Test habit validation

### Phase 8: Delivery
- [ ] Save checkpoint
- [ ] Deliver to user

## Sprint 11 - Completion Status

### Completed Phases:
- [x] Phase 1: Color theme updated to premium earth palette
- [x] Phase 3: Navigation redesigned (3 tabs + bottom-right AI FAB)
- [x] Checkpoint saved at version 60c61456

### In Progress (Continuing Now):
- [ ] Phase 4: Journal screen - AI Analysis workflow
- [ ] Phase 5: Onboarding - 3 questions, animated graphs
- [ ] Phase 6: Smart habit validation
- [ ] Phase 2: Full i18n audit


## Sprint 12 - Specific Updates (Settings, Trial, Superwall)

- [x] Add Settings button (gear icon) to home screen header
- [x] Create Settings screen with Profile, Subscription, Language, other settings
- [x] Reposition AI FAB to bottom-right (above Intel tab)
- [x] Add Connect button (bottom-left) for friends
- [x] Build friends bottom sheet with Add friend functionality (real first names only)
- [x] Implement 3-day trial logic: show trial screen at launch, full access for 3 days
- [x] Implement paywall block after 3 days: full-screen paywall, cannot enter app until paid
- [x] Install and initialize Superwall SDK
- [x] Connect Superwall to RevenueCat in dashboard
- [x] Use Superwall to present paywall after trial ends
- [x] Verify TypeScript: 0 errors

## Sprint 13 - Premium Polish & iOS Minimalism

- [x] Update AI button: message icon with centered "AI" text
- [x] Reposition AI FAB: above Intel tab, not overlapping
- [x] Add Side Quests tab to bottom navigation (4th tab)
- [x] Remove "-home.-" prefix from i18n keys in quick actions
- [x] Remove "-home.-" prefix from mood log labels
- [x] Add subtle fade-in animations on screen load
- [x] Add scale transitions on button press
- [x] Refine spacing and padding for premium feel
- [x] Polish colors: ensure consistent earth palette usage
- [x] Verify TypeScript: 0 errors

## Sprint 14 - 7 Specific Fixes

- [ ] Fix 1: Align Connect button (bottom-left) at same height as AI FAB (bottom-right), no overlap
- [ ] Fix 2: Wire Insight quick action button to navigate to /insights page
- [ ] Fix 3: Full i18n audit — remove all hardcoded English from settings, journal, onboarding, paywall, badges, ranks, quests, analytics
- [ ] Fix 3: Add missing FR/PT keys for all screens
- [ ] Fix 4: Level-up rank unlock animation (pop + glow + scale + rotation)
- [ ] Fix 4: Streak day completion animation (Duolingo-style flame circle fill)
- [ ] Fix 5: Correct "streak" to "streaks" plural everywhere in UI and i18n
- [ ] Fix 6: Add strong haptics on streak completion AND rank unlock
- [ ] Fix 7: Remove "Listen to AI" / "Écouter l'IA" button from journal AI analysis section
- [ ] Verify TypeScript: 0 errors

## Sprint 14 - 7 Specific Fixes (DONE)

- [x] Fix 1: Align Connect button with AI FAB (same height, no overlap) — moved both to _layout.tsx
- [x] Fix 2: Wire Insight button to navigate to correct insights route
- [x] Fix 3: Full i18n — added settings, common keys to all 3 locales (en/fr/pt)
- [x] Fix 4: Level-up rank animation — RankUnlockAnimation component (pop+glow+scale+rotation)
- [x] Fix 4: Streak flame animation — AnimatedStreakFire with Duolingo-style ring + flickering flame
- [x] Fix 5: Correct "streak" plural to "streaks" in en.json i18n keys
- [x] Fix 6: Haptics on streak increase (Heavy impact + Success notification)
- [x] Fix 6: Haptics on rank unlock (Heavy impact + Success notification)
- [x] Fix 7: Removed "Listen to AI" / "🔊 Listen" button from journal AI analysis section
- [x] TypeScript: 0 errors

## Sprint 15 - 4 Specific Fixes

- [x] Fix "Clea" → "Clear" button in journal/AI chat screen
- [x] Ensure Quick Actions labels are fully translated (no English left when switching language)
- [x] Add Manage Subscription button in Settings → shows Superwall paywall immediately
- [x] Build weekly summary pop-up (7-day completion %, streak, habits, mood trend, XP earned)
- [x] TypeScript: 0 errors
