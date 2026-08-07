import type { Contribution } from "@/lib/types/contributions";

export const SHARES_FIXED = 4000;
export const SOCIAL_FIXED = 1000;
export const MAX_SAVINGS = 46000;
export const STANDARD_MAX = 51000;

// Tier 0 boundary — below this, a contribution is the cooperative's least
// payment tier and is credited 100% to Shares, with no split across
// Social/Savings/Deposit (docs/currency-contract.md).
export const SHARES_BENCHMARK = 6000;

export interface ContributionAllocation {
  shares: number;
  social: number;
  savings: number;
  deposit: number;
}

export interface ContributionAllocationSummary {
  total: number;
  allocation: ContributionAllocation;
  percentages: {
    shares: number;
    social: number;
    savings: number;
    deposit: number;
  };
}

export function calculateAllocation(amount: number): ContributionAllocation {
  // Tier 0 — the least payment tier. Everything goes to Shares until the
  // member has built up to the shares benchmark; nothing else is credited.
  if (amount < SHARES_BENCHMARK) {
    return { shares: amount, social: 0, savings: 0, deposit: 0 };
  }

  const shares = SHARES_FIXED;
  const social = SOCIAL_FIXED;

  if (amount <= STANDARD_MAX) {
    const savings = amount - SHARES_FIXED - SOCIAL_FIXED;
    return { shares, social, savings: Math.max(0, savings), deposit: 0 };
  }

  const savings = MAX_SAVINGS;
  const deposit = amount - STANDARD_MAX;
  return { shares, social, savings, deposit };
}

export function getAllocationSummary(amount: number): ContributionAllocationSummary {
  const allocation = calculateAllocation(amount);
  const total = amount;

  const percentages = {
    shares: total > 0 ? (allocation.shares / total) * 100 : 0,
    social: total > 0 ? (allocation.social / total) * 100 : 0,
    savings: total > 0 ? (allocation.savings / total) * 100 : 0,
    deposit: total > 0 ? (allocation.deposit / total) * 100 : 0,
  };

  return { total, allocation, percentages };
}

export function computeAllocationTotals(
  contributions: Pick<Contribution, "amount">[],
): ContributionAllocation {
  return contributions.reduce(
    (acc, c) => {
      const alloc = calculateAllocation(c.amount);
      acc.shares += alloc.shares;
      acc.social += alloc.social;
      acc.savings += alloc.savings;
      acc.deposit += alloc.deposit;
      return acc;
    },
    { shares: 0, social: 0, savings: 0, deposit: 0 },
  );
}
