// Shared display formatters (extracted from the retired data/mockData.ts).

export const formatCurrency = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-₦${formatted}` : `+₦${formatted}`;
};

export const formatCurrencyNoSign = (amount: number): string => {
  return amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const getInitials = (name: string): string => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const formatDate = (dateStr: string, options?: Intl.DateTimeFormatOptions): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-NG", options ?? { day: "numeric", month: "short", year: "numeric" });
};

export const formatMonth = (monthStr: string, options?: Intl.DateTimeFormatOptions): string => {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", options ?? { month: "long", year: "numeric" });
};

