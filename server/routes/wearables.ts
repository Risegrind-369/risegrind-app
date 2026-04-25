import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import * as crypto from 'crypto';

const router = Router();

/**
 * Wearable OAuth Routes
 * Handles Apple Watch, Oura Ring, and Whoop authentication
 */

// OAuth Configuration
const OAUTH_CONFIG = {
  apple_watch: {
    clientId: process.env.APPLE_HEALTHKIT_CLIENT_ID || '',
    clientSecret: process.env.APPLE_HEALTHKIT_SECRET || '',
    redirectUri: `${process.env.API_URL || 'http://localhost:3000'}/api/wearables/oauth/callback/apple_watch`,
    authorizationUrl: 'https://appleid.apple.com/auth/authorize',
    tokenUrl: 'https://appleid.apple.com/auth/token',
  },
  oura_ring: {
    clientId: process.env.OURA_CLIENT_ID || '',
    clientSecret: process.env.OURA_CLIENT_SECRET || '',
    redirectUri: `${process.env.API_URL || 'http://localhost:3000'}/api/wearables/oauth/callback/oura_ring`,
    authorizationUrl: 'https://cloud.ouraring.com/oauth/authorize',
    tokenUrl: 'https://cloud.ouraring.com/oauth/token',
  },
  whoop: {
    clientId: process.env.WHOOP_CLIENT_ID || '',
    clientSecret: process.env.WHOOP_CLIENT_SECRET || '',
    redirectUri: `${process.env.API_URL || 'http://localhost:3000'}/api/wearables/oauth/callback/whoop`,
    authorizationUrl: 'https://api.prod.whoop.com/oauth/authorize',
    tokenUrl: 'https://api.prod.whoop.com/oauth/token',
  },
};

/**
 * Encrypt sensitive data
 */
function encryptToken(token: string): string {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 */
function decryptToken(encryptedToken: string): string {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate OAuth state for CSRF protection
 */
function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * POST /api/wearables/oauth/authorize/:device
 * Start OAuth flow for wearable device
 */
router.post('/oauth/authorize/:device', async (req: Request, res: Response) => {
  try {
    const { device } = req.params;
    const { userId } = req.body;

    if (!['apple_watch', 'oura_ring', 'whoop'].includes(device)) {
      return res.status(400).json({ error: 'Invalid device type' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const config = OAUTH_CONFIG[device as keyof typeof OAUTH_CONFIG];
    const state = generateState();

    // Store state in session/cache for validation (TODO: implement session storage)
    // For now, we'll return the authorization URL

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: getOAuthScopes(device),
      state,
    });

    const authUrl = `${config.authorizationUrl}?${params.toString()}`;

    res.json({
      authUrl,
      state,
      device,
    });
  } catch (error: any) {
    console.error('OAuth authorize error:', error);
    res.status(500).json({ error: 'Failed to start OAuth flow' });
  }
});

/**
 * POST /api/wearables/oauth/callback/:device
 * Handle OAuth callback from wearable service
 */
router.post('/oauth/callback/:device', async (req: Request, res: Response) => {
  try {
    const { device } = req.params;
    const { code, state, userId } = req.body;

    if (!code || !state || !userId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const config = OAUTH_CONFIG[device as keyof typeof OAUTH_CONFIG];

    // TODO: Validate state against stored state

    // Exchange authorization code for access token
    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();
    const db = await getDb();

    // Encrypt tokens before storing
    const encryptedAccessToken = encryptToken(tokenData.access_token);
    const encryptedRefreshToken = tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null;

    // Store wearable connection
    // TODO: Implement database schema for wearable_connections table
    // For now, we'll just return success
    const connection = {
      id: crypto.randomUUID(),
      userId,
      deviceType: device,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
      expiresAt: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000),
      lastSync: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    res.json({
      success: true,
      connection: {
        id: connection.id,
        deviceType: device,
        isActive: true,
        expiresAt: connection.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Failed to complete OAuth flow' });
  }
});

/**
 * GET /api/wearables/list
 * List connected wearables for user
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // TODO: Query wearable_connections table
    const connections = [
      {
        id: 'conn-1',
        deviceType: 'apple_watch',
        isActive: true,
        lastSync: new Date(Date.now() - 3600000),
        expiresAt: new Date(Date.now() + 86400000),
      },
    ];

    res.json({ connections });
  } catch (error: any) {
    console.error('List wearables error:', error);
    res.status(500).json({ error: 'Failed to list wearables' });
  }
});

/**
 * DELETE /api/wearables/:id/disconnect
 * Disconnect wearable device
 */
router.delete('/:id/disconnect', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // TODO: Delete from wearable_connections table

    res.json({ success: true, message: 'Wearable disconnected' });
  } catch (error: any) {
    console.error('Disconnect wearable error:', error);
    res.status(500).json({ error: 'Failed to disconnect wearable' });
  }
});

/**
 * POST /api/wearables/:id/sync
 * Trigger manual sync for wearable device
 */
router.post('/:id/sync', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // TODO: Implement sync logic for each device type
    // This would:
    // 1. Retrieve stored access token
    // 2. Fetch data from wearable API
    // 3. Transform and store in health_data table
    // 4. Generate insights based on new data

    res.json({
      success: true,
      message: 'Sync started',
      syncId: crypto.randomUUID(),
    });
  } catch (error: any) {
    console.error('Sync wearable error:', error);
    res.status(500).json({ error: 'Failed to sync wearable' });
  }
});

/**
 * POST /api/wearables/:id/refresh-token
 * Refresh OAuth token before expiration
 */
router.post('/:id/refresh-token', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { deviceType, refreshToken } = req.body;

    if (!['apple_watch', 'oura_ring', 'whoop'].includes(deviceType)) {
      return res.status(400).json({ error: 'Invalid device type' });
    }

    const config = OAUTH_CONFIG[deviceType as keyof typeof OAUTH_CONFIG];
    const decryptedRefreshToken = decryptToken(refreshToken);

    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: decryptedRefreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokenData = await tokenResponse.json();
    const encryptedAccessToken = encryptToken(tokenData.access_token);

    // TODO: Update wearable_connections table with new token

    res.json({
      success: true,
      accessToken: encryptedAccessToken,
      expiresAt: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000),
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * Helper: Get OAuth scopes for device
 */
function getOAuthScopes(device: string): string {
  const scopes: Record<string, string> = {
    apple_watch: 'health:read',
    oura_ring: 'personal:read',
    whoop: 'read:cycles',
  };
  return scopes[device] || '';
}

export default router;
