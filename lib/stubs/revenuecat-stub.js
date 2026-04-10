/**
 * Web stub for react-native-purchases (RevenueCat)
 * RevenueCat is a native-only SDK. This stub prevents Metro bundler errors on web.
 */
const LOG_LEVEL = { DEBUG: 'DEBUG', INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR', VERBOSE: 'VERBOSE' };
const PURCHASES_ERROR_CODE = { PURCHASE_CANCELLED_ERROR: 'PURCHASE_CANCELLED_ERROR' };
const PRODUCT_CATEGORY = { SUBSCRIPTION: 'SUBSCRIPTION', NON_SUBSCRIPTION: 'NON_SUBSCRIPTION' };

const mockCustomerInfo = {
  entitlements: { active: {} },
  activeSubscriptions: [],
};

const mockOfferings = {
  current: { availablePackages: [] },
  all: {},
};

const Purchases = {
  setLogLevel: () => {},
  configure: () => Promise.resolve(),
  getCustomerInfo: () => Promise.resolve(mockCustomerInfo),
  getOfferings: () => Promise.resolve(mockOfferings),
  getProducts: () => Promise.resolve([]),
  purchasePackage: () => Promise.resolve({ customerInfo: mockCustomerInfo }),
  purchaseStoreProduct: () => Promise.resolve({ customerInfo: mockCustomerInfo }),
  purchaseSubscriptionOption: () => Promise.resolve({ customerInfo: mockCustomerInfo }),
  restorePurchases: () => Promise.resolve(mockCustomerInfo),
  logIn: () => Promise.resolve({ customerInfo: mockCustomerInfo, created: false }),
  logOut: () => Promise.resolve(mockCustomerInfo),
  addCustomerInfoUpdateListener: () => ({ remove: () => {} }),
  removeCustomerInfoUpdateListener: () => {},
  LOG_LEVEL,
};

module.exports = Purchases;
module.exports.default = Purchases;
module.exports.LOG_LEVEL = LOG_LEVEL;
module.exports.PURCHASES_ERROR_CODE = PURCHASES_ERROR_CODE;
module.exports.PRODUCT_CATEGORY = PRODUCT_CATEGORY;
