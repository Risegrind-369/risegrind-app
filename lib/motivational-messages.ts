/**
 * Motivational Message Templates for Daily Push Notifications
 *
 * Generates personalized motivational messages based on user profile and goals.
 */

export interface MotivationalContext {
  name?: string;
  goals?: string[];
  motivationStyle?: "tough_love" | "gentle" | "data_driven" | "challenge";
  wakeTime?: string;
  streak?: number;
  xp?: number;
}

/**
 * Gentle encouragement messages
 */
const GENTLE_MESSAGES = [
  "Good morning, {name}! 🌅 Today is a fresh start. Let's build something great together.",
  "Rise and shine! ☀️ Your future self is waiting for the choices you make today.",
  "Hey {name}, you've got this. One habit at a time, one day at a time. 💪",
  "Morning, {name}! 🌟 Remember: consistency beats perfection. Let's go.",
  "You're stronger than you think. Today is your day to prove it. 🔥",
  "Good morning! 👻 Every routine completed is a step closer to who you want to become.",
];

/**
 * Tough love / Challenge messages
 */
const TOUGH_LOVE_MESSAGES = [
  "It's {time}. Stop sleeping on your dreams. Get up and execute. 💯",
  "Your competitors are already working. What's your excuse? 🚀",
  "Time to show up. No excuses, no delays. Make it happen. 💪",
  "The gap between who you are and who you want to be? Today you close it. 🎯",
  "Comfort is the enemy of growth. Let's get uncomfortable today. 🔥",
  "You said you wanted to change. Prove it. Now. 💯",
];

/**
 * Data-driven / Stats messages
 */
const DATA_DRIVEN_MESSAGES = [
  "📊 {streak} day streak! Keep the momentum. Complete your routine today.",
  "You've earned {xp} XP so far. {name}, you're {percent}% of the way to your next rank. 📈",
  "Data shows: people with daily routines are 3x more likely to reach their goals. You're one of them. 📊",
  "Your consistency score: {percent}%. Let's push it higher today. 📈",
  "Weekly insight: {streak} day streak = {xp} XP earned. Keep it up! 🎯",
];

/**
 * Challenge / Gamified messages
 */
const CHALLENGE_MESSAGES = [
  "🎮 Daily Challenge: Complete your routine + journal entry. Unlock +50 XP!",
  "⚡ Quest Alert: {name}, can you hit {xp} XP today? The challenge awaits.",
  "🏆 Leaderboard Update: You're climbing! One more day of consistency = next rank.",
  "🎯 Mission: Maintain your {streak} day streak. Don't break the chain today.",
  "🔥 Streak Multiplier Active: Every habit completed = 2x XP today!",
];

/**
 * Journal-specific prompts
 */
const JOURNAL_PROMPTS = [
  "📝 Reflection time: Who do you want to become? Write about it.",
  "📝 Journal prompt: What's one thing you're proud of from yesterday?",
  "📝 Tonight's reflection: What did you learn about yourself today?",
  "📝 Quick check-in: How are you feeling? What's on your mind?",
  "📝 Growth moment: What challenged you today, and how did you handle it?",
];

/**
 * Stats analysis prompts
 */
const STATS_PROMPTS = [
  "📊 Check your weekly stats: mood trends, habit completion, XP earned.",
  "📊 Your Ghost Intel is ready: See your progress & patterns this week.",
  "📊 Analytics update: View your 7-day mood trend & habit insights.",
  "📊 Stats moment: Your data tells a story. Ready to see it?",
];

/**
 * Select a random message from an array
 */
function selectRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Format message with context variables
 */
function formatMessage(template: string, context: MotivationalContext): string {
  let message = template;

  if (context.name) {
    message = message.replace(/{name}/g, context.name);
  }

  if (context.streak) {
    message = message.replace(/{streak}/g, context.streak.toString());
  }

  if (context.xp) {
    message = message.replace(/{xp}/g, context.xp.toString());
  }

  if (context.xp && context.xp > 0) {
    const percent = Math.min(100, Math.floor((context.xp / 1000) * 100));
    message = message.replace(/{percent}/g, percent.toString());
  }

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  message = message.replace(/{time}/g, timeOfDay);

  return message;
}

/**
 * Generate a motivational title for daily reminder
 */
export function generateMotivationalTitle(context: MotivationalContext): string {
  const titles = [
    "🌅 Rise & Grind",
    "👻 Ghost Mode Activated",
    "🔥 Time to Build",
    "💪 Let's Go",
    "⚡ Daily Challenge",
    "🎯 Mission Time",
  ];

  return selectRandom(titles);
}

/**
 * Generate a motivational body message based on user profile
 */
export function generateMotivationalMessage(context: MotivationalContext): string {
  const style = context.motivationStyle || "gentle";

  let messages: string[] = [];

  switch (style) {
    case "tough_love":
      messages = TOUGH_LOVE_MESSAGES;
      break;
    case "data_driven":
      messages = DATA_DRIVEN_MESSAGES;
      break;
    case "challenge":
      messages = CHALLENGE_MESSAGES;
      break;
    case "gentle":
    default:
      messages = GENTLE_MESSAGES;
      break;
  }

  const template = selectRandom(messages);
  return formatMessage(template, context);
}

/**
 * Generate a journal reminder message
 */
export function generateJournalReminder(context: MotivationalContext): string {
  const template = selectRandom(JOURNAL_PROMPTS);
  return formatMessage(template, context);
}

/**
 * Generate a stats analysis reminder
 */
export function generateStatsReminder(context: MotivationalContext): string {
  const template = selectRandom(STATS_PROMPTS);
  return formatMessage(template, context);
}

/**
 * Get a rotation of notification types for the week
 * Alternates between: motivation, journal, stats
 */
export function getNotificationTypeForDay(dayOfWeek: number): "motivation" | "journal" | "stats" {
  const types: Array<"motivation" | "journal" | "stats"> = ["motivation", "journal", "stats"];
  return types[dayOfWeek % 3];
}

/**
 * Generate a complete notification (title + body) for the day
 */
export function generateDailyNotification(context: MotivationalContext) {
  const dayOfWeek = new Date().getDay();
  const notificationType = getNotificationTypeForDay(dayOfWeek);

  let title: string;
  let body: string;

  switch (notificationType) {
    case "journal":
      title = "📝 Time to Reflect";
      body = generateJournalReminder(context);
      break;
    case "stats":
      title = "📊 Check Your Progress";
      body = generateStatsReminder(context);
      break;
    case "motivation":
    default:
      title = generateMotivationalTitle(context);
      body = generateMotivationalMessage(context);
      break;
  }

  return { title, body, type: notificationType };
}
