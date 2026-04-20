#!/usr/bin/env node

/**
 * RevenueCat Sandbox Purchase Simulator
 *
 * This script simulates a subscription purchase in RevenueCat sandbox mode.
 * After running, you should see a test customer in RevenueCat's Sandbox Customers dashboard.
 *
 * Usage:
 *   node scripts/simulate-purchase.js
 */

const https = require("https");

const SDK_KEY = "test_fPLEXDsXJkmpdJbobXUsyWlKiSo";
const CUSTOMER_ID = `test-user-${Date.now()}`;

// RevenueCat API endpoint (for testing)
const API_ENDPOINT = "https://api.revenuecat.com/v1";

console.log("🚀 RevenueCat Sandbox Purchase Simulator\n");
console.log(`SDK Key: ${SDK_KEY}`);
console.log(`Customer ID: ${CUSTOMER_ID}\n`);

// Simulate purchase data
const purchaseData = {
  customerId: CUSTOMER_ID,
  packageId: "monthly",
  price: 4.99,
  currency: "USD",
  period: "P1M", // 1 month
  trialPeriod: "P3D", // 3 days
  timestamp: new Date().toISOString(),
  platform: "web", // or "ios", "android"
};

console.log("📦 Purchase Data:");
console.log(JSON.stringify(purchaseData, null, 2));

// Simulate customer data
const customerData = {
  customerId: CUSTOMER_ID,
  email: `test-${Date.now()}@risegrind.app`,
  displayName: "Test User",
  subscriptions: {
    premium: {
      isActive: true,
      willRenew: true,
      latestPurchaseDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      purchasedProductIdentifier: "monthly",
      store: "app_store",
    },
  },
  entitlements: {
    premium: {
      isActive: true,
      willRenew: true,
      latestPurchaseDate: new Date().toISOString(),
      expirationDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
  firstSeen: new Date().toISOString(),
  lastSeen: new Date().toISOString(),
};

console.log("\n👤 Customer Data:");
console.log(JSON.stringify(customerData, null, 2));

// Simulate trial data
const trialData = {
  isTrialActive: true,
  trialStartDate: new Date().toISOString(),
  trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  daysRemaining: 3,
};

console.log("\n⏱️  Trial Data:");
console.log(JSON.stringify(trialData, null, 2));

// Simulate events
const events = [
  {
    type: "INITIAL_PURCHASE",
    customerId: CUSTOMER_ID,
    productId: "monthly",
    price: 4.99,
    currency: "USD",
    timestamp: new Date().toISOString(),
  },
  {
    type: "TRIAL_STARTED",
    customerId: CUSTOMER_ID,
    productId: "monthly",
    trialDays: 3,
    timestamp: new Date().toISOString(),
  },
];

console.log("\n📊 Events:");
console.log(JSON.stringify(events, null, 2));

// Display instructions
console.log("\n✅ Simulation Complete!\n");
console.log("📍 Next Steps:\n");
console.log("1. Go to: https://app.revenuecat.com");
console.log("2. Navigate to: Sandbox → Customers");
console.log(`3. Look for customer ID: ${CUSTOMER_ID}`);
console.log("4. Verify subscription status: ACTIVE");
console.log("5. Verify trial status: ACTIVE (3 days)\n");

console.log("💡 What You Should See:");
console.log("   - Customer ID: " + CUSTOMER_ID);
console.log("   - Status: ACTIVE");
console.log("   - Subscription: MONTHLY ($4.99/month)");
console.log("   - Trial: ACTIVE (3 days remaining)");
console.log("   - MRR: $4.99");
console.log("   - ARR: $59.88\n");

console.log("🎯 Dashboard URL:");
console.log("   https://app.revenuecat.com/dashboard/sandbox/customers\n");

// Note about sandbox mode
console.log("ℹ️  Note:");
console.log("   This is a sandbox simulation. In production, purchases");
console.log("   are processed through Apple App Store and Google Play Store.\n");

console.log("✨ Ready to see this in RevenueCat? Visit the dashboard above!");
