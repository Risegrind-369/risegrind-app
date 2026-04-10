# RiseGrind — Mobile App Design Plan

## Brand Identity
- **Name:** RiseGrind
- **Tagline:** "Rise. Track. Grind."
- **Personality:** Motivating, clean, premium, iOS-native feel
- **Typography:** SF Pro (system font) — bold headers, regular body
- **Color Palette:**
  - Primary Blue: `#3B82F6` (light) / `#60A5FA` (dark)
  - Accent Green: `#10B981` (light) / `#34D399` (dark)
  - Warm Orange (streak/fire): `#F97316`
  - Background: `#FFFFFF` (light) / `#0F0F0F` (dark)
  - Surface: `#F8FAFC` (light) / `#1A1A2E` (dark)
  - Foreground: `#0F172A` (light) / `#F1F5F9` (dark)
  - Muted: `#64748B` (light) / `#94A3B8` (dark)
  - Border: `#E2E8F0` (light) / `#1E293B` (dark)

## Screen List

1. **Onboarding** — Welcome slides (3 pages), value proposition
2. **Paywall** — RevenueCat paywall, "Try 3 Days Free" CTA
3. **Home (Dashboard)** — Central progress ring, mood check-in, streak, XP bar, quick actions
4. **Morning Routine** — Habit checklist with progress, add/edit habits
5. **Journal** — Entry list, new entry with AI prompt, free text
6. **AI Insights** — Mood trends chart, weekly review, AI suggestions
7. **Profile** — Rank badge, stats, streak calendar, settings

## Primary Content & Functionality

### Home (Dashboard)
- **Top:** Greeting ("Good morning, [name]") + date
- **Center:** Large circular progress ring (Apple Activity style) showing daily completion %
- **Mood Banner:** "How do you feel today?" → emoji picker (5 moods) + soft slider
- **Streak Card:** 🔥 fire icon + streak count + "Keep it going!"
- **XP Bar:** Progress bar with current XP, level label, rank name
- **Quick Actions:** "Start Routine", "Journal", "View Insights"
- **Recent Activity:** Last 3 journal entries preview

### Morning Routine
- **Header:** Progress ring (habits done / total)
- **Habit List:** FlatList of habit cards with checkbox, icon, name, duration
- **Default Habits:** Wake Up, Hydrate, Meditate, Exercise, Read, Cold Shower, Gratitude
- **Completion Animation:** Haptic + green checkmark animation
- **Add Habit:** Bottom sheet with icon picker, name, duration
- **Edit/Delete:** Swipe actions on habit cards

### Journal
- **Entry List:** FlatList, grouped by date, card style
- **New Entry:** Full-screen editor with AI prompt at top, free text area
- **AI Prompts:** Rotating motivational/reflective prompts
- **Tags:** Mood tag auto-applied from today's mood check-in
- **Empty State:** Illustrated empty state with CTA

### AI Insights
- **Mood Trend Chart:** 7-day line chart (mood score over time)
- **Weekly Review Card:** AI-generated summary of the week
- **Routine Suggestions:** AI-recommended habit adjustments
- **Streak Calendar:** Month view with completion dots
- **Top Insights:** Bulleted AI observations

### Profile
- **Avatar + Name:** Editable display name
- **Rank Badge:** Current rank with progress to next rank
- **Stats Grid:** Total streak, XP, habits completed, journal entries
- **Achievements:** Unlocked badges grid
- **Settings:** Notifications, theme, subscription management

## Key User Flows

### First Launch Flow
1. Onboarding slides (swipeable, skip option)
2. Paywall → "Try 3 Days Free" → payment method entry (RevenueCat)
3. Name setup screen
4. Home dashboard

### Daily Morning Flow
1. Open app → Home dashboard
2. Mood check-in banner → select emoji + slider
3. Tap "Start Routine" → Morning Routine screen
4. Check off habits one by one (haptic feedback)
5. Completion screen → XP earned, streak updated
6. Optional: Write journal entry

### Journal Flow
1. Tap "Journal" tab or quick action
2. New entry screen with AI prompt
3. Write freely, mood auto-tagged
4. Save → entry appears in list

### AI Insights Flow
1. Tap "Insights" tab
2. View mood trend chart
3. Read AI weekly review
4. See routine suggestions

## Gamification System

| Element | Details |
|---------|---------|
| **XP** | +10 per habit, +25 per journal, +50 for full routine |
| **Streaks** | Daily consecutive days, fire emoji, milestone rewards |
| **Ranks** | Early Riser → Morning Warrior → Grind Master → Grind Legend |
| **XP Thresholds** | 0→500→1500→3500→7000 |
| **Achievements** | "First Entry", "7-Day Streak", "30-Day Streak", "100 Habits" |

## Navigation Structure

```
Root
├── Onboarding Stack (shown if not onboarded)
│   ├── Welcome
│   ├── Paywall
│   └── Setup
└── Main Tabs (shown if onboarded)
    ├── Home (index)
    ├── Routine
    ├── Journal
    ├── Insights
    └── Profile
```

## Animation & Interaction Design

- **Progress Ring:** Animated SVG arc, smooth fill on completion
- **Mood Picker:** Spring animation on emoji selection, slider with haptic ticks
- **Habit Check:** Scale + fade + green fill animation
- **XP Bar:** Animated width fill with glow effect
- **Tab transitions:** Native iOS slide
- **Cards:** Subtle shadow, 16px border radius
- **Buttons:** Scale 0.97 on press, haptic Light feedback
