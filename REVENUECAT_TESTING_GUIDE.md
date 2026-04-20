# RevenueCat Integration Testing Guide

This guide walks you through testing the RevenueCat integration in RiseGrind. You'll verify that the SDK is properly configured, the purchase flow works, and customers appear in your RevenueCat dashboard.

---

## Part 1: Verify RevenueCat Configuration

### Step 1: Check Environment Variables

The RevenueCat SDK key should be configured:

```bash
echo $EXPO_PUBLIC_RC_SDK_KEY
# Should output: test_fPLEXDsXJkmpdJbobXUsyWlKiSo
```

✅ **Expected:** The SDK key is displayed (test key for sandbox)

---

## Part 2: Test Purchase Flow Through App

### Step 1: Open the App Preview

Go to your app preview in the browser:
```
https://8081-idyf744ru11c9eauyj73h-c8c3243c.us2.manus.computer
```

You should see the **Language Selection Screen** with:
- 🇺🇸 English
- 🇫🇷 Français
- 🇧🇷 Português

### Step 2: Select a Language

Click on **English** (or your preferred language).

**Expected:** You'll be taken to the onboarding flow.

---

### Step 3: Complete Onboarding

Follow these screens:

1. **Welcome Screen** — Click "Get Started"
2. **Name Screen** — Enter your name (e.g., "Test User")
3. **Habits Screen** — Select 3-5 habits (e.g., "Drink water", "Meditate", "Exercise")
4. **Mood Screen** — Select your current mood (1-5 stars)
5. **Streak Screen** — Shows your current streak (will be 0)

**Expected:** Each screen should load smoothly and show localized text.

---

### Step 4: Reach the Paywall Screen

After onboarding, you'll see the **Ghost Mode Premium Screen** with:

```
👻 Ghost Mode
Premium Features Unlocked

✨ Features:
  • AI-Powered Journal
  • Unlimited Habits
  • Advanced Analytics
  • Dark Mode
  • And more...

💰 Pricing:
  [Try 3 Days Free]
  
  Monthly: $4.99/month
  Annual: $39.99/year (Best Value)
```

**Expected:** The paywall displays correctly with pricing options.

---

### Step 5: Simulate a Purchase

Click **"Try 3 Days Free"** button.

**What happens in Demo Mode (Web/Expo Go):**
- Loading spinner appears briefly
- Purchase is simulated
- You're granted premium access
- App navigates to the Home screen

**Expected:** No errors, smooth transition to home screen.

---

### Step 6: Verify Premium Status

Go to the **Profile Tab** (bottom-right).

Look for the **Subscription Section**:

```
👑 Premium Active
Trial: 3 days remaining
Expires: [Date 3 days from now]

[Restore Purchases] [Manage Subscription]
```

**Expected:** Shows premium status with trial countdown.

---

## Part 3: Verify in RevenueCat Dashboard

### Step 1: Open RevenueCat Dashboard

Go to: https://app.revenuecat.com

Log in with your RevenueCat account.

### Step 2: Navigate to Sandbox Customers

1. Click on your **Project** (top-left)
2. Select **Sandbox** (or **Analytics**)
3. Navigate to **Customers**

You should see a section like:

```
Sandbox Customers
Total: X customers

[Search box]
```

### Step 3: Look for Your Test Customer

You should see a customer entry with:

| Field | Value |
|-------|-------|
| **Customer ID** | Auto-generated ID (e.g., `abc123xyz`) |
| **Status** | ACTIVE ✅ |
| **Subscription** | MONTHLY ($4.99) or ANNUAL ($39.99) |
| **Trial** | ACTIVE (3 days remaining) ⏱️ |
| **MRR** | $4.99 (if monthly) |
| **ARR** | $59.88 (if monthly) or $39.99 (if annual) |

**Expected:** Customer appears with active subscription and trial.

---

### Step 4: Click on Customer to View Details

Click on the customer entry to see:

```
Customer Details
├─ Customer ID: [ID]
├─ Email: [email]
├─ Status: ACTIVE
├─ Subscriptions:
│  └─ premium
│     ├─ Status: ACTIVE
│     ├─ Product: monthly
│     ├─ Price: $4.99
│     ├─ Trial: ACTIVE (3 days)
│     ├─ Purchase Date: [Today]
│     └─ Renewal Date: [~30 days from now]
├─ Entitlements:
│  └─ premium: ACTIVE
└─ Events:
   ├─ INITIAL_PURCHASE
   ├─ TRIAL_STARTED
   └─ ...
```

**Expected:** All subscription details are correct and match what you see in the app.

---

## Part 4: Test Multiple Scenarios

### Scenario 1: Test Monthly Subscription

1. Go through onboarding again (select different language or use incognito mode)
2. On paywall, click **"Monthly: $4.99"**
3. Verify in app: Shows "Premium Active"
4. Verify in dashboard: New customer with monthly subscription

### Scenario 2: Test Annual Subscription

1. Go through onboarding again
2. On paywall, click **"Annual: $39.99"**
3. Verify in app: Shows "Premium Active"
4. Verify in dashboard: New customer with annual subscription

### Scenario 3: Test Restore Purchases

1. Complete onboarding and purchase
2. Go to Profile → Subscription section
3. Click **"Restore Purchases"**
4. Verify: Premium status is maintained

---

## Part 5: Verify Revenue Metrics

In RevenueCat Dashboard:

### Check Dashboard Overview

1. Go to **Dashboard** (main view)
2. Look for metrics:
   - **Total Customers:** Should show your test customers
   - **MRR (Monthly Recurring Revenue):** Should show $4.99+ (if monthly purchases)
   - **ARR (Annual Recurring Revenue):** Should show $39.99+ (if annual purchases)
   - **Trial Conversions:** Should show your test purchases

### Check Revenue Charts

1. Go to **Analytics** → **Revenue**
2. You should see:
   - Purchase events
   - Trial starts
   - Revenue trends

---

## Part 6: Troubleshooting

### Issue: Paywall doesn't appear

**Solution:**
- Refresh the app
- Check browser console (F12 → Console)
- Look for errors like "RevenueCat not initialized"

### Issue: Purchase doesn't complete

**Solution:**
- In web/demo mode, purchases are simulated automatically
- Check browser console for errors
- Verify SDK key is correct: `echo $EXPO_PUBLIC_RC_SDK_KEY`

### Issue: Customer doesn't appear in dashboard

**Solution:**
- Refresh the RevenueCat dashboard page
- Wait 30 seconds (data may take time to sync)
- Check that you're in the correct project
- Verify you're viewing "Sandbox" (not "Production")

### Issue: Premium status not showing in app

**Solution:**
- Refresh the app (F5)
- Go to Profile and click "Restore Purchases"
- Check browser console for errors

---

## Part 7: What Success Looks Like

✅ **You'll know RevenueCat is working when:**

1. **App shows premium status** after purchase
2. **Customer appears in RevenueCat dashboard** within 30 seconds
3. **Dashboard shows correct pricing** ($4.99 or $39.99)
4. **Trial countdown** appears in app and dashboard
5. **Revenue metrics** update in dashboard
6. **Multiple test customers** can be created

---

## Part 8: Next Steps for Production

Once testing is complete:

1. **Set up iOS In-App Purchases:**
   - Create products in Apple App Store Connect
   - Link to RevenueCat dashboard

2. **Set up Android In-App Purchases:**
   - Create products in Google Play Console
   - Link to RevenueCat dashboard

3. **Update RevenueCat SDK Key:**
   - Replace test key with production key
   - Update in `app.config.ts` and environment variables

4. **Test with Real Purchases:**
   - Use TestFlight (iOS) or Google Play Beta (Android)
   - Make real test purchases
   - Verify revenue appears in dashboard

5. **Submit to App Stores:**
   - iOS App Store
   - Google Play Store

---

## Quick Reference

| Task | Location |
|------|----------|
| **App Preview** | https://8081-idyf744ru11c9eauyj73h-c8c3243c.us2.manus.computer |
| **RevenueCat Dashboard** | https://app.revenuecat.com |
| **Sandbox Customers** | Dashboard → Sandbox → Customers |
| **SDK Key** | `$EXPO_PUBLIC_RC_SDK_KEY` |
| **Test Key** | `test_fPLEXDsXJkmpdJbobXUsyWlKiSo` |
| **Paywall Location** | After onboarding completion |
| **Premium Status** | Profile Tab → Subscription Section |

---

## Support

- **RevenueCat Docs:** https://docs.revenuecat.com
- **Expo Docs:** https://docs.expo.dev
- **RiseGrind Code:** `/home/ubuntu/risegrind`

---

**Ready to test?** Start with Part 1 and follow each step! 🚀
