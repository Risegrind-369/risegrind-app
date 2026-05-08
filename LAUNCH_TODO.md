# RiseGrind Launch TODO

Items to complete before App Store / Play Store submission.

## Pre-Launch Checklist

### Email Verification
- [ ] Remove developer-only "Skip for now" button from `app/onboarding/verify-email.tsx` (line 156)
  - This button allows skipping email verification during development
  - Must be removed before production release
  - Users must verify email to proceed

### Security & Rate Limiting
- [ ] Add email resend rate limit to `app/onboarding/verify-email.tsx`
  - Current: Users can resend infinitely after 60s cooldown
  - Target: Max 5 resends per email address
  - Prevents abuse and excessive email sending
  - Consider storing resend count in AsyncStorage or tracking via Supabase

### Deep Link Configuration
- [ ] Migrate from auto-generated scheme `manus20260410080735://` to custom domain scheme
  - Current: Ugly auto-generated scheme from bundle ID timestamp
  - Target: `risegrind://` (cleaner, more memorable)
  - Requires: Custom domain configuration in Supabase
  - Update: `app.config.ts`, `app/_layout.tsx`, Supabase Site URL and Redirect URLs

### Web Fallback
- [ ] Add web fallback for email verification links
  - Current: Deep links only work on mobile
  - Target: Desktop users should be able to verify via `https://risegrindapp.com/auth/confirm?token=...`
  - Requires: Web domain and server-side route to handle email confirmation

### Testing Before Launch
- [ ] Test logout flow on real device
- [ ] Test fresh signup with email verification on real device
- [ ] Test login with verified account on real device
- [ ] Test on both iOS and Android
- [ ] Test with real email addresses (not test emails)
- [ ] Verify email links open app correctly on mobile
- [ ] Test resend email button functionality
- [ ] Test edge cases: expired links, invalid tokens, network errors

### Documentation
- [ ] Document email verification flow for support team
- [ ] Document deep link scheme for future developers
- [ ] Add troubleshooting guide for common email verification issues
