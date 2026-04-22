# RiseGrind Onboarding → Paywall Flow Testing Prompt

## Complete User Journey Test

### Step 1: Start the App
- Open: https://8081-iq9h0zxzkjbvvdna5g4z5-75f3e8d3.us1.manus.computer
- You should see the **Language Selection Screen** with:
  - 👻 RiseGrind logo (glowing orange)
  - "Choose Your Language" title
  - Three language options: English (🇺🇸), Français (🇫🇷), Português (🇧🇷)
  - Orange "Continue" button

### Step 2: Select Language
- Click on **English (US)** (or your preferred language)
- The button should show a checkmark ✓
- Click **Continue**

### Step 3: Welcome Screen
- You should see the **Welcome Screen** with:
  - "Welcome to Ghost Mode" title
  - Description of the app
  - "Next" button (orange)
- Click **Next**

### Step 4: Onboarding Screens (3 pages)
Complete the onboarding by filling in:

**Page 1: Your Name**
- Enter your name (e.g., "John")
- Click **Next**

**Page 2: Select Habits**
- Choose 3-5 habits you want to track
- Click **Next**

**Page 3: Daily Mood Check-in**
- Select your current mood (1-5 emoji scale)
- Click **Next**

### Step 5: Trial Reveal Screen ⭐ (CRITICAL)
You should now see the **Trial Reveal Screen** with:
- 🎁 Gift emoji icon
- "Free Trial Unlocked" title
- "3 Days of Full Access" subtitle
- Orange card showing "3" days
- List of trial features:
  - 📋 Unlimited habits & tracking
  - 📝 AI-powered journal analysis
  - 🎤 Voice-to-text entries
  - ⚡ Exclusive side quests
  - 📊 Advanced analytics & insights
  - 👥 Ghost Crew community access
- Orange **"View Plans"** button
- Fine print: "Cancel anytime. No credit card required."

**Click "View Plans"** → Should navigate to Paywall

### Step 6: Paywall Screen ⭐ (CRITICAL)
You should now see the **Paywall Screen** with:
- 👻 RiseGrind logo
- "Ghost Mode Premium" title
- Two pricing options:
  - **Monthly**: $4.99/month (or actual price)
  - **Yearly**: $39.99/year (or actual price) - marked as "Best Value"
- Feature list with checkmarks
- Orange **"Start 3-Day Free Trial"** button
- Or select a plan and tap purchase button

### Step 7: Purchase/Trial Start
- Click **"Start 3-Day Free Trial"** button
- Should show loading spinner briefly
- Should navigate to **Home Screen** (main app)

### Step 8: Verify Premium Status
- Go to **Profile** tab (bottom navigation)
- Look for **Subscription** section
- Should show: 👑 **"Premium Active"** with trial end date
- Should show **"Restore Purchases"** button

---

## Expected Behavior Checklist

✅ Language selection is locked after onboarding (no toggle in Settings)
✅ Trial reveal screen shows all 6 features
✅ "View Plans" button navigates to paywall
✅ Paywall shows both monthly and yearly options
✅ Purchase/trial button works and navigates to home
✅ Profile shows premium status with trial countdown
✅ All text is properly translated in your selected language
✅ Orange accent colors (#FF6200) are visible in Light and Dark modes
✅ All buttons have proper contrast and are clickable

---

## RevenueCat Verification

After completing the flow:

1. Go to: https://app.revenuecat.com
2. Navigate to: **Sandbox → Customers**
3. You should see a new customer with:
   - Active subscription (MONTHLY or ANNUAL)
   - Trial status: ACTIVE (3 days)
   - Purchase date: Today
   - MRR/ARR calculated

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Trial reveal screen doesn't appear | Check that onboarding completes successfully |
| Paywall doesn't load | Check browser console (F12) for errors |
| "View Plans" button doesn't work | Verify navigation path is correct |
| No customer in RevenueCat | Check SDK key is configured (should be `test_fPLE...`) |
| Purchase fails | Try in demo mode (web/Expo Go) first |

---

## Notes

- **Web/Expo Go**: Purchases are simulated in demo mode
- **iOS/Android**: Real purchases will go through App Store/Google Play
- **Test Key**: Using `test_fPLEXDsXJkmpdJbobXUsyWlKiSo` (sandbox mode)
- **Trial Duration**: 3 days (configurable in RevenueCat dashboard)

---

## Success Criteria

✅ Complete onboarding without errors
✅ See trial reveal screen with all features
✅ Navigate to paywall successfully
✅ Start trial or purchase plan
✅ See premium status in Profile
✅ Customer appears in RevenueCat dashboard

**Report back with results!** 🚀
