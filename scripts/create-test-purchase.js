#!/usr/bin/env node

/**
 * RevenueCat Test Purchase Creator
 *
 * Creates a test purchase in RevenueCat sandbox using Basic Auth with Secret API Key.
 * The customer will appear in: https://app.revenuecat.com/dashboard/sandbox/customers
 *
 * Usage:
 *   node scripts/create-test-purchase.js
 */

const https = require("https");

// Use the Secret API Key from RevenueCat Settings → API Keys
const SECRET_API_KEY = "sk_OcgKGvHglwIrhCKjdbpEYtDJqZPJN";
const APP_USER_ID = `test-risegrind-${Date.now()}`;

console.log("🚀 RevenueCat Test Purchase Creator\n");
console.log(`App User ID: ${APP_USER_ID}\n`);

// Create Basic Auth header from Secret API Key
function createBasicAuth(apiKey) {
  // Use API key as username, empty password
  const credentials = `${apiKey}:`;
  return Buffer.from(credentials).toString("base64");
}

// Create test purchase using Basic Auth
function createTestPurchase() {
  return new Promise((resolve, reject) => {
    const basicAuth = createBasicAuth(SECRET_API_KEY);

    const purchaseData = JSON.stringify({
      app_user_id: APP_USER_ID,
      fetch_token: `test_token_${Date.now()}`,
      product_id: "monthly",
    });

    const options = {
      hostname: "api.revenuecat.com",
      port: 443,
      path: "/v1/receipts",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(purchaseData),
        // Try Basic Auth with Secret API Key
        "Authorization": `Basic ${basicAuth}`,
      },
    };

    console.log("📡 Creating test purchase with Basic Auth...\n");

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`Response Status: ${res.statusCode}\n`);

        try {
          const response = JSON.parse(data);
          console.log("Response:", JSON.stringify(response, null, 2));

          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log("\n✅ Test purchase created successfully!");
          }
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

    req.write(purchaseData);
    req.end();
  });
}

async function main() {
  try {
    await createTestPurchase();

    console.log("\n" + "=".repeat(70) + "\n");
    console.log("📍 Check Your RevenueCat Dashboard:\n");
    console.log("1. Go to: https://app.revenuecat.com");
    console.log("2. Navigate to: Sandbox → Customers");
    console.log(`3. Look for customer: ${APP_USER_ID}`);
    console.log("4. You should see the test purchase\n");
    console.log("🎯 Direct Dashboard Link:");
    console.log("   https://app.revenuecat.com/dashboard/sandbox/customers\n");
    console.log("💡 Customer ID to search for:");
    console.log(`   ${APP_USER_ID}\n`);
    console.log("✨ If you see the customer with active subscription:");
    console.log("   ✅ RevenueCat is properly configured!");
    console.log("   ✅ Your app is ready for production!\n");
  } catch (error) {
    console.error("Failed:", error.message);
    process.exit(1);
  }
}

main();
