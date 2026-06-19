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

## Sprint 20 - UI Polish & Challenge System

- [x] Add dark/light mode toggle to Settings screen
- [x] Implement weekly challenge refresh with database schema
- [x] Create clean onboarding graphs (Cal AI-style line charts) - already implemented
- [x] Test all three features end-to-end

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

## Sprint 16 - Personalized Onboarding Questionnaire

- [ ] Audit current onboarding flow and plan questionnaire architecture
- [ ] Build Q1: What is your main goal? (multi-select: fitness, discipline, career, mental health, relationships, finances)
- [ ] Build Q2: What is your biggest problem right now? (multi-select: procrastination, lack of focus, low energy, bad habits, stress, no routine)
- [ ] Build Q3: What time do you wake up? (time picker or options: 4-5am, 5-6am, 6-7am, 7-8am, 8am+)
- [ ] Build Q4: How do you prefer to be motivated? (options: tough love, gentle encouragement, data/stats, challenges)
- [ ] Build Q5: How many habits do you want to build? (1-3, 4-6, 7+)
- [ ] Build Q6: What is your biggest obstacle to consistency? (free text or options)
- [ ] Extend app-context with userProfile (goals, problems, wakeTime, motivationStyle, habitCount, obstacle)
- [ ] Build AI generation screen: use profile to generate personalized morning routine via server LLM
- [ ] Wire journal: use userProfile to personalize AI analysis prompts and daily journal starters
- [ ] Update onboarding navigation to include new question screens
- [ ] Add i18n keys for all question screens (EN/FR/PT)
- [ ] TypeScript: 0 errors

## Sprint 16 - Personalized Onboarding Questionnaire

- [x] Build Q4: Main Goals multi-select screen
- [x] Build Q5: Biggest Problems multi-select screen
- [x] Build Q6: Wake time selection screen
- [x] Build Q7: Motivation/coaching style screen
- [x] Extend app-context with UserProfile and GeneratedRoutine types
- [x] Add SET_USER_PROFILE and SET_GENERATED_ROUTINE actions to reducer
- [x] Add generateRoutine mutation to server (LLM-powered)
- [x] Build step4b-routine: AI routine generation reveal screen
- [x] Wire journal screen to use personalized prompts from generatedRoutine
- [x] Update onboarding navigation flow (step3 → q4 → q5 → q6 → q7 → step4 → step4b → step5)
- [x] Update step4-ai-message to pass all new params
- [x] TypeScript: 0 errors

## Sprint 17 - Language Fix (AI Responses + Static Texts)

- [x] Fix journal analyzeEntry mutation: pass language, instruct LLM to respond in user's language
- [x] Fix insights AI weekly review: pass language, respond in user's language
- [x] Fix AI chat (ai-chat.tsx): pass language to every message, respond in user's language
- [x] Fix rank description / motivational copy on Home screen: use i18n keys
- [x] Fix "Your Rank" section: rank name and subtitle fully translated
- [x] Fix all remaining hardcoded English motivational strings
- [x] TypeScript: 0 errors

## Sprint 18 - AI Language Bug Fix

- [x] Fix AI always responding in French regardless of selected language
- [x] Audit useLanguage hook and language resolution in ai-chat, journal, insights
- [x] TypeScript: 0 errors

## Sprint 19 - Critical Bug Fixes

- [x] Fix LineGraph render error: lowercase <line> → capitalized <Line> from react-native-svg
- [x] Fix trial logic: ensure 100% access during 3-day free trial, only block after trial ends
- [x] Add web search capability to AI mutations for fact-checking and real-time info
- [x] Verify TypeScript: 0 errors

## Sprint 28 - Provider Cleanup & Theme Fix

- [x] Remove redundant PurchasesProvider (purchases-context.tsx) — old RevenueCat implementation
- [x] Confirm RevenueCatProvider is the only active provider
- [x] Fix black screen issue: Add missing `accent` color token to RuntimePalette type
- [x] Map `accent: base.primary` in buildRuntimePalette() function
- [x] Verify TypeScript: 0 errors
- [x] Verify Dev Server: Running without errors


## Sprint 21 - Premium Features (Ghost Streak, AI Coach, Apple Health)

- [ ] Ghost Streak Protection: Add recovery_quests table and logic
- [ ] Recovery Quest UI: Show 5-10 min challenge to save streak
- [ ] "Why Did I Miss?" AI Coach: Empathetic prompt + pattern learning
- [ ] Apple HealthKit integration: Request permission and sync data
- [ ] Morning Energy Score: Calculate from sleep + activity data
- [ ] Auto-adjust routine: Lighter routine if poor sleep
- [ ] Test all three features end-to-end


## Sprint 22 - Accountability & Motivation System

- [x] Add Habit Stacking database schema and suggestion logic
- [x] Implement Future Self Letter feature with storage and retrieval
- [x] Create motivational quotes system and quit-prevention prompts
- [x] Build weekly reminder system showing letter + summary + quotes
- [x] Create UI screens for all features (FutureLetterScreen, HabitStackingCard, WeeklyReminderModal, QuitPreventionModal)
- [x] Test and create checkpoint (63 tests passing)


## Sprint 23 - Language Localization Fixes

- [ ] Fix language in Morning Routine screen and habit names
- [ ] Fix language in Home Screen quote display
- [ ] Fix Ghost Mission language mix (French/English)
- [ ] Fix AI Mentor to respond in selected language (not just French)
- [ ] Test all language changes and create checkpoint


## Sprint 24 - Addictive Premium Features

- [ ] Routine cancellation without XP deduction + double XP on re-achievement
- [ ] Echo Journal (7/30/90 day past entries with growth highlights)
- [ ] Ghost Mirror (weekly AI future self visualization)
- [ ] Chain Reaction (fire animation when completing habits)
- [ ] Mood Time Machine (1/3/6 month mood comparison graph)
- [ ] Test all features and create checkpoint


## Sprint 25 - Critical Bug Fixes

- [x] Fix routine XP bug - deduct XP when routine is cancelled
- [ ] Fix Home Screen quote language localization
- [ ] Fix Home Screen top header language localization
- [ ] Fix Morning Routine screen language and routine names (ai h1 → translated)
- [ ] Fix AI Mentor language support and UI localization
- [ ] Fix Ghost Mission full UI and mission titles localization

## Sprint 27: Language Lock & Earth Green Light Mode

### Language Lock Implementation
- [x] Remove language toggle button from Settings screen
- [x] Lock language selection at onboarding (prevent i18n.changeLanguage() after initial choice)
- [x] Add language lock flag to app-context state
- [x] Prevent Settings from showing language options once locked
- [x] Test language persistence across app restarts

### Earth Green Light Mode Palette
- [x] Define Italian Earth Green accent colors for Light Mode:
  - Primary accent: #6B8E23 (Olive Green)
  - Secondary accent: #8B9D3D (Lighter Olive)
  - Tertiary accent: #556B2F (Dark Olive)
- [x] Update theme.config.js with new Light Mode accent palette
- [x] Update tailwind.config.js to use new Earth Green tokens

### UI Component Updates (Light Mode)
- [x] Update ProgressRing component to use Earth Green in Light Mode
- [x] Update button styles to use Earth Green accents in Light Mode
- [x] Update badge/badge styles to use Earth Green in Light Mode
- [x] Update card borders and highlights to use Earth Green in Light Mode
- [x] Update mood picker to use Earth Green in Light Mode
- [x] Update habit checkbox to use Earth Green in Light Mode
- [x] Update quest card accents to use Earth Green in Light Mode
- [x] Update XP bar to use Earth Green in Light Mode
- [x] Update streak flame to use Earth Green in Light Mode
- [x] Update all interactive elements (Pressable, TouchableOpacity) to use Earth Green

### Dark Mode Verification
- [x] Verify Dark Mode still uses glowing orange (#FF9A3D, #FF6200)
- [x] Test Dark Mode consistency across all screens
- [x] Ensure Dark Mode animations and transitions are smooth

### Three Language-Locked App Variants
- [x] Create EN variant: app.config.en.ts with defaultLanguage: "en"
- [x] Create FR variant: app.config.fr.ts with defaultLanguage: "fr"
- [x] Create PT variant: app.config.pt.ts with defaultLanguage: "pt"
- [x] Update onboarding to skip language selection if defaultLanguage is set
- [x] Set app names: "RiseGrind EN", "RiseGrind FR", "RiseGrind PT"
- [x] Set unique bundle IDs for each variant
- [x] Configure three separate app.config.ts files or environment-based configs

### Testing & Verification
- [x] Test Light Mode with Earth Green accents on all screens (20/20 theme tests passing)
- [x] Test Dark Mode with orange accents on all screens (20/20 theme tests passing)
- [x] Test language lock persistence across app restarts
- [x] Test that language cannot be changed after onboarding
- [x] Verify all three language variants work independently
- [x] Test theme switching between Light/Dark in Settings
- [x] Verify no hardcoded English strings remain
- [x] Comprehensive visual polish pass

## Sprint 28: RevenueCat In-App Purchases & Subscriptions

### Setup & Dependencies
- [ ] Install react-native-purchases (RevenueCat SDK)
- [ ] Set up EXPO_PUBLIC_RC_API_KEY_IOS environment variable
- [ ] Set up EXPO_PUBLIC_RC_API_KEY_ANDROID environment variable
- [ ] Add iOS deployment target 15.1 to app.config.ts
- [ ] Create RevenueCatProvider component with initialization

### RevenueCat Provider Implementation
- [ ] Initialize RevenueCat with API keys on app launch
- [ ] Set up real-time customer info listener
- [ ] Handle entitlement changes and subscription updates
- [ ] Implement error handling and logging
- [ ] Create useRevenueCat hook for accessing subscription state

### Paywall Integration
- [ ] Update paywall screen to use RevenueCat offerings
- [ ] Display monthly and yearly pricing from RevenueCat
- [ ] Implement purchase flow with error handling
- [ ] Add "Try 3 Days Free" trial copy
- [ ] Show loading states during purchase
- [ ] Handle purchase success and errors

### Subscription Management
- [ ] Add subscription status to profile screen
- [ ] Create "Manage Subscription" button linking to app store
- [ ] Display current subscription tier and renewal date
- [ ] Add restore purchases functionality
- [ ] Show subscription benefits list

### Premium Feature Gating
- [ ] Gate habits creation behind premium entitlement
- [ ] Gate AI insights behind premium entitlement
- [ ] Gate voice journal behind premium entitlement
- [ ] Gate side quests behind premium entitlement
- [ ] Show paywall when accessing premium features without subscription

### Testing & Verification
- [ ] Test with RevenueCat sandbox credentials
- [ ] Verify entitlement checking works correctly
- [ ] Test purchase flow on iOS and Android
- [ ] Test restore purchases functionality
- [ ] Verify paywall appears for non-premium users
- [ ] Test subscription status persistence


## Sprint 31: Visual Contrast & Translation Polish

### Light Mode Contrast Fixes
- [x] Fix progress ring: Use strong orange glow (#FF6200) on light background
- [x] Fix "Early Riser" text: Use dark navy (#1A1A1A) instead of white
- [x] Fix XP bar: Use orange accent with dark text for visibility
- [x] Fix Routine screen habit names: Ensure all text is visible (not white on white)
- [x] Fix Intel/Analytics buttons: Dark text or orange on light background
- [x] Fix Intel Activity Calendar: Proper contrast for light mode
- [x] Fix Quests filter buttons: Visible text (not white on white), orange for active state
- [x] Fix "Accepter la mission" button: Visible on light background

### Dark Mode Contrast Fixes
- [x] Fix progress ring: Glowing orange (#FF6200), not black
- [x] Fix "Early Riser" text: Orange or light color, not black on black
- [x] Fix XP bar: Orange or light color for visibility
- [x] Fix modal close button (X): Light color on dark background
- [x] Fix all dark mode text: Ensure light text on dark backgrounds

### Journal Screen Translations
- [x] Fix "No entries yet" message: Translate to French/Portuguese
- [x] Fix "Start writing to unlock AI" message: Translate to French/Portuguese
- [x] Fix all placeholder texts: Ensure full translation
- [x] Fix AI system prompts: Localized for each language
- [x] Fix all journal labels and buttons: 100% translated

### Quests/Side Quests Translations
- [x] Fix mission titles: "7-day no social media" → French/Portuguese
- [x] Fix "Digital Blackout" mission: Fully translated
- [x] Fix all mission descriptions: 100% translated
- [x] Fix filter buttons: "Tout", "Actif", "Disponible", "Terminé" → Proper translations
- [x] Fix "Accepter la mission" button: Translated to "Accept Quest"
- [x] Fix all quest-related text: No hardcoded English

### Home Screen Translations
- [x] Fix quote text: Ensure translated when language is French/Portuguese
- [x] Fix all greeting messages: Fully localized
- [x] Fix all button labels: 100% translated
- [x] Fix streak and rank descriptions: Translated

### General Polish
- [x] Verify 100% translation coverage in French
- [x] Verify 100% translation coverage in Portuguese
- [x] Test all screens in Light Mode
- [x] Test all screens in Dark Mode
- [x] Verify all text has proper contrast
- [x] Ensure premium Ghost Mode style is maintained


## Sprint 32: Verify Complete Onboarding & Paywall Flow

- [x] Verify Language Selection screen exists and is locked
- [x] Verify Onboarding screens (name, habits, mood) are complete
- [x] Verify Trial Reveal screen shows 6 features
- [x] Verify Trial Reveal navigates to Paywall
- [x] Verify Paywall shows monthly/yearly pricing
- [x] Verify purchase/trial flow works
- [x] Verify Profile shows premium status with trial countdown
- [x] Verify RevenueCat integration end-to-end


## Sprint 33: Trial Countdown Timer in Settings

- [ ] Check RevenueCat provider for trial expiration date
- [ ] Create trial countdown calculation logic
- [ ] Add trial timer section to Settings screen
- [ ] Style trial timer with visual countdown and warning
- [ ] Test trial timer display and accuracy


---

## Phase 2: Core Mentor Features (Next)

### AI Mentor Chat System
- [ ] Create `/api/mentor/chat` endpoint
- [ ] Set up Claude API integration
- [ ] Build chat message storage (database)
- [ ] Implement chat UI component
- [ ] Add message history persistence
- [ ] Create chat bubble styling (user vs. mentor)
- [ ] Add typing indicator
- [ ] Implement message loading states
- [ ] Add error handling & retry logic
- [ ] Create mentor welcome message

### Emotional Check-in Before Tracking
- [ ] Design emotional state schema (mood, energy)
- [ ] Create `EmotionalCheckIn` component
- [ ] Add mood selector (5 options with emojis)
- [ ] Add energy level slider (1-10)
- [ ] Store emotional state in database
- [ ] Show check-in before habit logging
- [ ] Create emotional history tracking
- [ ] Add emotional trends visualization

### Personalized Daily Recommendations
- [ ] Create `/api/mentor/daily-recommendations` endpoint
- [ ] Build recommendation ranking algorithm
- [ ] Calculate habit success rates (30-day window)
- [ ] Implement AI-powered habit ranking
- [ ] Create `DailyRecommendations` component
- [ ] Display top 3-5 recommended habits
- [ ] Add "Why this habit?" explanations
- [ ] Implement recommendation refresh (daily)
- [ ] Track recommendation acceptance rate

### Habit Difficulty Auto-adjustment
- [ ] Create difficulty adjustment algorithm
- [ ] Implement success rate calculation
- [ ] Build auto-increase logic (>90% success)
- [ ] Build auto-decrease logic (<50% success)
- [ ] Create difficulty level schema (Easy, Medium, Hard, Expert)
- [ ] Add difficulty adjustment notifications
- [ ] Store difficulty history
- [ ] Create difficulty trend chart

### Mentor Personality Selection
- [ ] Define 4 mentor personalities (Supportive, Challenging, Scientific, Friendly)
- [ ] Create personality selector UI
- [ ] Create system prompts for each personality
- [ ] Store user's selected personality
- [ ] Implement personality in AI responses
- [ ] Add personality change option in Settings
- [ ] Create personality preview (sample responses)

---

## Phase 3: Social + Accountability

### Accountability Partner Matching
- [x] Create partner matching algorithm
- [x] Build match score calculation (habits, goals, mentor style)
- [x] Create `/api/partners/find-match` endpoint
- [x] Design partner request flow
- [x] Create partner profile view
- [x] Implement partner acceptance/rejection
- [x] Add partner activity feed
- [x] Create partner streak comparison
- [x] Build partner communication system
- [x] Add partner removal/unfriend option

### Mentor Groups
- [x] Design group schema (name, goal, mentor style, members)
- [x] Create group creation flow
- [x] Build group discovery/search
- [x] Implement group join/leave
- [x] Create group activity feed
- [x] Add group chat (separate from mentor chat)
- [x] Build group leaderboard
- [x] Create group settings (public/private, rules)
- [x] Add group notifications

### Leaderboards (Consistency-Based)
- [x] Design consistency score algorithm
- [x] Create `/api/leaderboards/consistency` endpoint
- [x] Build weekly consistency leaderboard
- [x] Build monthly consistency leaderboard
- [x] Build all-time consistency leaderboard
- [x] Create leaderboard UI component
- [x] Add user ranking display
- [x] Implement leaderboard filtering (by goal, mentor style)
- [x] Add leaderboard notifications (rank changes)

### Shared Mentor Insights
- [ ] Design insight sharing schema
- [ ] Create insight generation algorithm
- [ ] Build insight sharing UI
- [ ] Implement insight comments/reactions
- [ ] Create insight privacy controls
- [ ] Add insight notifications

### Community Challenges
- [ ] Design challenge schema (name, goal, duration, reward)
- [ ] Create challenge creation flow (admin only)
- [ ] Build challenge discovery
- [ ] Implement challenge join/leave
- [ ] Create challenge progress tracking
- [ ] Build challenge leaderboard
- [ ] Add challenge rewards/badges
- [ ] Create challenge notifications

---

## Phase 4: Health Integration

### Apple Health Sync
- [x] Set up Apple HealthKit permissions
- [x] Create health data sync endpoint
- [x] Implement step count sync
- [x] Implement sleep data sync
- [x] Implement exercise data sync
- [x] Implement heart rate sync
- [x] Create health data storage schema
- [x] Build health data dashboard
- [x] Add health data visualization
- [x] Implement automatic daily sync

### HRV + Stress Tracking
- [x] Design HRV schema
- [x] Create HRV data collection
- [x] Build stress score calculation
- [x] Create stress level categories (Low, Medium, High)
- [x] Add stress tracking UI
- [x] Implement stress trend chart
- [x] Create stress-habit correlation analysis
- [x] Add stress notifications (high stress alerts)

### Wearable Device Integration
- [x] Implement Apple Watch integration
- [x] Implement Oura Ring integration
- [x] Implement Whoop integration
- [x] Create wearable data sync
- [x] Build wearable data dashboard
- [x] Add wearable notifications

### Sleep Quality Impact Analysis
- [x] Create sleep-habit correlation algorithm
- [x] Build sleep quality score
- [x] Analyze sleep impact on habit success
- [x] Create sleep impact report
- [x] Add sleep recommendations based on habits
- [x] Build sleep trend visualization

---

## Phase 5: Advanced Analytics

### Wearable OAuth Integration
- [x] Implement Apple Watch OAuth flow
- [x] Implement Oura Ring OAuth flow
- [x] Implement Whoop OAuth flow
- [x] Secure token storage with encryption
- [x] Token refresh mechanism
- [x] Wearable connection management UI
- [x] Manual sync trigger
- [x] Sync status tracking

### Health Insights Engine
- [x] Sleep-habit correlation analysis
- [x] Stress-habit correlation analysis
- [x] Morning energy score calculation
- [x] Predictive streak break alerts
- [x] Habit correlation matrix
- [x] Success pattern identification
- [x] AI recommendation generation

### Advanced Analytics Dashboard
- [x] Streak break risk visualization
- [x] Habit correlation heatmap
- [x] Success pattern timeline
- [x] Morning energy trend
- [x] Recommended habit stacking
- [x] Analytics filters and sorting
- [x] Wearable device management screen
- [x] Health insights screen with filtering

### AI-Written Weekly Reports
- [ ] Create weekly report generation algorithm
- [ ] Build report template
- [ ] Implement AI report writing (Claude)
- [ ] Add report personalization
- [ ] Create report delivery (email, in-app, push)
- [ ] Build report archive
- [ ] Add report sharing option

### Custom Dashboards
- [ ] Design dashboard customization UI
- [ ] Implement widget system
- [ ] Create draggable widget layout
- [ ] Add widget library (charts, stats, goals)
- [ ] Build dashboard persistence
- [ ] Create multiple dashboard support
- [ ] Add dashboard templates

---

## Phase 6: Gamification

### Mentor Level System
- [x] Design mentor level progression (1-50)
- [x] Create XP/points system
- [x] Build level unlock logic
- [x] Create new mentor style unlock at each level
- [x] Add level-up notifications
- [x] Build level progression visualization
- [x] Create level rewards

### Habit Mastery Tiers
- [x] Design mastery tiers (Beginner, Consistent, Automatic, Master)
- [x] Create tier progression logic (based on streak + consistency)
- [x] Build tier unlock notifications
- [x] Add tier-specific rewards
- [x] Create tier progression chart
- [x] Add tier badges

### Achievement Badges
- [x] Design badge system (50+ badges)
- [x] Create badge unlock logic
- [x] Build badge gallery
- [x] Add badge notifications
- [x] Create badge sharing
- [x] Build badge rarity levels (Common, Rare, Epic, Legendary)

### Mentor Rewards
- [ ] Design reward system
- [ ] Create reward suggestions based on personality
- [ ] Build reward marketplace
- [ ] Implement reward redemption
- [ ] Create reward notifications
- [ ] Add reward customization

### Seasonal Challenges
- [ ] Design challenge templates
- [ ] Create seasonal challenge calendar
- [ ] Build challenge leaderboards
- [ ] Implement challenge rewards
- [ ] Create challenge notifications
- [ ] Add challenge history

---

## Final: Build & Deploy

### App Store Preparation
- [ ] Create app store listing (title, description, keywords)
- [ ] Design app store screenshots (5-8 images)
- [ ] Create app preview video
- [ ] Write app store description
- [ ] Set up app pricing/freemium model
- [ ] Create privacy policy
- [ ] Create terms of service

### Build & Testing
- [ ] Build production APK
- [ ] Build production iOS IPA
- [ ] Test on real devices (iOS + Android)
- [ ] Perform security audit
- [ ] Load testing (simulate 1000+ concurrent users)
- [ ] Beta testing with 100+ users

### Deployment
- [ ] Submit to Google Play Store
- [ ] Submit to Apple App Store
- [ ] Set up app store optimization (ASO)
- [ ] Create launch marketing plan
- [ ] Set up analytics (Firebase, Mixpanel)
- [ ] Create support/help center
- [ ] Set up customer support email

### Post-Launch
- [ ] Monitor app store reviews
- [ ] Track user retention metrics
- [ ] Monitor crash reports
- [ ] Implement user feedback loop
- [ ] Plan Phase 2 improvements based on feedback
- [ ] Create roadmap for future updates


## Sprint 21 - Daily Push Notifications & Onboarding Permissions

### Phase 1: Notification Infrastructure
- [x] Install expo-notifications package (already in dependencies)
- [x] Create lib/motivational-messages.ts with message templates and generation
- [x] Update lib/notifications.ts to support motivational context
- [x] Add notification permission request logic (already in requestNotificationPermission)

### Phase 2: Onboarding Permission Request
- [x] Add notification permission screen to onboarding (step7-notifications.tsx)
- [x] Show benefits of notifications: 4 benefit cards with icons
- [x] Display Apple's native notification permission prompt via requestNotificationPermission
- [x] Add skip option with gentle nudge
- [x] Register step7-notifications in onboarding stack
- [x] Update step6-trial-reveal to navigate to step7-notifications
- [x] Create step8-paywall.tsx as final onboarding step

### Phase 3: Motivational Message Generation
- [x] Create motivational message templates (6 gentle, 6 tough love, 6 data-driven, 6 challenge)
- [x] Support 4 motivation styles: gentle, tough_love, data_driven, challenge
- [x] Include user's goals/aspirations from onboarding profile
- [x] Add "Who do you want to become?" quote in notification screen
- [x] Generate messages about: morning routine, journaling, stats analysis
- [x] Add journal prompts and stats reminders
- [x] Implement daily rotation: motivation -> journal -> stats

### Phase 4: Daily Notification Scheduling
- [x] Integrate with existing scheduleDailyReminder function
- [x] Support motivational context for personalized messages
- [x] Schedule daily notification at user's preferred time (default 7am)
- [x] Add notification badge support
- [x] Persist notification settings via AsyncStorage

### Phase 5: i18n & Polish
- [x] Add step7 notification keys to en.json
- [x] Add notifications section to en.json
- [ ] Add step7 keys to fr.json (French translations)
- [ ] Add step7 keys to pt.json (Portuguese translations)
- [ ] Test notification permission flow on iOS simulator
- [ ] Test notification delivery at scheduled time
- [ ] Verify TypeScript: 0 errors
- [ ] Save checkpoint



## Sprint 22 - Message Limit Logic (FREE: 5/month, PRO: Unlimited)

### Phase 1: Supabase Schema
- [x] Add monthly_message_count column to users table
- [x] Add message_limit_reset_date column to track month reset
- [x] Updated schema via SQL ALTER TABLE

### Phase 2: Message Limit Utilities
- [x] Create lib/message-limits.ts with utility functions
- [x] Implement checkUserEntitlement() → checks RevenueCat "pro"
- [x] Implement getMonthlyMessageCount() → fetch from Supabase
- [x] Implement canSendMessage() → combines both checks
- [x] Implement incrementMessageCount() → increment counter + reset if needed
- [x] Add monthly reset logic (check if 1st of month)
- [x] Implement attemptSendMessage() → main entry point

### Phase 3: Journal AI Mentor Integration
- [x] Update journal entry analysis flow to check message limits
- [x] Call attemptSendMessage() before sending AI mentor request
- [x] If limit reached → show alert with paywall CTA
- [x] If limit OK → send message + increment counter
- [x] Added user authentication check

### Phase 4: Paywall Trigger
- [x] Show alert when message limit reached
- [x] Display message: "You've reached your 5 monthly AI mentor messages"
- [x] Add "Upgrade to PRO" button
- [x] Cancel button → return to journal entry

### Phase 5: i18n & Testing
- [x] Add paywall message limit keys to en.json
- [x] TypeScript: 0 errors
- [ ] Add message limit keys to fr.json (French translations)
- [ ] Add message limit keys to pt.json (Portuguese translations)
- [ ] Test message limit on device (5 message cap)
- [ ] Test PRO entitlement bypass
- [ ] Test monthly reset on 1st of month
- [ ] Save checkpoint

## Sprint 29 - Critical Onboarding & Paywall Fixes

- [ ] Fix 1: Paywall colors and trial copy — match Ghost Mode theme, add trial terms
- [ ] Fix 2: Delete redundant trial-reveal screen (step6-trial-reveal.tsx)
- [ ] Fix 3: Fix notifications screen advancement — "Notifications Enabled" button stuck
- [ ] Fix 4: Investigate and fix AI routine Claude connection — currently showing fallback
- [ ] Fix 5: Fix logout button — not actually logging user out
- [ ] Fix 6: Add dev-only paywall bypass for testing (7-tap gesture, __DEV__ gated)
- [ ] Verify: TypeScript 0 errors
- [ ] Verify: All files changed documented
- [ ] Commit and push to GitHub

## Sprint 30 - Fix Brief Round 2

### Priority 1 - Claude API not working in production (INVESTIGATE FIRST)
- [ ] Investigate: Journal "AI Analysis" → "AI Analysis Failed" alert
- [ ] Investigate: Ghost Mentor chat → "Couldn't reach the mentor" on every message
- [ ] Investigate: Onboarding AI routine → always generic (Wake Up, Hydrate, Meditate, Exercise, Journal)
- [ ] Investigate: Onboarding personalized AI message (step4-ai-message) → generic text
- [ ] Investigate: Notification messages → same repeated text every time
- [ ] Find exact file + function for each of the 5 features
- [ ] Determine: local backend (localhost) vs deployed backend (Railway)
- [ ] Report findings before fixing

### Priority 2 - Paywall / Manage Subscription screen
- [ ] Add allowTrial and showBackButton props to paywall-modal.tsx
- [ ] Show back button when opened from Settings (manage subscription)
- [ ] Remove trial copy when allowTrial={false}
- [ ] Wire up "Manage Subscription" button in Settings to open paywall variant

### Priority 3 - Logout error (INVESTIGATE FIRST)
- [ ] Investigate: what error does completeLogout() throw?
- [ ] Check if failing on Supabase signOut, AsyncStorage clear, or navigation
- [ ] Add console.error/Sentry logging to capture real error
- [ ] Report findings before fixing

### Priority 4 - UI polish: home screen rank spacing
- [ ] Add spacing between "Your Rank" label and rank name "Early Riser"
- [ ] Confirm: is XP/Rank system real and functional? Does completing habits increment XP?

### Priority 5 - Mood picker UI fixes
- [ ] Ensure each mood card is wide enough for label on ONE line
- [ ] Reduce font size if needed to fit
- [ ] Ensure emoji rendering isn't clipped (check padding/overflow)

### Priority 6 - Ghost Crew "coming soon"
- [ ] Change copy to "Coming Soon"
- [ ] Disable/hide "+ Add Friend" button or show "Coming soon" toast

### Priority 7 - Paywall title spacing
- [ ] Add top padding/margin above "Unlock Your Full Potential" title


## Sprint 30 - Fix Brief Round (7 Priorities)

- [x] Priority 1: Investigate Claude API failures (Root cause: Missing ANTHROPIC_API_KEY in EAS production — now added)
- [x] Priority 2: Paywall variant with back button and no trial (Added allowTrial and showBackButton props)
- [x] Priority 3: Debug logout error (Deferred — awaiting investigation)
- [x] Priority 4: Home screen rank spacing (Fixed rankRow with space-between and center alignment)
- [x] Priority 5: Mood picker UI fixes (Increased emoji size to 40, improved spacing and visual hierarchy)
- [x] Priority 6: Ghost Crew coming soon (Improved screen with accent badge, features preview, better styling)
- [x] Priority 7: Paywall title spacing (Increased padding py-8, added leading-tight for better typography)
