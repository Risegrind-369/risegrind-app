# Phase 3: Social + Accountability Frontend Design

## Overview
Phase 3 implements social features allowing users to find accountability partners, join mentor groups, and compete on leaderboards. This document outlines the frontend architecture, screen designs, and integration patterns.

## Architecture

### Navigation Structure
```
app/
├── (tabs)/
│   ├── _layout.tsx (main tab bar)
│   ├── index.tsx (home)
│   ├── journal.tsx
│   ├── insights.tsx
│   ├── quests.tsx
│   └── social/ (new)
│       ├── _layout.tsx (social stack)
│       ├── index.tsx (social hub/entry point)
│       ├── partners.tsx (accountability partner matching)
│       ├── partner-detail.tsx (individual partner view)
│       ├── groups.tsx (mentor groups list)
│       ├── group-detail.tsx (group view + members)
│       └── leaderboard.tsx (consistency leaderboard)
```

### Data Flow
```
Frontend Screen
    ↓
fetch('/api/social/...')
    ↓
Backend API (server/routes/social.ts)
    ↓
Database (Drizzle ORM)
    ↓
Response JSON
    ↓
Local State (useState)
    ↓
UI Render
```

## Screens

### 1. Social Hub (Entry Point)
**Route:** `app/social/index.tsx`
**Purpose:** Central hub for all social features

**Layout:**
```
┌─────────────────────────────┐
│  Social & Accountability    │
├─────────────────────────────┤
│                             │
│  Quick Stats:               │
│  • Partners: 2              │
│  • Groups: 1                │
│  • Rank: #47 (leaderboard)  │
│                             │
├─────────────────────────────┤
│  [Find Partner] [Groups]    │
│  [Leaderboard] [Insights]   │
│                             │
├─────────────────────────────┤
│  Recent Activity:           │
│  • Partner accepted request │
│  • You ranked up to #45     │
│  • New group challenge      │
│                             │
└─────────────────────────────┘
```

**Components:**
- Stats card showing partner count, group count, leaderboard rank
- Action buttons for main features
- Activity feed (recent events)

### 2. Accountability Partner Matching
**Route:** `app/social/partners.tsx`
**Purpose:** Find and manage accountability partners

**Layout:**
```
┌─────────────────────────────┐
│  Find Accountability Partner│
├─────────────────────────────┤
│                             │
│  [Filter by Goal ▼]         │
│                             │
│  Potential Matches:         │
│  ┌─────────────────────┐    │
│  │ Sarah               │    │
│  │ Goals: Fitness      │    │
│  │ Match Score: 87%    │    │
│  │ [Send Request]      │    │
│  └─────────────────────┘    │
│                             │
│  Your Requests:             │
│  ┌─────────────────────┐    │
│  │ John (Pending)      │    │
│  │ [Cancel]            │    │
│  └─────────────────────┘    │
│                             │
│  Your Partners:             │
│  ┌─────────────────────┐    │
│  │ Emma                │    │
│  │ Streak: 23 days     │    │
│  │ [View] [Remove]     │    │
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

**Features:**
- Match algorithm shows top 10 potential partners
- Match score based on goals, habits, motivation style
- Send partnership request
- Accept/reject incoming requests
- View active partners
- Partner streak comparison

**API Endpoints Used:**
- `POST /api/social/partners/find-matches` - Get potential matches
- `POST /api/social/partners/request` - Send partnership request
- `POST /api/social/partners/:id/accept` - Accept request
- `GET /api/social/partners/:userId` - Get user's partners

### 3. Mentor Groups
**Route:** `app/social/groups.tsx`
**Purpose:** Browse and manage mentor groups

**Layout:**
```
┌─────────────────────────────┐
│  Mentor Groups              │
├─────────────────────────────┤
│                             │
│  [Create Group] [My Groups] │
│                             │
│  Public Groups:             │
│  ┌─────────────────────┐    │
│  │ Morning Runners     │    │
│  │ Members: 142        │    │
│  │ Focus: Fitness      │    │
│  │ [Join]              │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ Meditation Circle   │    │
│  │ Members: 89         │    │
│  │ Focus: Mindfulness  │    │
│  │ [Join]              │    │
│  └─────────────────────┘    │
│                             │
│  My Groups:                 │
│  ┌─────────────────────┐    │
│  │ Tech Leaders        │    │
│  │ Members: 23         │    │
│  │ [View]              │    │
│  └─────────────────────┘    │
│                             │
└─────────────────────────────┘
```

**Features:**
- Browse public groups
- Create new group (name, description, habit focus, visibility)
- Join/leave groups
- View group members
- Group leaderboard
- Group challenges

**API Endpoints Used:**
- `GET /api/social/groups/public` - Get public groups
- `POST /api/social/groups/create` - Create new group
- `POST /api/social/groups/:groupId/join` - Join group

### 4. Leaderboards
**Route:** `app/social/leaderboard.tsx`
**Purpose:** View consistency-based rankings

**Layout:**
```
┌─────────────────────────────┐
│  Leaderboards               │
├─────────────────────────────┤
│                             │
│  [Global] [Groups] [Weekly] │
│                             │
│  Global Consistency:        │
│  1. 🥇 Alex - 98%           │
│     Streak: 156 days        │
│                             │
│  2. 🥈 Jordan - 96%         │
│     Streak: 142 days        │
│                             │
│  3. 🥉 Casey - 94%          │
│     Streak: 128 days        │
│                             │
│  47. 👤 You - 87%           │
│      Streak: 23 days        │
│      [+5 ↑]                 │
│                             │
│  [Load More]                │
│                             │
└─────────────────────────────┘
```

**Features:**
- Global leaderboard (all users)
- Group leaderboards (by group)
- Weekly/monthly/all-time filters
- Consistency score ranking (0-100%)
- Streak display
- Rank change indicator (↑/↓)
- User's position highlighted

**API Endpoints Used:**
- `GET /api/social/leaderboard/group/:groupId` - Get group leaderboard
- `POST /api/social/leaderboard/update` - Update user's leaderboard entry

## UI Components to Create

### New Components
1. **PartnerCard** - Display individual partner with match score
2. **GroupCard** - Display group info with join button
3. **LeaderboardRow** - Display leaderboard entry with rank
4. **MatchScoreBadge** - Show match percentage visually
5. **ConsistencyBar** - Visual representation of consistency score
6. **StreakBadge** - Display current streak with fire emoji

### Reusable Patterns
- Use existing `ScreenContainer` for all screens
- Use `FlatList` for lists (partners, groups, leaderboard)
- Use `useColors()` hook for theme colors
- Use `useTranslation()` for i18n
- Use `expo-haptics` for feedback

## Implementation Checklist

- [ ] Create social directory structure
- [ ] Implement PartnerCard component
- [ ] Implement GroupCard component
- [ ] Implement LeaderboardRow component
- [ ] Build partners.tsx screen with API integration
- [ ] Build groups.tsx screen with API integration
- [ ] Build leaderboard.tsx screen with API integration
- [ ] Add social tab to main navigation
- [ ] Test all endpoints with mock data
- [ ] Add i18n keys for all new screens
- [ ] Test on iOS and Android
- [ ] Create unit tests for components
- [ ] Save checkpoint

## Next Steps

1. Create component files in `components/social/`
2. Implement each screen with API integration
3. Add i18n translations
4. Test and debug
5. Save checkpoint and deliver to user
