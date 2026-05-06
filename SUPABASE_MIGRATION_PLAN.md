# RiseGrind: Manus OAuth → Supabase Auth Migration Plan

**Document Version:** 1.0  
**Date:** May 6, 2026  
**Status:** Pre-Implementation (Awaiting User Approval)

---

## Executive Summary

This document provides a **concrete, file-by-file migration plan** to replace Manus OAuth with Supabase Auth. The migration is necessary to reduce vendor lock-in and ensure your user accounts remain portable if you need to migrate hosting in the future.

**Key Facts:**
- **Timeline:** 3–4 weeks (broken into 5 milestones)
- **Risk Level:** Medium (data loss risk exists; mitigated by backup strategy)
- **Complexity:** High (affects authentication layer, database, backend)
- **Reversibility:** Low (migration is one-way; rollback requires restoring from backups)

---

## Part 1: What Stays on Manus vs. What Moves to Supabase

### Architecture After Migration

| Component | Current (Manus) | After Migration | Rationale |
|-----------|-----------------|-----------------|-----------|
| **User Authentication** | Manus OAuth | Supabase Auth (email/password + Apple Sign-In) | Portable, industry-standard |
| **User Database** | Manus MySQL | Supabase PostgreSQL | Supabase Auth integrates natively with Postgres |
| **Session Management** | Manus tokens (SecureStore) | Supabase JWT tokens (SecureStore) | Native Supabase support |
| **LLM Features** | Manus-provided Claude | **Still works** (via Manus backend) | LLM is separate from auth layer |
| **Backend Server** | Manus Node.js | **Stays on Manus** (for now) | Can migrate later; not blocking |
| **tRPC API** | Manus-hosted | **Stays on Manus** | Can migrate later; not blocking |
| **File Storage (S3)** | Manus-managed | **Stays on Manus** | Can migrate later; not blocking |
| **Payments (RevenueCat)** | RevenueCat | **Unchanged** | No changes needed |

### Key Insight: Phased Migration

This migration is **auth-only**. You're not migrating the entire backend to Supabase—just the authentication layer. This reduces risk and complexity.

**After this migration:**
- ✅ User accounts are portable (can move to any backend)
- ✅ LLM features continue to work
- ✅ Payments continue to work
- ✅ Backend can be migrated independently later

---

## Part 2: LLM Features After Auth Migration

### Will Manus-provided Claude still work?

**Answer: YES, with a caveat.**

**How it works currently:**
1. Frontend calls tRPC endpoint (e.g., `onboarding.generateRoutine`)
2. Backend (Manus-hosted) invokes `invokeLLM()` (Manus-provided Claude)
3. Response returned to frontend

**After Supabase Auth migration:**
1. Frontend authenticates with Supabase (not Manus)
2. Frontend calls tRPC endpoint (still Manus-hosted backend)
3. Backend invokes `invokeLLM()` (still works)
4. Response returned to frontend

**The key:** LLM features don't depend on the auth provider. They depend on the backend being Manus-hosted.

**If you later migrate backend to your own server:**
- ❌ Manus-provided Claude will stop working
- ✅ You'll need to integrate OpenAI or Anthropic API (costs $0.50–3 per user/month)

**Recommendation:** Keep backend on Manus for now. Migrate LLM to OpenAI/Anthropic only if you move backend later.

---

## Part 3: Risk Assessment & Data Loss Mitigation

### Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| **Data loss during migration** | Medium | Critical | Backup strategy (see below) |
| **User lockout (auth broken)** | Medium | Critical | Parallel testing before cutover |
| **Session token incompatibility** | Low | High | JWT token format testing |
| **LLM features break** | Low | Medium | Integration testing |
| **Rollback needed mid-migration** | Low | Critical | Backup restore procedure |

### Data Loss Mitigation Strategy

**Before migration starts:**

1. **Full database backup** (Manus MySQL)
   ```bash
   # Export entire database
   mysqldump -u user -p risegrind > backup_pre_migration.sql
   ```
   - Store locally + cloud (AWS S3, Google Drive)
   - Verify backup integrity (test restore)

2. **User data export** (all users' habits, journal entries, streaks)
   - Export as JSON from Manus database
   - Store in version control (Git)
   - Timestamp: `backup_2026_05_06.json`

3. **Supabase backup before cutover**
   - Enable automatic daily backups in Supabase
   - Verify backup retention (minimum 7 days)

**During migration:**

4. **Parallel testing environment**
   - Set up staging Supabase project (separate from production)
   - Migrate test users first
   - Verify all features work before production cutover

5. **Gradual user migration**
   - Migrate 10% of users first (test group)
   - Monitor for errors (Sentry)
   - Migrate remaining 90% after 48 hours of stability

**If rollback needed:**

6. **Restore from backup**
   - Restore Manus MySQL from pre-migration backup
   - Revert frontend code to Manus OAuth version
   - Notify affected users

**Estimated data loss risk:** 2–5% (if backup/restore fails)

---

## Part 4: Migration Timeline & Milestones

### Milestone 1: Setup & Planning (Week 1, Days 1–2)

**Objective:** Set up Supabase project, create test environment, document current auth flow.

**Tasks:**
- [ ] Create Supabase project (free tier OK for testing)
- [ ] Create PostgreSQL database in Supabase
- [ ] Enable Supabase Auth (email/password + Apple Sign-In)
- [ ] Document current Manus OAuth flow (diagram)
- [ ] Create staging environment (separate Supabase project)
- [ ] Full backup of Manus MySQL database
- [ ] Commit backup to version control

**Deliverable:** Supabase project ready, backups verified, current auth flow documented.

**Effort:** 4–6 hours

---

### Milestone 2: Frontend Auth Layer Rewrite (Week 1–2, Days 3–7)

**Objective:** Replace Manus OAuth with Supabase Auth in frontend code.

**Files to modify:**

1. **`hooks/use-auth.ts`** (CRITICAL)
   - Replace `useAuth()` hook to use Supabase
   - New implementation:
     ```typescript
     import { useEffect, useState } from 'react';
     import { supabase } from '@/lib/supabase';
     
     export function useAuth() {
       const [user, setUser] = useState(null);
       const [isAuthenticated, setIsAuthenticated] = useState(false);
       const [loading, setLoading] = useState(true);
     
       useEffect(() => {
         supabase.auth.onAuthStateChange((event, session) => {
           setUser(session?.user ?? null);
           setIsAuthenticated(!!session);
           setLoading(false);
         });
       }, []);
     
       const logout = async () => {
         await supabase.auth.signOut();
       };
     
       return { user, isAuthenticated, loading, logout };
     }
     ```

2. **`lib/supabase.ts`** (NEW FILE)
   - Create Supabase client
   - Configure auth session storage (SecureStore for native, localStorage for web)
   - Example:
     ```typescript
     import { createClient } from '@supabase/supabase-js';
     import * as SecureStore from 'expo-secure-store';
     
     const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
     const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
     
     export const supabase = createClient(supabaseUrl, supabaseKey, {
       auth: {
         storage: SecureStore,
         autoRefreshToken: true,
         persistSession: true,
       },
     });
     ```

3. **`app/auth/login.tsx`** (NEW FILE)
   - Email/password login form
   - "Sign in with Apple" button
   - Password reset link

4. **`app/auth/signup.tsx`** (NEW FILE)
   - Email/password signup form
   - Terms acceptance checkbox
   - Email verification flow

5. **`app/auth/reset-password.tsx`** (NEW FILE)
   - Password reset email form
   - New password entry form

6. **`app/_layout.tsx`** (MODIFY)
   - Replace Manus OAuth callback with Supabase callback
   - Update auth state management

**Deliverable:** Frontend auth layer fully replaced, login/signup/reset flows working.

**Effort:** 16–20 hours

---

### Milestone 3: Backend Auth Integration (Week 2–3, Days 8–14)

**Objective:** Update backend to validate Supabase JWT tokens instead of Manus tokens.

**Files to modify:**

1. **`server/_core/auth.ts`** (CRITICAL)
   - Replace Manus token validation with Supabase JWT verification
   - New implementation:
     ```typescript
     import { jwtVerify } from 'jose';
     
     const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);
     
     export async function verifySupabaseToken(token: string) {
       try {
         const verified = await jwtVerify(token, secret);
         return verified.payload;
       } catch (e) {
         throw new Error('Invalid token');
       }
     }
     ```

2. **`server/_core/trpc.ts`** (MODIFY)
   - Update `protectedProcedure` to validate Supabase tokens
   - Extract user ID from JWT payload

3. **`server/routers.ts`** (MODIFY)
   - Update protected procedures to work with Supabase user IDs
   - Ensure `ctx.user.id` maps to Supabase user ID

4. **`drizzle/schema.ts`** (MODIFY)
   - Update `users` table:
     - Remove `openId` field (Manus-specific)
     - Add `supabaseId` field (Supabase user ID)
     - Keep `email`, `name`, `role`, `createdAt`, `updatedAt`
   - Example:
     ```typescript
     export const users = mysqlTable("users", {
       id: int("id").autoincrement().primaryKey(),
       supabaseId: varchar("supabaseId", { length: 64 }).notNull().unique(),
       email: varchar("email", { length: 320 }).notNull(),
       name: text("name"),
       role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
       createdAt: timestamp("createdAt").defaultNow().notNull(),
       updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
     });
     ```

5. **`server/db.ts`** (MODIFY)
   - Update user lookup to use `supabaseId` instead of `openId`
   - Add function to create user from Supabase signup:
     ```typescript
     export async function createUserFromSupabase(supabaseId: string, email: string, name?: string) {
       const db = await getDb();
       const result = await db.insert(users).values({
         supabaseId,
         email,
         name,
       });
       return result.insertId;
     }
     ```

**Deliverable:** Backend validates Supabase tokens, user lookup works with new schema.

**Effort:** 12–16 hours

---

### Milestone 4: Database Migration (Week 3, Days 15–18)

**Objective:** Migrate user data from Manus MySQL to Supabase PostgreSQL.

**Tasks:**

1. **Export Manus data**
   - Export users table (with habits, completions, journal entries)
   - Export as JSON or CSV

2. **Create Supabase schema**
   - Recreate all tables in Supabase PostgreSQL
   - Ensure schema matches Manus (with `supabaseId` field)

3. **Transform and load data**
   - Map Manus `openId` → Supabase user ID
   - Insert users, habits, completions, journal entries
   - Verify data integrity (row counts, sample records)

4. **Test data migration**
   - Staging environment only
   - Verify all user data is present
   - Check for data loss or corruption

**Deliverable:** User data successfully migrated to Supabase, verified in staging.

**Effort:** 8–12 hours

---

### Milestone 5: Testing & Production Cutover (Week 4, Days 19–28)

**Objective:** Comprehensive testing, then gradual production cutover.

**Testing phase (Days 19–21):**

1. **Staging environment testing**
   - [ ] Login with email/password
   - [ ] Login with Apple Sign-In
   - [ ] Password reset flow
   - [ ] Verify user data loads correctly
   - [ ] Test all tRPC endpoints (habits, journal, etc.)
   - [ ] Test LLM features (onboarding, mentor chat)
   - [ ] Test RevenueCat integration
   - [ ] Monitor Sentry for errors

2. **Load testing**
   - Simulate 100 concurrent users
   - Verify token refresh works
   - Check database performance

**Production cutover (Days 22–28):**

3. **Gradual migration**
   - **Day 22:** Deploy new code to production (Manus OAuth still active)
   - **Day 23:** Migrate 10% of users to Supabase (test group)
   - **Day 24:** Monitor for 24 hours, check Sentry
   - **Day 25:** Migrate 50% of users
   - **Day 26:** Monitor for 24 hours
   - **Day 27:** Migrate remaining 40% of users
   - **Day 28:** Verify all users migrated, disable Manus OAuth

4. **Rollback plan**
   - If errors detected, revert to Manus OAuth backup
   - Restore database from pre-migration backup
   - Notify affected users

**Deliverable:** All users successfully migrated to Supabase Auth, zero data loss, all features working.

**Effort:** 16–20 hours

---

## Part 5: Detailed File-by-File Changes

### New Files to Create

```
lib/
  supabase.ts                    ← Supabase client initialization
  supabase-auth.ts               ← Auth helper functions

app/auth/
  _layout.tsx                    ← Auth stack layout
  login.tsx                      ← Email/password login
  signup.tsx                     ← Email/password signup
  reset-password.tsx             ← Password reset flow
  verify-email.tsx               ← Email verification (if needed)

server/
  routes/auth.ts                 ← Supabase auth endpoints
  migrations/
    001_add_supabase_id.sql      ← Database migration script
```

### Files to Modify

| File | Changes | Complexity |
|------|---------|-----------|
| `hooks/use-auth.ts` | Replace Manus OAuth logic with Supabase | High |
| `server/_core/auth.ts` | Replace token validation | High |
| `server/_core/trpc.ts` | Update protected procedure | Medium |
| `server/routers.ts` | Update user context | Medium |
| `drizzle/schema.ts` | Add `supabaseId`, remove `openId` | Medium |
| `server/db.ts` | Update user queries | Medium |
| `app/_layout.tsx` | Update auth state, remove Manus OAuth callback | Medium |
| `app.config.ts` | Add Supabase environment variables | Low |
| `.env.example` | Document Supabase env vars | Low |

### Files to Delete

- `app/oauth/callback.tsx` (Manus OAuth callback—no longer needed)

---

## Part 6: Environment Variables Required

### New Supabase Environment Variables

Add to `.env` and `app.config.ts`:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase-dashboard
```

**How to get these:**
1. Create Supabase project at supabase.com
2. Go to Project Settings → API
3. Copy `URL` and `anon` key
4. Go to Project Settings → Auth → JWT Secret
5. Copy JWT secret

---

## Part 7: Rollback Procedure

If migration fails and you need to rollback:

**Step 1: Restore database**
```bash
mysql -u user -p risegrind < backup_pre_migration.sql
```

**Step 2: Revert frontend code**
```bash
git checkout main~1  # Go back to Manus OAuth version
```

**Step 3: Redeploy**
```bash
pnpm build && pnpm deploy
```

**Step 4: Notify users**
- Email: "We experienced a technical issue. Your account is safe. Please log in again."

**Estimated rollback time:** 2–4 hours

---

## Part 8: Cost Implications

### Supabase Pricing

| Tier | Cost | Limits | Recommendation |
|------|------|--------|-----------------|
| **Free** | $0 | 500K API calls/month, 1GB storage | Testing only |
| **Pro** | $25/month | 10M API calls/month, 8GB storage | Recommended for launch |
| **Team** | $599/month | 100M API calls/month, 100GB storage | Scale later |

**For 10K users:** Expect $25–100/month (Pro tier sufficient)

### Comparison: Manus vs. Supabase

| Cost | Manus | Supabase |
|------|-------|----------|
| **Auth** | Included | $25/month (Pro) |
| **Database** | Included | $25/month (Pro) |
| **LLM** | Included | $0 (use OpenAI later) |
| **Total** | Manus subscription | $50/month (auth + DB) |

**Verdict:** Supabase is cheaper if you migrate LLM to OpenAI later.

---

## Part 9: Success Criteria

### Migration is successful when:

- ✅ All users can login with email/password
- ✅ All users can login with Apple Sign-In
- ✅ Password reset flow works
- ✅ All user data (habits, journal, streaks) loads correctly
- ✅ LLM features (onboarding, mentor) still work
- ✅ RevenueCat integration still works
- ✅ Zero data loss (all user records migrated)
- ✅ Sentry shows no auth-related errors
- ✅ App Store submission succeeds with Supabase auth

---

## Part 10: Decision Tree

### Should you migrate to Supabase before launch?

**Migrate NOW if:**
- ✅ You want portable user accounts
- ✅ You plan to migrate backend later
- ✅ You want industry-standard auth (Firebase/Supabase)
- ✅ You're willing to spend 3–4 weeks on this

**Launch with Manus OAuth if:**
- ✅ You want to launch ASAP (save 3–4 weeks)
- ✅ You're OK with vendor lock-in (for now)
- ✅ You can add explicit data warnings to Privacy Policy
- ✅ You plan to migrate auth after launch (when user base is larger)

**Recommended:** Migrate to Supabase before launch. The 3–4 week investment now saves you from a painful migration with thousands of users later.

---

## References & Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase + React Native](https://supabase.com/docs/guides/auth/auth-helpers/react-native)
- [Apple Sign-In with Supabase](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [JWT Verification in Node.js](https://github.com/panva/jose)
- [Expo SecureStore for Token Storage](https://docs.expo.dev/modules/expo-secure-store/)

---

## Questions & Next Steps

**Before you decide:**

1. Review this plan with your technical team
2. Decide: Migrate now (Option A) or launch with Manus OAuth (Option B)?
3. If Option A: Confirm you want me to start Milestone 1
4. If Option B: I'll implement App Store blockers only

**Once you decide, reply with:**
- "Proceed with Supabase migration" → I start Milestone 1
- "Launch with Manus OAuth + data warnings" → I implement App Store blockers only

---

**Document prepared by:** Manus AI  
**Last updated:** May 6, 2026  
**Status:** Ready for review and decision
