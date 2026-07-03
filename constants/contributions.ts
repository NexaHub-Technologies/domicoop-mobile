// Contribution rules and helpers (extracted from the retired data/mockData.ts).
// Allocation constants (SHARES_FIXED etc.) live in lib/utils/contributionAllocation.ts.

export const MIN_CONTRIBUTION_AMOUNT = 6000;

// Generate contribution months for dropdown (next 12 months)
export const getContributionMonths = () => {
  const months = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const year = now.getFullYear();
    const monthIndex = now.getMonth() + i;
    // Calculate year and month correctly handling overflow
    const adjustedYear = year + Math.floor(monthIndex / 12);
    const adjustedMonth = (monthIndex % 12) + 1;
    const monthStr = `${adjustedYear}-${adjustedMonth.toString().padStart(2, "0")}`;
    const date = new Date(adjustedYear, adjustedMonth - 1, 1);
    months.push({
      value: monthStr,
      label: date.toLocaleDateString("en-NG", { month: "long", year: "numeric" }),
    });
  }
  return months;
};
