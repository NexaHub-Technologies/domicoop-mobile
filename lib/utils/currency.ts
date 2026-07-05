// Currency units — the single source of truth for how money crosses the two
// boundaries described in currency-contract.md.
//
//   Naira → DOMICOOP server   (whole Naira, a JSON number; never kobo)
//   kobo  → Paystack          (Naira × 100)
//
// ⚠️ DOMICOOP CAVEAT — do NOT use `nairaToKobo` for our checkout calls.
// The client pays through `react-native-paystack-webview`, whose wrapper
// already multiplies the amount by 100 internally before handing it to
// Paystack (see node_modules/.../lib/utils.js — `amount: config.amount * 100`).
// So `usePaystackPayment` must pass **Naira**; scaling it here would charge the
// member 100× too much. `nairaToKobo` exists only for a hypothetical raw
// Paystack SDK call — there is currently no such call site in this app.

/** ₦ → kobo. Only for a raw Paystack SDK that expects kobo (see caveat above). */
export const nairaToKobo = (naira: number): number => Math.round(naira * 100);

/** kobo → ₦, for reading kobo values such as `transactions.amount`. */
export const koboToNaira = (kobo: number): number => kobo / 100;

/** Parse a formatted form string ("₦50,000.00") into a clean Naira number (2dp). */
export function parseNairaInput(raw: string): number {
  const n = Number(raw.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
}

/** Format a Naira number for display, e.g. "₦50,000.00". */
export const formatNaira = (naira: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(naira);

/**
 * Build a server-bound amount: asserts it is a finite, in-range Naira number
 * and normalizes it to ≤ 2 decimal places (columns are DECIMAL(10,2)). Throws
 * on anything the server's strict `t.Number` validation would reject.
 */
export function toApiAmount(naira: number, min = 1): number {
  if (!Number.isFinite(naira) || naira < min || naira > 99_999_999.99) {
    throw new Error(`Invalid amount: ${naira}`);
  }
  return Math.round(naira * 100) / 100; // ensure ≤ 2dp, still Naira
}
