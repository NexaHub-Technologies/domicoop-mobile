// Loan product configuration and helpers (extracted from the retired data/mockData.ts).

import type { LoanPurpose, LoanPurposeConfig } from "@/lib/types/loans";

// Loan Configuration
export const loanConfig = {
  minAmount: 50000, // ₦50,000
  maxAmount: 5000000, // ₦5,000,000
  defaultInterestRate: 12, // 12% APR
  minTerm: 3,
  maxTerm: 60,
};

// 10 Loan Purposes with styling
export const loanPurposes: LoanPurposeConfig[] = [
  {
    id: "business",
    label: "Business",
    icon: "storefront",
    color: "#0b50da",
    bgColor: "#eff6ff",
  },
  {
    id: "education",
    label: "Education",
    icon: "school",
    color: "#7c3aed",
    bgColor: "#f3e8ff",
  },
  {
    id: "emergency",
    label: "Emergency",
    icon: "emergency",
    color: "#ea580c",
    bgColor: "#fff7ed",
  },
  {
    id: "medical",
    label: "Medical",
    icon: "medical-services",
    color: "#0d9488",
    bgColor: "#f0fdfa",
  },
  {
    id: "home_improvement",
    label: "Home",
    icon: "home-repair-service",
    color: "#16a34a",
    bgColor: "#f0fdf4",
  },
  {
    id: "vehicle",
    label: "Vehicle",
    icon: "directions-car",
    color: "#4f46e5",
    bgColor: "#eef2ff",
  },
  {
    id: "wedding",
    label: "Wedding",
    icon: "celebration",
    color: "#db2777",
    bgColor: "#fdf2f8",
  },
  { id: "travel", label: "Travel", icon: "flight", color: "#0891b2", bgColor: "#ecfeff" },
  {
    id: "debt_consolidation",
    label: "Debt",
    icon: "account-balance",
    color: "#475569",
    bgColor: "#f8fafc",
  },
  {
    id: "agriculture",
    label: "Agriculture",
    icon: "agriculture",
    color: "#059669",
    bgColor: "#ecfdf5",
  },
];

// Helper to get purpose config
export const getLoanPurposeConfig = (purpose: LoanPurpose): LoanPurposeConfig => {
  return loanPurposes.find((p) => p.id === purpose) || loanPurposes[0];
};

// Loan calculation helper
export const calculateLoan = (amount: number, term: number, rate: number) => {
  const monthlyRate = rate / 100 / 12;
  let monthlyPayment: number;

  if (monthlyRate === 0) {
    monthlyPayment = amount / term;
  } else {
    monthlyPayment =
      (amount * (monthlyRate * Math.pow(1 + monthlyRate, term))) /
      (Math.pow(1 + monthlyRate, term) - 1);
  }

  const totalRepayment = monthlyPayment * term;
  const totalInterest = totalRepayment - amount;

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
  };
};


export const loanInsights = [
  "Paying just ₦5,000 extra per month on your loans can save you significant interest over time.",
  "Consider consolidating multiple loans to get a lower overall interest rate.",
  "Setting up automatic payments ensures you never miss a due date.",
  "Making bi-weekly payments instead of monthly can help you pay off loans faster.",
  "Review your loan terms regularly - refinancing might save you money.",
];
