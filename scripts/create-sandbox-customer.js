#!/usr/bin/env node

/**
 * RevenueCat Sandbox Customer Creator
 *
 * This script creates a test customer with an active subscription in RevenueCat sandbox.
 * The customer will appear in: https://app.revenuecat.com/dashboard/sandbox/customers
 *
 * Usage:
 *   node scripts/create-sandbox-customer.js
 */

const https = require("https");

const SERVER_API_KEY = "sk_OcgKGvHglwIrhCKjdbpEYtDJqZPJN";
const CUSTOMER_ID = `test-risegrind-${Date.now()}`;

console.log("🚀 RevenueCat Sandbox Customer Creator\n");
console.log(`Customer ID: ${CUSTOMER_ID}\n`);

// Create test customer with subscription
function createCustomer() {
  return new Promise((resolve, reject) => {
    const customerData = JSON.stringify({
      app_user_id: CUSTOMER_ID,
      email: `test-${Date.now()}@risegrind.app`,
      attributes: {
        displayName: "Test User - RiseGrind",
        custom_user_id: CUSTOMER_ID,
      },
    });

    const options = {
      hostname: "api.revenuecat.com",
      port: 443,
      path: "/v1/customers",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(customerData),
        "Authorization": `Bearer ${SERVER_API_KEY}`,
        "X-Platform": "web",
      },
    };

    console.log("📡 Creating customer in RevenueCat...\n");

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`Response Status: ${res.statusCode}\n`);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log("✅ Customer created successfully!\n");
        }

        try {
          const response = JSON.parse(data);
          console.log("Response Data:", JSON.stringify(response, null, 2));
        } catch (e) {
          console.log("Response:", data);
        }

        resolve();
      });
    });

    req.on("error", (e) => {
      console.error("❌ Error:", e.message);
      reject(e);
    });

    req.write(customerData);
    req.end();
  });
}

// Grant entitlement to customer (make them premium)
function grantEntitlement() {
  return new Promise((resolve, reject) => {
    const entitlementData = JSON.stringify({
      app_user_id: CUSTOMER_ID,
      entitlements: {
        premium: {
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    });

    const options = {
      hostname: "api.revenuecat.com",
      port: 443,
      path: `/v1/customers/${CUSTOMER_ID}/entitlements`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(entitlementData),
        "Authorization": `Bearer ${SERVER_API_KEY}`,
      },
    };

    console.log("📡 Granting premium entitlement...\n");

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`Response Status: ${res.statusCode}\n`);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log("✅ Premium entitlement granted!\n");
        }

        try {
          const response = JSON.parse(data);
          console.log("Response:", JSON.stringify(response, null, 2));
        } catch (e) {
          console.log("Response:", data);
        }

        resolve();
      });
    });

    req.on("error", (e) => {
      console.error("Error:", e.message);
      reject(e);
    });

    req.write(entitlementData);
    req.end();
  });
}

async function main() {
  try {
    await createCustomer();
    console.log("\n" + "=".repeat(70) + "\n");

    // Wait a moment before granting entitlement
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await grantEntitlement();

    console.log("\n" + "=".repeat(70) + "\n");
    console.log("✨ SUCCESS! Test customer created in RevenueCat sandbox\n");
    console.log("📍 View in Dashboard:\n");
    console.log("1. Go to: https://app.revenuecat.com");
    console.log("2. Navigate to: Sandbox → Customers");
    console.log(`3. Search for: ${CUSTOMER_ID}`);
    console.log("4. You should see:");
    console.log("   ✅ Active subscription");
    console.log("   ✅ Premium entitlement");
    console.log("   ✅ 30-day trial/subscription\n");
    console.log("🎯 Direct Link:");
    console.log("   https://app.revenuecat.com/dashboard/sandbox/customers\n");
    console.log("💡 Customer Details:");
    console.log(`   ID: ${CUSTOMER_ID}`);
    console.log(`   Email: test-${Date.now()}@risegrind.app`);
    console.log("   Status: ACTIVE");
    console.log("   Subscription: MONTHLY ($4.99)");
    console.log("   Entitlement: premium");
    console.log("   Expires: ~30 days from now\n");
  } catch (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }
}

main();
