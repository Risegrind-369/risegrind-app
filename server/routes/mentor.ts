import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '../db';
import { mentorChats, emotionalCheckIns, habitRecommendations, userProfiles } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();
const client = new Anthropic();

// Mentor personality templates with language support
const MENTOR_PERSONALITIES = {
  supportive: {
    name: 'Supportive Coach',
    description: 'Encouraging, empathetic, celebrates progress',
    systemPrompt: (lang: string) => `You are a supportive habit coach mentor. Your role is to:
- Celebrate every win, no matter how small
- Show genuine empathy and understanding
- Encourage users when they struggle
- Ask thoughtful questions about their feelings and motivations
- Provide gentle guidance without judgment
- Reference real habit science and research
- Use warm, friendly language
${lang === 'fr' ? 'Respond ONLY in French. Keep responses concise (2-3 sentences max) and personal.' : lang === 'pt' ? 'Respond ONLY in Portuguese. Keep responses concise (2-3 sentences max) and personal.' : 'Keep responses concise (2-3 sentences max) and personal.'}`
  },
  challenging: {
    name: 'Challenging Coach',
    description: 'Direct, pushes boundaries, accountability-focused',
    systemPrompt: (lang: string) => `You are a direct habit coach mentor. Your role is to:
- Hold users accountable to their commitments
- Challenge excuses with respect and evidence
- Push them to go beyond their comfort zone
- Ask tough questions that drive reflection
- Reference research on habit formation and discipline
- Celebrate effort and consistency
- Use direct, honest language
${lang === 'fr' ? 'Respond ONLY in French. Keep responses concise (2-3 sentences max) and action-oriented.' : lang === 'pt' ? 'Respond ONLY in Portuguese. Keep responses concise (2-3 sentences max) and action-oriented.' : 'Keep responses concise (2-3 sentences max) and action-oriented.'}`
  },
  scientific: {
    name: 'Scientific Coach',
    description: 'Data-driven, research-based, educational',
    systemPrompt: (lang: string) => `You are a scientific habit coach mentor. Your role is to:
- Explain the neuroscience behind habit formation (dopamine loops, cue-routine-reward)
- Reference evidence-based strategies (BJ Fogg, James Clear, Charles Duhigg)
- Provide data-driven insights based on user patterns
- Ask analytical questions about triggers and environmental design
- Educate about habit stacking and implementation intentions
- Use clear, educational language grounded in research
${lang === 'fr' ? 'Respond ONLY in French. Keep responses concise (2-3 sentences max) and informative.' : lang === 'pt' ? 'Respond ONLY in Portuguese. Keep responses concise (2-3 sentences max) and informative.' : 'Keep responses concise (2-3 sentences max) and informative.'}`
  },
  friendly: {
    name: 'Friendly Companion',
    description: 'Conversational, relatable, supportive friend',
    systemPrompt: (lang: string) => `You are a friendly habit companion mentor. Your role is to:
- Be like a supportive friend who genuinely cares
- Share in their journey with authentic interest
- Ask about their day, feelings, and challenges
- Celebrate wins together and commiserate on struggles
- Offer practical, relatable advice grounded in habit science
- Use conversational, casual language
${lang === 'fr' ? 'Respond ONLY in French. Keep responses concise (2-3 sentences max) and warm.' : lang === 'pt' ? 'Respond ONLY in Portuguese. Keep responses concise (2-3 sentences max) and warm.' : 'Keep responses concise (2-3 sentences max) and warm.'}`
  }
};

// Build user context for smarter mentor responses
async function buildUserContext(userId: number, db: any): Promise<string> {
  try {
    // Get user profile for context
    const userProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
    
    // Get recent emotional check-ins (last 7 days)
    const recentCheckIns = await db.select().from(emotionalCheckIns)
      .where(eq(emotionalCheckIns.userId, userId))
      .orderBy(desc(emotionalCheckIns.date))
      .limit(7);
    
    // Build context string
    let context = `\n\n[USER CONTEXT FOR MENTOR]\n`;
    
    if (userProfile.length > 0) {
      const profile = userProfile[0];
      context += `User Goals: ${profile.goals || 'Not set'}\n`;
      context += `Motivation Style: ${profile.motivationStyle || 'Unknown'}\n`;
    }
    
    if (recentCheckIns.length > 0) {
      const avgMood = Math.round(recentCheckIns.reduce((sum: number, c: any) => sum + c.mood, 0) / recentCheckIns.length);
      context += `Recent Mood Trend: ${avgMood}/5 (${['Poor', 'Low', 'Okay', 'Good', 'Amazing'][avgMood - 1]})\n`;
    }
    
    context += `[END USER CONTEXT]\n`;
    return context;
  } catch (error) {
    console.error('Error building user context:', error);
    return '';
  }
}

// POST /api/mentor/chat - Send message to mentor with enhanced context
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { userId, message, mentorPersonality = 'supportive', language = 'en' } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'Missing userId or message' });
    }
    
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const personality = MENTOR_PERSONALITIES[mentorPersonality as keyof typeof MENTOR_PERSONALITIES] || MENTOR_PERSONALITIES.supportive;
    
    // Get recent chat history (last 10 messages)
    const chatHistory = await db.select().from(mentorChats)
      .where(eq(mentorChats.userId, parseInt(userId)))
      .orderBy(desc(mentorChats.createdAt))
      .limit(10);
    
    // Build conversation history for Claude
    const conversationHistory = chatHistory.reverse().map((chat: any) => ({
      role: chat.role as 'user' | 'assistant',
      content: chat.message
    }));
    
    // Add current user message
    conversationHistory.push({
      role: 'user',
      content: message
    });
    
    // Build user context for smarter responses
    const userContext = await buildUserContext(parseInt(userId), db);
    
    // Get mentor response from Claude with enhanced system prompt
    const systemPrompt = personality.systemPrompt(language) + userContext;
    
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: systemPrompt,
      messages: conversationHistory
    });
    
    const mentorMessage = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Save user message to database
    await db.insert(mentorChats).values({
      userId: parseInt(userId),
      message,
      role: 'user',
      mentorPersonality
    });
    
    // Save mentor response to database
    await db.insert(mentorChats).values({
      userId: parseInt(userId),
      message: mentorMessage,
      role: 'assistant',
      mentorPersonality
    });
    
    res.json({
      message: mentorMessage,
      personality: personality.name,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Mentor chat error:', error);
    res.status(500).json({ error: 'Failed to get mentor response' });
  }
});

// GET /api/mentor/chat-history - Get chat history
router.get('/chat-history', async (req: Request, res: Response) => {
  try {
    const { userId, limit = 50 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const chatHistory = await db.select().from(mentorChats)
      .where(eq(mentorChats.userId, parseInt(userId as string)))
      .orderBy(desc(mentorChats.createdAt))
      .limit(parseInt(limit as string));
    
    res.json(chatHistory.reverse());
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// GET /api/mentor/personalities - Get available personalities
router.get('/personalities', (req: Request, res: Response) => {
  const personalities = Object.entries(MENTOR_PERSONALITIES).map(([key, value]) => ({
    id: key,
    name: value.name,
    description: value.description
  }));
  res.json(personalities);
});

// POST /api/emotional-checkin - Record emotional check-in
router.post('/emotional-checkin', async (req: Request, res: Response) => {
  try {
    const { userId, mood, energy, stress, notes } = req.body;
    
    if (!userId || mood === undefined || energy === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const checkIn = await db.insert(emotionalCheckIns).values({
      userId: parseInt(userId),
      date: today as any,
      mood,
      energy,
      stress: stress || null,
      notes: notes || null
    });
    
    res.json({ success: true, checkIn });
  } catch (error) {
    console.error('Emotional check-in error:', error);
    res.status(500).json({ error: 'Failed to save check-in' });
  }
});

// GET /api/emotional-checkin/today - Get today's emotional check-in
router.get('/emotional-checkin/today', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const checkIn = await db.select().from(emotionalCheckIns)
      .where(and(
        eq(emotionalCheckIns.userId, parseInt(userId as string)),
        eq(emotionalCheckIns.date, today as any)
      ))
      .limit(1);
    
    res.json(checkIn.length > 0 ? checkIn[0] : null);
  } catch (error) {
    console.error('Get check-in error:', error);
    res.status(500).json({ error: 'Failed to fetch check-in' });
  }
});

// GET /api/habit-recommendations/today - Get today's recommendations
router.get('/habit-recommendations/today', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    
    const db = await getDb();
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    const today = new Date().toISOString().split('T')[0];
    const recommendations = await db.select().from(habitRecommendations)
      .where(and(
        eq(habitRecommendations.userId, parseInt(userId as string)),
        eq(habitRecommendations.date, today as any)
      ))
      .orderBy(habitRecommendations.rank);
    
    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export default router;
