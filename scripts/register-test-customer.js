#!/usr/bin/env node

/**
 * RevenueCat Test Customer Registration
 *
 * This script registers a test customer with RevenueCat's sandbox API.
 * The customer will appear in: https://app.revenuecat.com/dashboard/sandbox/customers
 *
 * Usage:
 *   node scripts/register-test-customer.js
 */

const https = require("https");

const SDK_KEY = "test_fPLEXDsXJkmpdJbobXUsyWlKiSo";
const CUSTOMER_ID = `test-risegrind-${Date.now()}`;

console.log("🚀 RevenueCat Test Customer Registration\n");
console.log(`SDK Key: ${SDK_KEY}`);
console.log(`Customer ID: ${CUSTOMER_ID}\n`);

// Make request to RevenueCat API
function registerCustomer() {
  return new Promise((resolve, reject) => {
    const requestData = JSON.stringify({
      app_user_id: CUSTOMER_ID,
      attributes: {
        email: `test-${Date.now()}@risegrind.app`,
        displayName: "Test User - RiseGrind",
      },
    });

    const options = {
      hostname: "api.revenuecat.com",
      port: 443,
      path: "/v1/subscribers",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(requestData),
        "Authorization": `Bearer ${SDK_KEY}`,
        "X-Platform": "web",
      },
    };

    console.log("📡 Sending request to RevenueCat API...\n");

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`Status Code: ${res.statusCode}\n`);

        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log("✅ Customer registered successfully!\n");
          try {
            const response = JSON.parse(data);
            console.log("Response:", JSON.stringify(response, null, 2));
          } catch (e) {
            console.log("Response:", data);
          }
          resolve();
        } else {
          console.log("⚠️  Response:", data);
          resolve(); // Still resolve even if not 200, as API might work differently
        }
      });
    });

    req.on("error", (e) => {
      console.error("❌ Error:", e.message);
      reject(e);
    });

    req.write(requestData);
    req.end();
  });
}

// Alternative: Use direct HTTP request to simulate purchase
function simulatePurchaseViaAPI() {
  return new Promise((resolve, reject) => {
    const purchaseData = JSON.stringify({
      app_user_id: CUSTOMER_ID,
      fetch_token: "test_token_" + Date.now(),
      product_id: "monthly",
      price: 4.99,
      currency: "USD",
      purchase_date: new Date().toISOString(),
      expiration_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    });

    const options = {
      hostname: "api.revenuecat.com",
      port: 443,
      path: "/v1/receipts",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(purchaseData),
        "Authorization": `Bearer ${SDK_KEY}`,
      },
    };

    console.log("📡 Registering purchase with RevenueCat...\n");

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`Status Code: ${res.statusCode}\n`);
        resolve();
      });
    });

    req.on("error", (e) => {
      console.error("Error:", e.message);
      reject(e);
    });

    req.write(purchaseData);
    req.end();
  });
}

async function main() {
  try {
    await registerCustomer();
    console.log("\n" + "=".repeat(60) + "\n");
    console.log("📍 Next Steps:\n");
    console.log("1. Go to: https://app.revenuecat.com");
    console.log("2. Navigate to: Sandbox → Customers");
    console.log(`3. Look for customer: ${CUSTOMER_ID}`);
    console.log("4. You should see the test customer with subscription data\n");
    console.log("🎯 Direct Link:");
    console.log("   https://app.revenuecat.com/dashboard/sandbox/customers\n");
    console.log("✨ If you still see 0 customers:");
    console.log("   - Check that you're logged into the correct RevenueCat account");
    console.log("   - Verify the SDK key is correct");
    console.log("   - Try refreshing the dashboard page");
    console.log("   - Check browser console for any errors\n");
  } catch (error) {
    console.error("Failed to register customer:", error.message);
    process.exit(1);
  }
}

main();
