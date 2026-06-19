const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Web resolver: stub out native-only packages on web
// These packages use native modules that cannot run in a browser.
const NATIVE_ONLY_STUBS = {
  "@superwall/react-native-superwall": path.resolve(__dirname, "lib/stubs/superwall-stub.js"),
  "react-native-purchases": path.resolve(__dirname, "lib/stubs/revenuecat-stub.js"),
  "react-native-purchases-ui": path.resolve(__dirname, "lib/stubs/revenuecat-ui-stub.js"),
};

const originalResolver = config.resolver?.resolveRequest;
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    if (platform === "web" && NATIVE_ONLY_STUBS[moduleName]) {
      return { filePath: NATIVE_ONLY_STUBS[moduleName], type: "sourceFile" };
    }
    if (originalResolver) return originalResolver(context, moduleName, platform);
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});