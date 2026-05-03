import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '../db';
import { mentorChats, emotionalCheckIns, habitRecommendations } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();
const client = new Anthropic();

// Mentor personality templates
const MENTOR_PERSONALITIES = {
  supportive: {
    name: 'Supportive Coach',
    description: 'Encouraging, empathetic, celebrates progress',
    systemPrompt: `You are a supportive habit coach mentor. Your role is to:
- Celebrate every win, no matter how small
- Show genuine empathy and understanding
- Encourage users when they struggle
- Ask thoughtful questions about their feelings and motivations
- Provide gentle guidance without judgment
- Use warm, friendly language
Keep responses concise (2-3 sentences max) and personal.`
  },
  challenging: {
    name: 'Challenging Coach',
    description: 'Direct, pushes boundaries, accountability-focused',
    systemPrompt: `You are a direct habit coach mentor. Your role is to:
- Hold users accountable to their commitments
- Challenge excuses with respect
- Push them to go beyond their comfort zone
- Ask tough questions that drive reflection
- Celebrate effort and consistency
- Use direct, honest language
Keep responses concise (2-3 sentences max) and action-oriented.`
  },
  scientific: {
    name: 'Scientific Coach',
    description: 'Data-driven, research-based, educational',
    systemPrompt: `You are a scientific habit coach mentor. Your role is to:
- Explain the neuroscience behind habit formation
- Reference research and evidence-based strategies
- Provide data-driven insights
- Ask analytical questions
- Educate about habit loops and triggers
- Use clear, educational language
Keep responses concise (2-3 sentences max) and informative.`
  },
  friendly: {
    name: 'Friendly Companion',
    description: 'Conversational, relatable, supportive friend',
    systemPrompt: `You are a friendly habit companion mentor. Your role is to:
- Be like a supportive friend who gets it
- Share in their journey with genuine interest
- Ask about their day and feelings
- Celebrate wins together
- Offer practical, relatable advice
- Use conversational, casual language
Keep responses concise (2-3 sentences max) and warm.`
  }
};

// POST /api/mentor/chat - Send message to mentor
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { userId, message, mentorPersonality = 'supportive' } = req.body;

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
    const conversationHistory = chatHistory.reverse().map((chat) => ({
      role: chat.role as 'user' | 'assistant',
      content: chat.message
    }));

    // Add current user message
    conversationHistory.push({
      role: 'user',
      content: message
    });

    // Get mentor response from Claude
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      system: personality.systemPrompt,
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
