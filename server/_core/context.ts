import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// Supabase client for auth verification
const supabase = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey);

export async function createContext(opts: CreateExpressContextOptions): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Get the authorization header
    const authHeader = opts.req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      user = null;
      return { req: opts.req, res: opts.res, user };
    }

    const token = authHeader.substring(7);

    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      user = null;
      return { req: opts.req, res: opts.res, user };
    }

    // Lazy user creation: Try to find user by supabase_user_id, create if not found
    const supabaseUserId = data.user.id;
    const userEmail = data.user.email;

    const db = await getDb();
    if (db) {
      try {
        // Try to find existing user
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.supabase_user_id, supabaseUserId))
          .limit(1);

        if (existingUser.length > 0) {
          // User exists, use it
          user = existingUser[0];
        } else {
          // User doesn't exist, create a new row (lazy creation)
          console.log(`[Auth] Creating new user row for Supabase user ${supabaseUserId}`);
          const result = await db
            .insert(users)
            .values({
              openId: `supabase_${supabaseUserId}`, // Generate unique openId
              email: userEmail || undefined,
              supabase_user_id: supabaseUserId,
              loginMethod: "supabase",
              role: "user",
              lastSignedIn: new Date(),
            })
            .execute();

          // Fetch the newly created user
          const newUser = await db
            .select()
            .from(users)
            .where(eq(users.supabase_user_id, supabaseUserId))
            .limit(1);

          if (newUser.length > 0) {
            user = newUser[0];
            console.log(`[Auth] New user created: ${user.id}`);
          } else {
            console.warn(`[Auth] Failed to create or retrieve user for ${supabaseUserId}`);
            user = null;
          }
        }
      } catch (dbError) {
        console.error(`[Auth] Database error during lazy user creation:`, dbError);
        user = null;
      }
    } else {
      console.warn("[Auth] Database not available for user lookup");
      user = null;
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
