import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env";

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

    // TODO: Fetch user from database using data.user.id
    // For now, just set user to null - will be implemented when Supabase Auth is fully integrated
    user = null;
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
