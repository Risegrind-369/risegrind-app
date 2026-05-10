# Ghost Crew Implementation Plan

## Overview
Build a friend-code-based social system for RiseGrind. Users add friends via 6-character codes, see each other's streaks and XP on a leaderboard, but cannot see mood entries, journal entries, or specific habit names.

## Investigation Results

### Current Schema
- **users table**: Has `supabase_user_id`, but missing `friend_code`, `display_name`, `avatar`
- **No friends table**: Need to create `ghostCrewFriends` table
- **accountabilityPartners**: Exists but uses old numeric `userId` (not Supabase IDs) — HIDDEN FOR V1.0
- **leaderboardEntries**: Exists but not integrated with Ghost Crew — HIDDEN FOR V1.0
- **Ghost Crew screen**: Local-only in app/friends.tsx, no server sync

### ID Mismatch Issue
- Old system used numeric `userId` (from Manus)
- New system uses `supabase_user_id` (from Supabase)
- Need to migrate all social tables to use Supabase IDs

---

## Implementation Plan

### Phase A: Database Changes

#### 1. Add columns to `users` table
```sql
ALTER TABLE users ADD COLUMN friend_code VARCHAR(6) UNIQUE NOT NULL;
ALTER TABLE users ADD COLUMN display_name VARCHAR(255);
ALTER TABLE users ADD COLUMN avatar VARCHAR(255); -- emoji or URL
```

#### 2. Create `ghostCrewFriends` table
```sql
CREATE TABLE ghostCrewFriends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,           -- Supabase user ID
  friendId VARCHAR(255) NOT NULL,         -- Supabase user ID
  addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_friendship (userId, friendId),
  FOREIGN KEY (userId) REFERENCES users(supabase_user_id),
  FOREIGN KEY (friendId) REFERENCES users(supabase_user_id)
);
```

#### 3. Update `leaderboardEntries` to use Supabase IDs
```sql
ALTER TABLE leaderboardEntries MODIFY COLUMN userId VARCHAR(255);
-- Add week-based tracking for XP this week
ALTER TABLE leaderboardEntries ADD COLUMN xpThisWeek INT DEFAULT 0;
ALTER TABLE leaderboardEntries ADD COLUMN weekStartDate DATE;
```

#### 4. RLS Policies (Supabase)
- Users can read their own data (all fields)
- Users can read friends' public data: `display_name`, `friend_code`, `current_streak`, `xp_total`, `today_completion_percent`
- Users CANNOT read friends' private data: mood entries, journal entries, specific habit names

---

### Phase B: Friend Code Generation

#### On User Creation
- Generate unique 6-character code (alphanumeric, exclude confusing chars: 0, O, 1, I, l)
- Format: `[A-Z2-9]{6}` (uppercase + digits 2-9)
- Store in `users.friend_code`

#### Example Codes
- K3NZ9X
- M7P2QR
- V5W8TS

---

### Phase C: Ghost Crew Screen Redesign

#### Current Screen (app/friends.tsx)
- Local-only storage
- Displays friend code, name, streak, XP
- Add friend modal with code input

#### New Screen
1. **Header**
   - Title: "Ghost Crew"
   - Your XP this week: `{xpThisWeek}`
   - Pull-to-refresh

2. **Your Friend Code Section**
   - Display: "Your friend code: K3NZ9X"
   - Copy-to-clipboard button
   - "Share this code with friends"

3. **Add to Crew Button**
   - Opens modal with code input field
   - Validation: code exists, not already friends, not adding self
   - Error messages: "Code not found", "Already friends", "Can't add yourself"

4. **Leaderboard List**
   - Sorted by XP this week (descending)
   - Columns:
     - Rank (1, 2, 3...)
     - Avatar/emoji
     - Display name
     - Current streak (with 🔥)
     - XP this week
     - Today's progress bar (% of habits done)
   - Empty state: "Your crew is empty. Share your friend code to add people."

---

### Phase D: Privacy Enforcement

#### Backend Endpoints
1. **GET /api/social/ghost-crew/friends**
   - Returns: `[{ id, displayName, avatar, currentStreak, xpThisWeek, todayCompletionPercent }]`
   - Filters: only public fields
   - Auth: user must be authenticated

2. **POST /api/social/ghost-crew/add-friend**
   - Input: `{ friendCode }`
   - Validates: code exists, not duplicate, not self
   - Returns: friend data or error
   - Auth: user must be authenticated

3. **GET /api/social/ghost-crew/leaderboard**
   - Returns: sorted list of friends by XP this week
   - Filters: only public fields
   - Auth: user must be authenticated

#### RLS Policies (Second Layer)
- Supabase RLS enforces privacy at the database level
- Frontend filtering is not trusted

---

### Phase E: Onboarding Integration

#### After Account Creation
- Show optional screen: "Got a friend code? Add them now."
- Input field for friend code
- "Skip for now" button
- If code provided, add friend before continuing to onboarding

#### Timing
- After email verification
- Before habit selection
- Optional (can skip)

---

### Phase F: Hide for V1.0

#### Mark with `// HIDDEN FOR V1.0`
- All mentor groups UI (app/social/groups.tsx)
- All challenges UI
- All "find partner by goal matching" features
- Accountability partners screen (app/social/partners.tsx)
- Leaderboard screen (if separate from Ghost Crew)
- Community challenges

#### Update LAUNCH_TODO.md
- [ ] Unhide mentor groups after v1.0 launch
- [ ] Unhide challenges after v1.0 launch
- [ ] Unhide partner matching after v1.0 launch

---

### Phase G: Testing Requirements

#### Test Accounts
- Account 1: roessinkk+ghost1@gmail.com
- Account 2: roessinkk+ghost2@gmail.com

#### Test Cases
1. **Signup and Friend Code Generation**
   - [ ] Account 1 signs up → gets unique friend code
   - [ ] Account 2 signs up → gets unique friend code
   - [ ] Codes are different and 6 characters

2. **Add Friend**
   - [ ] Account 1 adds Account 2 by code → success
   - [ ] Friendship appears in DB (ghostCrewFriends table)
   - [ ] Account 2 sees Account 1 in their Ghost Crew

3. **Leaderboard Display**
   - [ ] Account 1 sees Account 2 with correct stats
   - [ ] Account 2 sees Account 1 with correct stats
   - [ ] Ranking is by XP this week (descending)

4. **Edge Cases**
   - [ ] Invalid code → error message
   - [ ] Adding self → error message
   - [ ] Adding duplicate → error message
   - [ ] Code with confusing chars (0, O, 1, I) → not generated

5. **Privacy**
   - [ ] Account 1 cannot see Account 2's mood entries
   - [ ] Account 1 cannot see Account 2's journal entries
   - [ ] Account 1 can only see: name, streak, XP, today's %

6. **Pull to Refresh**
   - [ ] Leaderboard updates when friend completes habits
   - [ ] XP this week updates correctly

---

## Database Migration Strategy

### Step 1: Add Columns to Users
```sql
ALTER TABLE users ADD COLUMN friend_code VARCHAR(6) UNIQUE NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN display_name VARCHAR(255) DEFAULT '';
ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT '';
```

### Step 2: Generate Friend Codes
- For existing users, generate codes programmatically
- For new users, generate on signup

### Step 3: Create Ghost Crew Friends Table
```sql
CREATE TABLE ghostCrewFriends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  friendId VARCHAR(255) NOT NULL,
  addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_friendship (userId, friendId),
  FOREIGN KEY (userId) REFERENCES users(supabase_user_id),
  FOREIGN KEY (friendId) REFERENCES users(supabase_user_id)
);
```

### Step 4: Migrate Leaderboard to Supabase IDs
- Update existing leaderboardEntries to use `supabase_user_id` instead of numeric `userId`
- Add `xpThisWeek` and `weekStartDate` columns

---

## Files to Modify/Create

### Backend
- [ ] `drizzle/schema.ts` — Add columns and new table
- [ ] `server/routes/social.ts` — Add Ghost Crew endpoints (or create new file)
- [ ] `server/_core/index.ts` — Mount new Ghost Crew routes
- [ ] `server/routers.ts` — Add tRPC procedures for friend code generation

### Frontend
- [ ] `app/friends.tsx` — Redesign Ghost Crew screen
- [ ] `app/(tabs)/profile.tsx` — Add "Your friend code" section
- [ ] `app/onboarding/add-friend.tsx` — New optional onboarding step
- [ ] `lib/app-context.tsx` — Update to sync friends from server
- [ ] `app/social/partners.tsx` — Mark as HIDDEN FOR V1.0
- [ ] `app/social/groups.tsx` — Mark as HIDDEN FOR V1.0

### Tests
- [ ] `tests/ghost-crew.test.ts` — New test suite

### Documentation
- [ ] `LAUNCH_TODO.md` — Update with v1.0 hidden features

---

## Estimated Timeline
- Phase A (Database): 2 hours
- Phase B (Friend Code Gen): 1 hour
- Phase C (Ghost Crew Screen): 3 hours
- Phase D (Privacy): 2 hours
- Phase E (Onboarding): 1 hour
- Phase F (Hide Features): 1 hour
- Phase G (Testing): 2 hours
- **Total: ~12 hours**

---

## Approval Checklist
- [ ] User approves database schema changes
- [ ] User approves Ghost Crew screen design
- [ ] User approves privacy enforcement approach
- [ ] User approves testing plan
- [ ] Ready to proceed with Phase A
