import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback, useState } from "react";
import { useSyncToServer } from "./use-sync";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  level: MoodLevel;
  emoji: string;
  timestamp: number;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  durationMin: number;
  isDefault: boolean;
  order: number;
}

export interface HabitCompletion {
  habitId: string;
  date: string;
  completedAt: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  prompt: string;
  moodLevel?: MoodLevel;
  createdAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export interface SideQuest {
  id: string;
  title: string;
  description: string;
  icon: string;
  durationDays: number;
  xpReward: number;
  badgeId: string;
  startedAt?: number; // timestamp when user started
  completedAt?: number; // timestamp when completed
  category: "discipline" | "wellness" | "mindset" | "body";
}

export type Rank = "Early Riser" | "Morning Warrior" | "Grind Master" | "Grind Legend";

/** Collected during onboarding questionnaire */
export interface UserProfile {
  goals: string[];         // e.g. ["discipline", "fitness"]
  problems: string[];      // e.g. ["procrastination", "low_energy"]
  wakeTime: string;        // e.g. "5am"
  motivationStyle: string; // e.g. "tough_love"
  empathyAnswer: string;
  goalAnswer: string;
  age: string;
}

/** AI-generated morning routine from onboarding answers */
export interface GeneratedHabit {
  name: string;
  icon: string;
  durationMin: number;
  reason: string; // why this habit was chosen for this user
}

export interface GeneratedRoutine {
  habits: GeneratedHabit[];
  journalPrompts: string[]; // 5 personalized daily prompts
  coachingTone: string;     // summary of AI coaching style
  createdAt: number;
}

export interface GhostFriend {
  code: string;
  name: string;
  streak: number;
  xp: number;
  addedAt: number;
}

export interface AppState {
  // Onboarding
  isOnboarded: boolean;
  // ISSUE 1+5: Track current onboarding step for resume on force-quit
  currentOnboardingStep: string | null; // e.g. "step1-name-age", "step2-empathy", etc.
  // ISSUE 5: Store onboarding answers in context for routine personalization (instead of route params)
  onboardingAnswers: {
    name?: string;
    age?: string;
    empathyAnswer?: string;
    goalAnswer?: string;
    selectedGoals?: string[];
    selectedProblems?: string[];
    wakeTime?: string;
    motivationStyle?: string;
  };
  // BUG 4 FIX (Part 1): isLoggingOut flag prevents AsyncStorage reload during logout.
  // Set to true at the very start of completeLogout(), before any async operations.
  // Reset to false in the LOGOUT reducer case (via clean INITIAL_STATE return).
  isLoggingOut: boolean;
  userName: string;
  isPremium: boolean;
  userProfile: UserProfile | null;
  generatedRoutine: GeneratedRoutine | null;
  language: "en" | "fr" | "pt";
  languageLocked: boolean;

  // Mood
  moodEntries: MoodEntry[];
  todayMood: MoodEntry | null;

  // Habits
  habits: Habit[];
  completions: HabitCompletion[];

  // Journal
  journalEntries: JournalEntry[];

  // Gamification
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  achievements: Achievement[];
  sideQuests: SideQuest[];

  // Community
  ghostCode: string;
  friends: GhostFriend[];
  // UI
  isLoading: boolean;
}

export type AppAction =
  | { type: "SET_ONBOARDED"; payload: { userName: string } }
  | { type: "SET_ONBOARDING_STEP"; payload: string | null }
  | { type: "SET_ONBOARDING_ANSWERS"; payload: Partial<AppState["onboardingAnswers"]> }
  | { type: "CLEAR_ONBOARDING_STATE" }
  | { type: "SET_LANGUAGE"; payload: { language: "en" | "fr" | "pt"; lock: boolean } }
  | { type: "SET_PREMIUM"; payload: boolean }
  | { type: "SET_USER_PROFILE"; payload: UserProfile }
  | { type: "SET_GENERATED_ROUTINE"; payload: GeneratedRoutine }
  | { type: "SET_MOOD"; payload: MoodEntry }
  | { type: "ADD_HABIT"; payload: Habit }
  | { type: "UPDATE_HABIT"; payload: Habit }
  | { type: "DELETE_HABIT"; payload: string }
  | { type: "TOGGLE_HABIT"; payload: HabitCompletion }
  | { type: "ADD_JOURNAL"; payload: JournalEntry }
  | { type: "DELETE_JOURNAL"; payload: string }
  | { type: "ADD_XP"; payload: number }
  | { type: "UPDATE_STREAK" }
  | { type: "UNLOCK_ACHIEVEMENT"; payload: string }
  | { type: "START_SIDE_QUEST"; payload: string }
  | { type: "COMPLETE_SIDE_QUEST"; payload: string }
  | { type: "ABANDON_SIDE_QUEST"; payload: string }
  | { type: "ADD_FRIEND"; payload: GhostFriend }
  | { type: "REMOVE_FRIEND"; payload: string }
  | { type: "LOAD_STATE"; payload: Partial<AppState> }
  | { type: "SET_LOADING"; payload: boolean }
  // BUG 4 FIX (Part 1): SET_LOGGING_OUT is dispatched at the very start of completeLogout()
  // BEFORE any async operations. This immediately blocks the AsyncStorage useEffect guard.
  | { type: "SET_LOGGING_OUT" }
  | { type: "LOGOUT" };

// ─── Default Habits ───────────────────────────────────────────────────────────

export const DEFAULT_HABITS: Habit[] = [
  { id: "h1", name: "Wake Up Early", icon: "☀️", durationMin: 0, isDefault: true, order: 0 },
  { id: "h2", name: "Hydrate", icon: "💧", durationMin: 2, isDefault: true, order: 1 },
  { id: "h3", name: "Meditate", icon: "🧘", durationMin: 10, isDefault: true, order: 2 },
  { id: "h4", name: "Exercise", icon: "🏃", durationMin: 30, isDefault: true, order: 3 },
  { id: "h5", name: "Read", icon: "📖", durationMin: 15, isDefault: true, order: 4 },
  { id: "h6", name: "Cold Shower", icon: "🚿", durationMin: 5, isDefault: true, order: 5 },
  { id: "h7", name: "Gratitude", icon: "🙏", durationMin: 5, isDefault: true, order: 6 },
];

// ─── Gamification ─────────────────────────────────────────────────────────────

export const RANK_THRESHOLDS: { rank: Rank; minXP: number }[] = [
  { rank: "Early Riser", minXP: 0 },
  { rank: "Morning Warrior", minXP: 500 },
  { rank: "Grind Master", minXP: 1500 },
  { rank: "Grind Legend", minXP: 3500 },
];

export function getRank(xp: number): Rank {
  let rank: Rank = "Early Riser";
  for (const tier of RANK_THRESHOLDS) {
    if (xp >= tier.minXP) rank = tier.rank;
  }
  return rank;
}

export function getNextRankXP(xp: number): number {
  for (const tier of RANK_THRESHOLDS) {
    if (xp < tier.minXP) return tier.minXP;
  }
  return 7000;
}

export const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: "😔",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😄",
};

export const MOOD_LABELS: Record<MoodLevel, string> = {
  1: "Rough",
  2: "Low",
  3: "Okay",
  4: "Good",
  5: "Amazing",
};

// ─── Side Quests ─────────────────────────────────────────────────────────────

export const ALL_SIDE_QUESTS: SideQuest[] = [
  {
    id: "sq_no_social_7",
    title: "Digital Blackout",
    description: "7 days no social media. Disappear from the feed. Reappear as someone different.",
    icon: "📵",
    durationDays: 7,
    xpReward: 200,
    badgeId: "ghost_digital",
    category: "discipline",
  },
  {
    id: "sq_sleep_7",
    title: "Sleep Optimization Week",
    description: "Sleep before 10:30 PM every night for 7 days. Protect your recovery like your life depends on it.",
    icon: "🌙",
    durationDays: 7,
    xpReward: 175,
    badgeId: "ghost_sleep",
    category: "wellness",
  },
  {
    id: "sq_gratitude_7",
    title: "Gratitude Deep Dive",
    description: "Write 3 things you're grateful for every day for 7 days. No repeats.",
    icon: "🙏",
    durationDays: 7,
    xpReward: 150,
    badgeId: "ghost_gratitude",
    category: "mindset",
  },
  {
    id: "sq_cold_shower_14",
    title: "Cold Ghost Protocol",
    description: "14 days of cold showers. Every morning. No excuses. The cold builds what comfort destroys.",
    icon: "🚿",
    durationDays: 14,
    xpReward: 300,
    badgeId: "ghost_cold",
    category: "body",
  },
  {
    id: "sq_no_alcohol_30",
    title: "30-Day Clarity Mission",
    description: "30 days alcohol-free. Clear mind. Sharp focus. Ghost Mode at full power.",
    icon: "🧠",
    durationDays: 30,
    xpReward: 500,
    badgeId: "ghost_clarity",
    category: "discipline",
  },
  {
    id: "sq_journal_14",
    title: "14-Day Reflection Sprint",
    description: "Journal every day for 14 days. No skipping. Your thoughts deserve to be heard.",
    icon: "✍️",
    durationDays: 14,
    xpReward: 250,
    badgeId: "ghost_writer",
    category: "mindset",
  },
  {
    id: "sq_exercise_21",
    title: "21-Day Body Activation",
    description: "Exercise every single day for 21 days. Build the body that matches the mind.",
    icon: "💪",
    durationDays: 21,
    xpReward: 400,
    badgeId: "ghost_body",
    category: "body",
  },
  {
    id: "sq_meditate_10",
    title: "10-Day Silence Protocol",
    description: "Meditate for at least 10 minutes every day for 10 days. Silence is your weapon.",
    icon: "🧘",
    durationDays: 10,
    xpReward: 200,
    badgeId: "ghost_zen",
    category: "wellness",
  },
];

// ─── Achievements ─────────────────────────────────────────────────────────────

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: "first_entry", title: "First Entry", description: "Write your first journal entry", icon: "✍️" },
  { id: "streak_7", title: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥" },
  { id: "streak_30", title: "Monthly Master", description: "Maintain a 30-day streak", icon: "💪" },
  { id: "habits_100", title: "Habit Hero", description: "Complete 100 habits total", icon: "🏆" },
  { id: "first_routine", title: "Rise & Shine", description: "Complete your first full routine", icon: "☀️" },
  { id: "mood_7", title: "Mood Tracker", description: "Track your mood 7 days in a row", icon: "😊" },
];

// ─── Initial State ────────────────────────────────────────────────────────────

function generateGhostCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const INITIAL_STATE: AppState = {
  isOnboarded: false,
  currentOnboardingStep: null, // ISSUE 1+5: Track step for resume
  onboardingAnswers: {}, // ISSUE 5: Store answers in context
  isLoggingOut: false, // BUG 4 FIX (Part 1): default false
  userName: "",
  isPremium: false,
  userProfile: null,
  generatedRoutine: null,
  language: "en",
  languageLocked: false,
  moodEntries: [],
  todayMood: null,
  habits: DEFAULT_HABITS,
  completions: [],
  journalEntries: [],
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  achievements: ALL_ACHIEVEMENTS,
  sideQuests: ALL_SIDE_QUESTS,
  ghostCode: generateGhostCode(),
  friends: [],
  isLoading: true,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LANGUAGE":
      return {
        ...state,
        language: action.payload.language,
        languageLocked: action.payload.lock,
      };
    case "SET_ONBOARDED":
      return { ...state, isOnboarded: true, userName: action.payload.userName, currentOnboardingStep: null, onboardingAnswers: {} };

    case "SET_ONBOARDING_STEP":
      return { ...state, currentOnboardingStep: action.payload };

    case "SET_ONBOARDING_ANSWERS":
      return { ...state, onboardingAnswers: { ...state.onboardingAnswers, ...action.payload } };

    case "CLEAR_ONBOARDING_STATE":
      return { ...state, currentOnboardingStep: null, onboardingAnswers: {} };

    case "SET_PREMIUM":
      return { ...state, isPremium: action.payload };

    case "SET_USER_PROFILE":
      return { ...state, userProfile: action.payload };

    case "SET_GENERATED_ROUTINE": {
      // Replace default habits with AI-generated ones if this is first-time generation
      const newHabits: Habit[] = action.payload.habits.map((h, i) => ({
        id: `ai_h${i + 1}`,
        name: h.name,
        icon: h.icon,
        durationMin: h.durationMin,
        isDefault: true,
        order: i,
      }));
      return {
        ...state,
        generatedRoutine: action.payload,
        // Only replace habits if they haven't been customized yet (still all defaults)
        habits: state.habits.every((h) => h.isDefault) ? newHabits : state.habits,
      };
    }

    case "SET_MOOD": {
      const existing = state.moodEntries.filter((m) => m.date !== action.payload.date);
      return {
        ...state,
        moodEntries: [...existing, action.payload],
        todayMood: action.payload,
      };
    }

    case "ADD_HABIT":
      return { ...state, habits: [...state.habits, action.payload] };

    case "UPDATE_HABIT":
      return {
        ...state,
        habits: state.habits.map((h) => (h.id === action.payload.id ? action.payload : h)),
      };

    case "DELETE_HABIT":
      return { ...state, habits: state.habits.filter((h) => h.id !== action.payload) };

    case "TOGGLE_HABIT": {
      const exists = state.completions.find(
        (c) => c.habitId === action.payload.habitId && c.date === action.payload.date
      );
      if (exists) {
        return {
          ...state,
          completions: state.completions.filter(
            (c) => !(c.habitId === action.payload.habitId && c.date === action.payload.date)
          ),
        };
      }
      return { ...state, completions: [...state.completions, action.payload] };
    }

    case "ADD_JOURNAL":
      return { ...state, journalEntries: [action.payload, ...state.journalEntries] };

    case "DELETE_JOURNAL":
      return { ...state, journalEntries: state.journalEntries.filter((j) => j.id !== action.payload) };

    case "ADD_XP":
      return { ...state, xp: state.xp + action.payload };

    case "UPDATE_STREAK": {
      const today = todayStr();
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      if (state.lastActiveDate === today) return state;
      const newStreak = state.lastActiveDate === yesterday ? state.streak + 1 : 1;
      return { ...state, streak: newStreak, lastActiveDate: today };
    }

    case "UNLOCK_ACHIEVEMENT": {
      const updated = state.achievements.map((a) =>
        a.id === action.payload && !a.unlockedAt ? { ...a, unlockedAt: Date.now() } : a
      );
      return { ...state, achievements: updated };
    }

    case "START_SIDE_QUEST": {
      const quests = state.sideQuests.map((q) =>
        q.id === action.payload && !q.startedAt && !q.completedAt
          ? { ...q, startedAt: Date.now() }
          : q
      );
      return { ...state, sideQuests: quests };
    }

    case "COMPLETE_SIDE_QUEST": {
      const quest = state.sideQuests.find((q) => q.id === action.payload);
      const quests = state.sideQuests.map((q) =>
        q.id === action.payload ? { ...q, completedAt: Date.now() } : q
      );
      return {
        ...state,
        sideQuests: quests,
        xp: state.xp + (quest?.xpReward ?? 0),
      };
    }

    case "ADD_FRIEND":
      if (state.friends.some((f) => f.code === action.payload.code)) return state;
      return { ...state, friends: [...state.friends, action.payload] };

    case "REMOVE_FRIEND":
      return { ...state, friends: state.friends.filter((f) => f.code !== action.payload) };

    case "ABANDON_SIDE_QUEST": {
      const quests = state.sideQuests.map((q) =>
        q.id === action.payload ? { ...q, startedAt: undefined, completedAt: undefined } : q
      );
      return { ...state, sideQuests: quests };
    }

    case "LOAD_STATE":
      return { ...state, ...action.payload, isLoading: false };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    // BUG 4 FIX (Part 1): SET_LOGGING_OUT is dispatched at the very start of completeLogout(),
    // BEFORE any async operations. This immediately raises the flag so the AsyncStorage
    // useEffect guard (Part 2) can block any re-read that would overwrite isOnboarded.
    case "SET_LOGGING_OUT":
      console.log("[LOGOUT] REDUCER: SET_LOGGING_OUT — isLoggingOut = true, blocking AsyncStorage reload");
      return { ...state, isLoggingOut: true };

    // BUG 4 FIX (Part 3): Return a completely clean initial state — do NOT spread existing state.
    // Spreading state was the original bug: stale data (including isOnboarded: true from a
    // parallel AsyncStorage read) could survive the LOGOUT action.
    // We return INITIAL_STATE spread as the base, then override the fields that must be fresh.
    case "LOGOUT":
      console.log("[LOGOUT] REDUCER: LOGOUT case hit — returning CLEAN initial state, isOnboarded: false");
      return {
        ...INITIAL_STATE,
        isLoggingOut: false,    // explicitly reset — logout is complete
        isOnboarded: false,     // explicitly false — user must re-onboard
        isLoading: false,       // don't re-trigger the loading spinner
        ghostCode: generateGhostCode(), // fresh ghost code for next user
      };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // BUG 4 FIX: Mutable ref exposed so completeLogout() can set it synchronously
  // before any async work, bypassing the closure problem of state.isLoggingOut.
  isLoggingOutRef: React.MutableRefObject<boolean>;
  // Helpers
  todayCompletions: HabitCompletion[];
  todayProgress: number;
  rank: Rank;
  nextRankXP: number;
  // Milestone 2 Phase C: sync state
  isSyncing: boolean;
  syncError: string | null;
  retrySync: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = "@risegrind_state";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // BUG 4 FIX (Part 2 — revised): Use a mutable ref instead of state.isLoggingOut.
  //
  // WHY state.isLoggingOut DOESN'T WORK:
  //   The useEffect with [] captures state at mount time via closure.
  //   state.isLoggingOut is always false at that snapshot, so the guard never fires
  //   even after SET_LOGGING_OUT is dispatched — the closure sees the stale value.
  //
  // WHY useRef WORKS:
  //   A ref is a plain mutable object ({ current: false }) that lives outside the
  //   render cycle. Reading isLoggingOutRef.current always gives the live value,
  //   not a closure-captured snapshot. Setting .current = true in completeLogout()
  //   is immediately visible to any code that reads it, including the effect callback.
  //
  // HOW IT'S WIRED:
  //   isLoggingOutRef is exposed in context so completeLogout() (called from profile.tsx)
  //   can set isLoggingOutRef.current = true synchronously as its very first action,
  //   before any async work. The LOGOUT reducer resets it to false via the
  //   SET_LOGGING_OUT reducer case (which now sets the ref, not state).
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    if (isLoggingOutRef.current) {
      console.log("[LOGOUT] APPPROVIDER: Skipping AsyncStorage load — isLoggingOutRef = true");
      return;
    }
    console.log("[LOGOUT] APPPROVIDER: Loading from AsyncStorage on mount");
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw) as Partial<AppState>;
          // Restore today's mood
          const today = todayStr();
          const todayMood = saved.moodEntries?.find((m: MoodEntry) => m.date === today) ?? null;
          dispatch({ type: "LOAD_STATE", payload: { ...saved, todayMood } });
        } else {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      })
      .catch(() => dispatch({ type: "SET_LOADING", payload: false }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — intentionally empty; ref is mutable, no closure issue

  // Persist state changes
  useEffect(() => {
    if (!state.isLoading) {
      const { isLoading, todayMood, ...persistable } = state;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persistable)).catch(() => {});
    }
  }, [state]);

  // Milestone 2 Phase C: sync hook
  const { retryFirstSync } = useSyncToServer({
    state,
    dispatch,
    onSyncingChange: setIsSyncing,
    onSyncError: setSyncError,
  });

  const todayCompletions = state.completions.filter((c) => c.date === todayStr());
  const todayProgress = state.habits.length > 0 ? todayCompletions.length / state.habits.length : 0;
  const rank = getRank(state.xp);
  const nextRankXP = getNextRankXP(state.xp);

  return (
    <AppContext.Provider value={{ state, dispatch, isLoggingOutRef, todayCompletions, todayProgress, rank, nextRankXP, isSyncing, syncError, retrySync: retryFirstSync }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
