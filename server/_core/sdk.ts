// REMOVED for v1.0: Manus OAuth replaced with Supabase Auth
// This file is kept for reference but all functionality is disabled.

export class OAuthService {
  constructor(private client: any) {
    console.log("[Auth] Using Supabase Auth instead of Manus OAuth");
  }

  async getTokenByCode(code: string, state: string): Promise<any> {
    throw new Error("Manus OAuth is not available. Use Supabase Auth instead.");
  }

  async getUserInfo(token: string): Promise<any> {
    throw new Error("Manus OAuth is not available. Use Supabase Auth instead.");
  }
}

export const oauthService = new OAuthService(null);
