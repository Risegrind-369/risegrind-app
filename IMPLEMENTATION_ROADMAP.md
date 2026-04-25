# RiseGrind: 6-Phase Implementation Roadmap

## Overview

This document outlines the complete technical and product roadmap to implement all 6 phases and make RiseGrind the best habit tracker with AI mentor on the app store.

**Timeline:** 6-9 months from start to app store launch
**Team:** 1-2 full-stack developers + 1 AI/ML engineer (can be outsourced)
**Budget Estimate:** $50K-$150K (depending on outsourcing)

---

## Phase 1: MVP (Current) ✅

**Status:** Complete
**Features Delivered:**
- Trial timer with 3-day countdown
- iOS 17-style glass orb tab indicator
- Haptic feedback on tab switches
- Tab badges for unread content
- Push notifications for trial expiration

**Current Checkpoint:** `48bb121e`

---

## Phase 2: Core Mentor Features (Weeks 1-4)

### 2.1 AI Mentor Chat System

**Feature:** 24/7 AI coaching available via chat interface

**Technical Implementation:**

```typescript
// hooks/use-ai-mentor.ts
export function useAIMentor() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (userMessage: string) => {
    // Call backend API to Claude/OpenAI
    // POST /api/mentor/chat
    // Body: { message, userId, habitContext, emotionalState }
    // Returns: { response, suggestions, actionItems }
  };

  return { messages, sendMessage, isLoading };
}
```

**Backend API:**

```typescript
// server/routes/mentor.ts
router.post('/mentor/chat', async (req, res) => {
  const { message, userId, habitContext, emotionalState } = req.body;
  
  // 1. Get user's habit history & patterns
  const userHabits = await db.habits.findByUser(userId);
  
  // 2. Build context for AI
  const context = buildMentorContext(userHabits, emotionalState);
  
  // 3. Call Claude API with system prompt
  const response = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: MENTOR_SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: message },
      { role: 'assistant', content: context }
    ]
  });
  
  // 4. Parse response for suggestions
  const suggestions = parseAIResponse(response);
  
  // 5. Save conversation to database
  await db.mentorChats.create({ userId, message, response, suggestions });
  
  res.json({ response, suggestions });
});
```

**UI Component:**

```typescript
// app/mentor/chat.tsx
export default function MentorChat() {
  const { messages, sendMessage, isLoading } = useAIMentor();
  const [input, setInput] = useState('');

  return (
    <ScreenContainer className="p-4">
      <ScrollView>
        {/* Messages list */}
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
      </ScrollView>
      
      {/* Input area */}
      <View className="flex-row gap-2 mt-4">
        <TextInput
          className="flex-1 border rounded-lg p-3"
          placeholder="Ask your mentor..."
          value={input}
          onChangeText={setInput}
        />
        <Pressable
          className="bg-primary rounded-lg p-3"
          onPress={() => sendMessage(input)}
          disabled={isLoading}
        >
          <Text>Send</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
```

**Estimated Effort:** 40 hours
**Dependencies:** Claude API key, backend API setup

---

### 2.2 Emotional Check-in Before Tracking

**Feature:** Ask user's mood/energy before logging habits

**Technical Implementation:**

```typescript
// components/emotional-checkin.tsx
export function EmotionalCheckIn({ onComplete }: { onComplete: (state: EmotionalState) => void }) {
  const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'tired' | 'stressed'>();
  const [energy, setEnergy] = useState<number>(5); // 1-10 scale

  const handleSubmit = () => {
    const emotionalState = { mood, energy, timestamp: Date.now() };
    onComplete(emotionalState);
  };

  return (
    <View className="gap-4 p-4">
      <Text className="text-lg font-bold">How are you feeling today?</Text>
      
      {/* Mood selector */}
      <View className="flex-row gap-2">
        {['great', 'good', 'okay', 'tired', 'stressed'].map((m) => (
          <Pressable
            key={m}
            className={cn(
              'flex-1 p-3 rounded-lg items-center',
              mood === m ? 'bg-primary' : 'bg-surface'
            )}
            onPress={() => setMood(m as any)}
          >
            <Text>{MOOD_EMOJI[m]}</Text>
            <Text className="text-xs mt-1">{m}</Text>
          </Pressable>
        ))}
      </View>

      {/* Energy slider */}
      <View>
        <Text className="text-sm mb-2">Energy Level: {energy}/10</Text>
        <Slider
          value={energy}
          onValueChange={setEnergy}
          min={1}
          max={10}
        />
      </View>

      <Pressable
        className="bg-primary p-3 rounded-lg items-center"
        onPress={handleSubmit}
      >
        <Text className="text-white font-bold">Continue</Text>
      </Pressable>
    </View>
  );
}
```

**Database Schema:**

```typescript
// Schema for emotional check-ins
const emotionalCheckIns = pgTable('emotional_check_ins', {
  id: serial().primaryKey(),
  userId: integer().references(() => users.id),
  mood: text(), // 'great', 'good', 'okay', 'tired', 'stressed'
  energy: integer(), // 1-10
  timestamp: timestamp().defaultNow(),
});
```

**Estimated Effort:** 20 hours

---

### 2.3 Personalized Daily Recommendations

**Feature:** AI suggests which habits to focus on today based on mood, energy, history

**Technical Implementation:**

```typescript
// hooks/use-daily-recommendations.ts
export function useDailyRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const response = await fetch('/api/mentor/daily-recommendations', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          emotionalState,
          habitHistory,
        }),
      });
      setRecommendations(await response.json());
    };

    fetchRecommendations();
  }, []);

  return recommendations;
}
```

**Backend Logic:**

```typescript
// server/routes/mentor.ts
router.post('/mentor/daily-recommendations', async (req, res) => {
  const { userId, emotionalState, habitHistory } = req.body;

  // 1. Get user's habits
  const habits = await db.habits.findByUser(userId);

  // 2. Calculate success rates
  const successRates = habits.map((h) => ({
    habitId: h.id,
    successRate: calculateSuccessRate(habitHistory, h.id),
    lastCompleted: getLastCompletedDate(habitHistory, h.id),
  }));

  // 3. Use AI to rank habits based on mood/energy
  const ranked = await rankHabitsWithAI(habits, emotionalState, successRates);

  // 4. Return top 3-5 recommendations
  res.json(ranked.slice(0, 5));
});
```

**UI Component:**

```typescript
// app/home/daily-recommendations.tsx
export function DailyRecommendations() {
  const recommendations = useDailyRecommendations();

  return (
    <View className="gap-3">
      <Text className="text-lg font-bold">Today's Focus</Text>
      {recommendations.map((rec) => (
        <RecommendationCard
          key={rec.habitId}
          habit={rec.habit}
          reason={rec.reason}
          priority={rec.priority}
        />
      ))}
    </View>
  );
}
```

**Estimated Effort:** 30 hours

---

### 2.4 Habit Difficulty Auto-adjustment

**Feature:** AI automatically adjusts habit difficulty based on success rate

**Technical Implementation:**

```typescript
// server/services/habit-difficulty-adjuster.ts
export async function adjustHabitDifficulty(habitId: string, userId: string) {
  const habit = await db.habits.findById(habitId);
  const history = await db.habitLogs.findByHabit(habitId, { days: 30 });

  // Calculate success rate (last 30 days)
  const successRate = history.filter((h) => h.completed).length / history.length;

  // Adjust difficulty based on success rate
  let newDifficulty = habit.difficulty;
  if (successRate > 0.9) {
    // User is crushing it - increase difficulty
    newDifficulty = increaseDifficulty(habit);
  } else if (successRate < 0.5) {
    // User is struggling - decrease difficulty
    newDifficulty = decreaseDifficulty(habit);
  }

  // Update habit
  await db.habits.update(habitId, { difficulty: newDifficulty });

  // Notify user
  await sendNotification(userId, {
    title: 'Habit Adjusted',
    body: `Your "${habit.name}" habit has been ${successRate > 0.9 ? 'increased' : 'decreased'} in difficulty`,
  });
}
```

**Estimated Effort:** 25 hours

---

### 2.5 Mentor Personality Selection

**Feature:** Users choose mentor style (supportive, challenging, scientific, etc.)

**Technical Implementation:**

```typescript
// components/mentor-personality-selector.tsx
const MENTOR_PERSONALITIES = [
  {
    id: 'supportive',
    name: 'Supportive Coach',
    emoji: '🤗',
    description: 'Encouraging and empathetic',
    systemPrompt: SUPPORTIVE_PROMPT,
  },
  {
    id: 'challenging',
    name: 'Tough Coach',
    emoji: '💪',
    description: 'Direct and demanding',
    systemPrompt: CHALLENGING_PROMPT,
  },
  {
    id: 'scientific',
    name: 'Science-Based',
    emoji: '🧬',
    description: 'Data-driven and analytical',
    systemPrompt: SCIENTIFIC_PROMPT,
  },
  {
    id: 'friend',
    name: 'Friendly Buddy',
    emoji: '👋',
    description: 'Casual and conversational',
    systemPrompt: FRIEND_PROMPT,
  },
];

export function MentorPersonalitySelector() {
  const [selected, setSelected] = useState('supportive');

  return (
    <ScrollView>
      <Text className="text-lg font-bold mb-4">Choose Your Mentor Style</Text>
      {MENTOR_PERSONALITIES.map((personality) => (
        <Pressable
          key={personality.id}
          className={cn(
            'p-4 rounded-lg mb-3 border-2',
            selected === personality.id ? 'border-primary bg-primary/10' : 'border-border'
          )}
          onPress={() => setSelected(personality.id)}
        >
          <Text className="text-3xl mb-2">{personality.emoji}</Text>
          <Text className="font-bold">{personality.name}</Text>
          <Text className="text-sm text-muted">{personality.description}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
```

**Estimated Effort:** 15 hours

---

## Phase 2 Summary

| Feature | Hours | Dependencies |
|---------|-------|--------------|
| AI Mentor Chat | 40 | Claude API |
| Emotional Check-in | 20 | Database schema |
| Daily Recommendations | 30 | AI ranking logic |
| Difficulty Auto-adjustment | 25 | Success rate calculation |
| Mentor Personality | 15 | System prompts |
| **Total Phase 2** | **130 hours** | **Claude API key** |

**Estimated Timeline:** 3-4 weeks (with 1 developer)
**Cost:** $3,000-$5,000 (if outsourced)

---

## Phase 3: Social + Accountability (Weeks 5-8)

### 3.1 Accountability Partner Matching

**Feature:** Match users with accountability partners based on habits, goals, mentor style

**Database Schema:**

```typescript
const accountabilityPartners = pgTable('accountability_partners', {
  id: serial().primaryKey(),
  userId1: integer().references(() => users.id),
  userId2: integer().references(() => users.id),
  matchedAt: timestamp().defaultNow(),
  status: text(), // 'pending', 'accepted', 'active', 'ended'
  sharedHabits: text(), // JSON array of habit IDs
});
```

**Matching Algorithm:**

```typescript
// server/services/partner-matcher.ts
export async function findAccountabilityPartner(userId: string) {
  // 1. Get user's habits, goals, mentor style
  const user = await db.users.findById(userId);
  const userHabits = await db.habits.findByUser(userId);

  // 2. Find other users with similar habits
  const candidates = await db.users.findBySimilarHabits(userHabits);

  // 3. Score candidates based on:
  //    - Habit overlap (70% weight)
  //    - Mentor style compatibility (20% weight)
  //    - Success rate similarity (10% weight)
  const scored = candidates.map((candidate) => ({
    userId: candidate.id,
    score: calculateMatchScore(user, candidate, userHabits),
  }));

  // 4. Return top match
  return scored.sort((a, b) => b.score - a.score)[0];
}
```

**Estimated Effort:** 35 hours

---

### 3.2 Mentor Groups

**Feature:** Join groups with shared mentor and goals

**Database Schema:**

```typescript
const mentorGroups = pgTable('mentor_groups', {
  id: serial().primaryKey(),
  name: text(),
  description: text(),
  mentorStyle: text(), // 'supportive', 'challenging', etc.
  goal: text(), // e.g., 'Build fitness habits'
  createdBy: integer().references(() => users.id),
  createdAt: timestamp().defaultNow(),
  memberCount: integer().default(1),
});

const groupMembers = pgTable('group_members', {
  id: serial().primaryKey(),
  groupId: integer().references(() => mentorGroups.id),
  userId: integer().references(() => users.id),
  joinedAt: timestamp().defaultNow(),
});
```

**Estimated Effort:** 40 hours

---

### 3.3 Leaderboards (Consistency-Based)

**Feature:** Compete on consistency, not just streaks

**Ranking Algorithm:**

```typescript
// server/services/leaderboard-calculator.ts
export async function calculateLeaderboardRanks() {
  const users = await db.users.findAll();

  const rankings = users.map((user) => {
    // Calculate consistency score (0-100)
    // = (habits completed this week / total habits) * 100
    const weeklyCompletions = calculateWeeklyCompletions(user.id);
    const consistencyScore = (weeklyCompletions.completed / weeklyCompletions.total) * 100;

    return {
      userId: user.id,
      username: user.username,
      consistencyScore,
      streakCount: calculateCurrentStreak(user.id),
      habitsCompleted: weeklyCompletions.completed,
    };
  });

  // Sort by consistency score
  return rankings.sort((a, b) => b.consistencyScore - a.consistencyScore);
}
```

**Estimated Effort:** 25 hours

---

### 3.4 Shared Mentor Insights

**Feature:** Share AI-generated insights with accountability partner

**Estimated Effort:** 20 hours

---

### 3.5 Community Challenges

**Feature:** AI-curated challenges based on user's habits

**Estimated Effort:** 30 hours

---

## Phase 3 Summary

| Feature | Hours |
|---------|-------|
| Partner Matching | 35 |
| Mentor Groups | 40 |
| Leaderboards | 25 |
| Shared Insights | 20 |
| Community Challenges | 30 |
| **Total Phase 3** | **150 hours** |

**Estimated Timeline:** 4-5 weeks
**Cost:** $4,500-$7,500

---

## Phase 4: Health Integration (Weeks 9-12)

### 4.1 Apple Health Sync

**Feature:** Sync steps, sleep, exercise, heart rate from Apple Health

**Technical Implementation:**

```typescript
// hooks/use-apple-health.ts
import { useHealthKit } from '@react-native-health/health-kit';

export function useAppleHealth() {
  const { getHealthData, requestPermissions } = useHealthKit();

  const syncHealthData = async () => {
    // Request permissions
    await requestPermissions([
      'HKQuantityTypeIdentifierStepCount',
      'HKQuantityTypeIdentifierHeartRate',
      'HKCategoryTypeIdentifierSleepAnalysis',
      'HKWorkoutTypeIdentifier',
    ]);

    // Fetch data from Apple Health
    const steps = await getHealthData({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      endDate: new Date(),
      ascending: false,
      limit: 100,
      type: 'HKQuantityTypeIdentifierStepCount',
    });

    // Store in database
    await fetch('/api/health/sync', {
      method: 'POST',
      body: JSON.stringify({ steps }),
    });
  };

  return { syncHealthData };
}
```

**Estimated Effort:** 50 hours

---

### 4.2 HRV + Stress Tracking

**Feature:** Track heart rate variability and stress levels

**Estimated Effort:** 40 hours

---

### 4.3 Wearable Integration

**Feature:** Support Apple Watch, Oura Ring, Whoop

**Estimated Effort:** 60 hours

---

### 4.4 Sleep Quality Impact Analysis

**Feature:** Show how sleep affects habit success

**Estimated Effort:** 35 hours

---

## Phase 4 Summary

| Feature | Hours |
|---------|-------|
| Apple Health Sync | 50 |
| HRV + Stress | 40 |
| Wearable Integration | 60 |
| Sleep Impact | 35 |
| **Total Phase 4** | **185 hours** |

**Estimated Timeline:** 5-6 weeks
**Cost:** $5,500-$8,500

---

## Phase 5: Advanced Analytics (Weeks 13-16)

### 5.1 Predictive Streak Break Alerts

**Feature:** AI predicts when user will break streak, offers intervention

**Estimated Effort:** 45 hours

---

### 5.2 Habit Correlation Analysis

**Feature:** Show which habits help/hurt other habits

**Estimated Effort:** 40 hours

---

### 5.3 Success Pattern Identification

**Feature:** Identify optimal time, environment, sequence for each habit

**Estimated Effort:** 35 hours

---

### 5.4 AI-Written Weekly Reports

**Feature:** Weekly summary generated by AI

**Estimated Effort:** 30 hours

---

### 5.5 Custom Dashboards

**Feature:** Users customize their analytics dashboard

**Estimated Effort:** 25 hours

---

## Phase 5 Summary

| Feature | Hours |
|---------|-------|
| Predictive Alerts | 45 |
| Habit Correlations | 40 |
| Success Patterns | 35 |
| AI Reports | 30 |
| Custom Dashboards | 25 |
| **Total Phase 5** | **175 hours** |

**Estimated Timeline:** 4-5 weeks
**Cost:** $5,000-$7,500

---

## Phase 6: Gamification (Weeks 17-20)

### 6.1 Mentor Level System

**Feature:** Unlock new AI coaching styles as you progress

**Estimated Effort:** 30 hours

---

### 6.2 Habit Mastery Tiers

**Feature:** Move from "Beginner" → "Consistent" → "Automatic"

**Estimated Effort:** 25 hours

---

### 6.3 Achievement Badges

**Feature:** Earn badges for habits completed, not just streaks

**Estimated Effort:** 20 hours

---

### 6.4 Mentor Rewards

**Feature:** AI suggests rewards that match your personality

**Estimated Effort:** 20 hours

---

### 6.5 Seasonal Challenges

**Feature:** Limited-time challenges with rewards

**Estimated Effort:** 25 hours

---

## Phase 6 Summary

| Feature | Hours |
|---------|-------|
| Mentor Levels | 30 |
| Mastery Tiers | 25 |
| Badges | 20 |
| Rewards | 20 |
| Seasonal Challenges | 25 |
| **Total Phase 6** | **120 hours** |

**Estimated Timeline:** 3-4 weeks
**Cost:** $3,500-$5,500

---

## Final: Build APK and Deploy to App Store

**Tasks:**
- Build production APK
- Submit to Google Play Store
- Submit to Apple App Store
- Set up app store optimization (ASO)
- Create marketing materials

**Estimated Effort:** 40 hours
**Timeline:** 2-3 weeks

---

## Complete Project Summary

| Phase | Hours | Timeline | Cost |
|-------|-------|----------|------|
| Phase 1 (Current) | 100 | ✅ Complete | $0 |
| Phase 2: Mentor | 130 | 3-4 weeks | $3,500-$5,500 |
| Phase 3: Social | 150 | 4-5 weeks | $4,500-$7,500 |
| Phase 4: Health | 185 | 5-6 weeks | $5,500-$8,500 |
| Phase 5: Analytics | 175 | 4-5 weeks | $5,000-$7,500 |
| Phase 6: Gamification | 120 | 3-4 weeks | $3,500-$5,500 |
| Final: Deploy | 40 | 2-3 weeks | $1,200-$2,000 |
| **TOTAL** | **900 hours** | **6-9 months** | **$23,200-$36,500** |

---

## Technology Stack

**Frontend:**
- React Native 0.81
- Expo SDK 54
- Reanimated 4 (animations)
- TanStack Query (data fetching)
- Zustand (state management)

**Backend:**
- Node.js + Express
- PostgreSQL + Drizzle ORM
- Claude API (AI mentor)
- RevenueCat (in-app purchases)

**Infrastructure:**
- AWS (or similar) for backend
- Expo for mobile deployment
- Firebase for push notifications

---

## Success Metrics

- **User Retention:** 40%+ 30-day retention (vs. 20% industry average)
- **Habit Success Rate:** 70%+ habit completion rate (vs. 50% industry average)
- **Mentor Engagement:** 80%+ weekly AI mentor interaction
- **Premium Conversion:** 15-20% of free users upgrade
- **App Store Rating:** 4.8★+
- **User Base:** 100K users Year 1, 1M users Year 3

---

## Next Steps

1. **Approve Phase 2 Implementation** — Start with AI Mentor Chat
2. **Set up Claude API** — Get API key and set up backend
3. **Create Backend Infrastructure** — Database, API endpoints, auth
4. **Build Mentor UI** — Chat interface, emotional check-in
5. **Test with Beta Users** — Get feedback before Phase 3

