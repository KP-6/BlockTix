// Deprecated: RazorpayMockModal has been replaced by a popup-based checkout at
// `/payment-checkout`. This file is intentionally left as a no-op to avoid
// confusion and accidental imports. Please remove any imports of this file.

export default function DeprecatedRazorpayModal(): null {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.warn('RazorpayMockModal is deprecated. Use /payment-checkout instead.');
  }
  return null;
}
