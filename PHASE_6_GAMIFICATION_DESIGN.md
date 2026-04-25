# Phase 6: Gamification - Mentor Levels + Mastery Tiers + Achievement Badges

## Overview
Phase 6 adds comprehensive gamification: a 50-level mentor progression system with XP rewards, habit mastery tiers that unlock based on streak/consistency, and 50+ achievement badges with rarity levels (Common, Rare, Epic, Legendary).

## Architecture

### 1. Mentor Level System (1-50)

#### Level Progression Formula
```
XP_Required_For_Level = 100 * (Level - 1) + 50 * (Level - 1)^2

Examples:
- Level 1: 0 XP (starting)
- Level 5: 600 XP
- Level 10: 2,250 XP
- Level 25: 15,000 XP
- Level 50: 125,000 XP
```

#### XP Rewards
- Habit completion: 10 XP
- Streak milestone (7 days): 50 XP
- Streak milestone (30 days): 100 XP
- Streak milestone (100 days): 250 XP
- Journal entry: 5 XP
- Accountability partner match: 25 XP
- Group join: 15 XP
- Leaderboard top 10: 30 XP

#### Mentor Style Unlocks by Level
| Level | Unlock |
|-------|--------|
| 1 | Strict Mentor (default) |
| 5 | Supportive Mentor |
| 10 | Motivational Mentor |
| 15 | Analytical Mentor |
| 20 | Zen Mentor |
| 25 | Gamified Mentor |
| 30 | Personalized Mentor (AI-trained on user) |
| 40 | Master Mentor (combined all styles) |
| 50 | Legendary Mentor (exclusive) |

#### Mentor Level Benefits
- Unlock new mentor styles
- Increase XP multiplier (1.0x → 1.5x at level 50)
- Unlock advanced features (custom dashboards, API access)
- Exclusive badges and cosmetics
- Leaderboard ranking boost

### 2. Habit Mastery Tiers

#### Tier Progression Logic
```
Tier = f(streak_days, consistency_rate, total_completions)

Beginner:
- Streak: 0-6 days
- Consistency: 0-50%
- Total completions: 0-10

Consistent:
- Streak: 7-29 days
- Consistency: 50-80%
- Total completions: 11-50

Automatic:
- Streak: 30-99 days
- Consistency: 80-95%
- Total completions: 51-150

Master:
- Streak: 100+ days
- Consistency: 95%+
- Total completions: 150+
```

#### Tier Benefits
| Tier | Benefit |
|------|---------|
| Beginner | Standard tracking |
| Consistent | 1.1x XP multiplier |
| Automatic | 1.2x XP multiplier + unlock advanced scheduling |
| Master | 1.5x XP multiplier + custom notifications + priority support |

#### Tier Badges
- 🟢 Beginner badge
- 🔵 Consistent badge
- 🟣 Automatic badge
- 🟡 Master badge

### 3. Achievement Badges (50+ Badges)

#### Badge Rarity Levels
- **Common** (⚪): 40% of badges - easy to unlock
- **Rare** (🔵): 35% of badges - moderate difficulty
- **Epic** (🟣): 20% of badges - challenging
- **Legendary** (🟡): 5% of badges - very rare

#### Badge Categories

**Streak Badges (8 badges)**
- 7-Day Streak (Common)
- 30-Day Streak (Rare)
- 100-Day Streak (Epic)
- 365-Day Streak (Legendary)
- Perfect Week (Common)
- Perfect Month (Rare)
- Perfect Year (Epic)
- Unbreakable (Legendary) - 500+ day streak

**Consistency Badges (8 badges)**
- 90% Consistency (Common)
- 95% Consistency (Rare)
- 99% Consistency (Epic)
- Flawless (Legendary) - 100% for 30 days
- Early Bird (Common) - 10 morning habits
- Night Owl (Common) - 10 evening habits
- All-Day Warrior (Rare) - habits at all times
- Time Master (Epic) - optimal time pattern

**Social Badges (8 badges)**
- First Friend (Common)
- Squad Leader (Rare) - 5+ accountability partners
- Group Founder (Rare) - create mentor group
- Community Champion (Epic) - 10+ group members
- Leaderboard Top 10 (Rare)
- Leaderboard Top 3 (Epic)
- Leaderboard #1 (Legendary)
- Social Butterfly (Common) - join 5 groups

**Milestone Badges (8 badges)**
- 100 Journal Entries (Common)
- 500 Journal Entries (Rare)
- 1000 Journal Entries (Epic)
- Insight Seeker (Common) - read 20 insights
- Data Analyst (Rare) - view analytics 50 times
- Level 10 (Common)
- Level 25 (Rare)
- Level 50 (Legendary)

**Challenge Badges (10 badges)**
- First Challenge (Common)
- Challenge Master (Rare) - complete 10 challenges
- Speed Runner (Epic) - complete challenge in 1 week
- Consistency Champion (Rare) - win challenge
- Habit Stacker (Epic) - stack 3+ habits for 30 days
- Sleep Warrior (Common) - 30 days of 8+ hours sleep
- Stress Buster (Rare) - reduce stress by 30%
- Energy Optimizer (Epic) - achieve 90+ energy score
- Health Hero (Rare) - sync wearable device
- Data Collector (Common) - collect 30 days of health data

**Gamification Badges (8 badges)**
- First XP (Common)
- 1000 XP (Common)
- 10000 XP (Rare)
- 50000 XP (Epic)
- 100000 XP (Legendary)
- Mentor Unlocked (Common) - unlock new mentor style
- Mastery Achieved (Rare) - reach Master tier
- Legendary Status (Legendary) - reach level 50

#### Badge Unlock Conditions
```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  unlockCondition: (userData: UserData) => boolean;
  reward: { xp: number; coins?: number };
}
```

### 4. Database Schema

```sql
-- Mentor Levels
CREATE TABLE mentor_levels (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  current_level INT (1-50),
  total_xp INT,
  xp_to_next_level INT,
  mentor_style VARCHAR,
  unlocked_styles JSON[],
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- XP Transactions
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  amount INT,
  reason VARCHAR,
  source_id UUID,
  created_at TIMESTAMP
);

-- Habit Mastery
CREATE TABLE habit_mastery (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  habit_id UUID REFERENCES habits(id),
  tier VARCHAR ('beginner', 'consistent', 'automatic', 'master'),
  streak_days INT,
  consistency_rate FLOAT,
  total_completions INT,
  tier_unlocked_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Achievement Badges
CREATE TABLE achievement_badges (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  badge_id VARCHAR,
  badge_name VARCHAR,
  rarity VARCHAR ('common', 'rare', 'epic', 'legendary'),
  category VARCHAR,
  unlocked_at TIMESTAMP,
  created_at TIMESTAMP
);

-- Badge Definitions
CREATE TABLE badge_definitions (
  id VARCHAR PRIMARY KEY,
  name VARCHAR,
  description VARCHAR,
  icon VARCHAR,
  rarity VARCHAR,
  category VARCHAR,
  xp_reward INT,
  unlock_condition JSON,
  created_at TIMESTAMP
);
```

### 5. API Endpoints

#### Mentor Levels
- `GET /api/gamification/mentor/level` - Get current level and XP
- `POST /api/gamification/mentor/add-xp` - Add XP to user
- `GET /api/gamification/mentor/styles` - Get unlocked mentor styles
- `POST /api/gamification/mentor/set-style` - Set active mentor style
- `GET /api/gamification/mentor/leaderboard` - Get level leaderboard

#### Habit Mastery
- `GET /api/gamification/mastery/:habitId` - Get habit mastery tier
- `GET /api/gamification/mastery/all` - Get all habit mastery tiers
- `POST /api/gamification/mastery/check-tier-up` - Check for tier progression

#### Achievements
- `GET /api/gamification/badges` - Get user's badges
- `GET /api/gamification/badges/available` - Get available badges to unlock
- `POST /api/gamification/badges/check-unlock` - Check if badge should unlock
- `GET /api/gamification/badges/leaderboard` - Get badge count leaderboard
- `GET /api/gamification/badges/definitions` - Get all badge definitions

#### Dashboard
- `GET /api/gamification/dashboard` - Get gamification summary
- `GET /api/gamification/progress` - Get overall progress

### 6. Frontend Screens

#### Gamification Dashboard
- Current level and XP bar
- Active mentor style with selector
- Next level milestone
- Recent XP transactions
- Habit mastery tiers overview
- Badge gallery (locked/unlocked)
- Leaderboard tabs (level, badges, consistency)

#### Level Details Screen
- Level progression chart (1-50)
- XP breakdown by source
- Mentor style unlock timeline
- Level rewards/benefits
- Next level requirements

#### Badge Gallery Screen
- Filter by rarity (All, Common, Rare, Epic, Legendary)
- Filter by category
- Locked/unlocked toggle
- Badge details with unlock condition
- Badge rarity indicator
- Share badge achievement

#### Habit Mastery Screen
- Habit list with tier badges
- Tier progression chart per habit
- Tier benefits explanation
- Consistency metrics
- Streak counter

## Success Metrics

- 95% of active users reach level 10 within 30 days
- Average 5-10 badges unlocked per user per month
- 80% of users reach at least Consistent tier on 1+ habit
- Level leaderboard engagement: 30% weekly active
- Badge gallery: 50% of users view weekly

## Implementation Timeline

- **Phase 6.1**: Mentor level system (2 hours)
- **Phase 6.2**: Habit mastery tiers (1.5 hours)
- **Phase 6.3**: Achievement badges (2.5 hours)
- **Phase 6.4**: Frontend screens (2 hours)
- **Phase 6.5**: Testing & optimization (1 hour)

**Total: ~9 hours**
