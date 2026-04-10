/**
 * Web stub for @superwall/react-native-superwall
 * Superwall is a native-only SDK. This stub prevents Metro bundler errors on web.
 */
const Superwall = {
  configure: () => Promise.resolve(),
  registerEvent: () => Promise.resolve(),
  identify: () => Promise.resolve(),
  reset: () => Promise.resolve(),
  setUserAttributes: () => Promise.resolve(),
  setSubscriptionStatus: () => Promise.resolve(),
  getUser: () => Promise.resolve(null),
  restorePurchases: () => Promise.resolve(),
};

module.exports = Superwall;
module.exports.default = Superwall;
