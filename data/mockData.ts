// Mock data for the DOMICOP app

export interface User {
  id: string;
  name: string;
  email: string;
  memberSince: string;
  memberId: string;
}

export interface SavingsData {
  totalSaved: number;
  monthlyGoal: number;
  dividendsEarned: number;
  growthPercentage: number;
}

export interface LoanData {
  activeBalance: number;
  nextPayment: {
    date: string;
    amount: number;
  };
  progress: string;
  totalMonths: number;
  currentMonth: number;
}

export type TransactionType =
  | "contribution"
  | "interest"
  | "loan_repayment"
  | "fee"
  | "withdrawal";
export type TransactionCategory = "savings" | "loan";
export type TransactionStatus = "completed" | "pending" | "automated";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  title: string;
  date: string;
  time: string;
  amount: number;
  status: TransactionStatus;
  loanId?: string;
}

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  route: string;
}

export interface SettingsItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  route: string;
  destructive?: boolean;
}

export interface SettingsSection {
  id: string;
  title: string;
  items: SettingsItem[];
}

// User Data
export const mockUser: User = {
  id: "user-001",
  name: "Alexander Sterling",
  email: "alexander.sterling@domicop.org",
  memberSince: "Jan 2023",
  memberId: "DOMI-882941",
};

// Savings Data (in Naira)
export const mockSavingsData: SavingsData = {
  totalSaved: 4285000.0,
  monthlyGoal: 1500000.0,
  dividendsEarned: 42850.0,
  growthPercentage: 2.4,
};

// Loan Data (in Naira)
export const mockLoanData: LoanData = {
  activeBalance: 1240000.0,
  nextPayment: {
    date: "June 15, 2024",
    amount: 45000.0,
  },
  progress: "3/24 MONTHS",
  totalMonths: 24,
  currentMonth: 3,
};

// Quick Actions (only 2 as per requirements)
export const mockQuickActions: QuickAction[] = [
  {
    id: "add contribution",
    icon: "add-circle",
    label: "Deposit",
    route: "/transactions/add-contribution",
  },
  {
    id: "apply",
    icon: "request-quote",
    label: "Apply",
    route: "/transactions/apply-for-loan",
  },
];

// Recent Transactions (mixed savings and loan activity) - in Naira
export const mockRecentTransactions: Transaction[] = [
  {
    id: "txn-001",
    type: "contribution",
    category: "savings",
    title: "Monthly Contribution",
    date: "June 01, 2024",
    time: "10:45 AM",
    amount: 250000.0,
    status: "completed",
  },
  {
    id: "txn-002",
    type: "interest",
    category: "savings",
    title: "Interest Credited",
    date: "May 31, 2024",
    time: "11:59 PM",
    amount: 12450.0,
    status: "automated",
  },
  {
    id: "txn-003",
    type: "loan_repayment",
    category: "loan",
    title: "Loan Repayment",
    date: "May 15, 2024",
    time: "02:20 PM",
    amount: -45000.0,
    status: "completed",
    loanId: "LN-8821",
  },
  {
    id: "txn-004",
    type: "fee",
    category: "loan",
    title: "Processing Fee",
    date: "May 15, 2024",
    time: "02:20 PM",
    amount: -5000.0,
    status: "completed",
  },
];

// Savings-specific transactions (for savings tab) - in Naira
export const mockSavingsTransactions: Transaction[] = [
  {
    id: "sav-001",
    type: "contribution",
    category: "savings",
    title: "March Contribution",
    date: "Mar 12, 2024",
    time: "09:45 AM",
    amount: 650000.0,
    status: "completed",
  },
  {
    id: "sav-002",
    type: "contribution",
    category: "savings",
    title: "February Contribution",
    date: "Feb 15, 2024",
    time: "02:15 PM",
    amount: 500000.0,
    status: "completed",
  },
  {
    id: "sav-003",
    type: "interest",
    category: "savings",
    title: "Annual Dividend Payout",
    date: "Jan 30, 2024",
    time: "11:00 AM",
    amount: 1240000.0,
    status: "completed",
  },
  {
    id: "sav-004",
    type: "contribution",
    category: "savings",
    title: "January Contribution",
    date: "Jan 15, 2024",
    time: "10:30 AM",
    amount: 500000.0,
    status: "completed",
  },
  {
    id: "sav-005",
    type: "withdrawal",
    category: "savings",
    title: "Emergency Withdrawal",
    date: "Dec 20, 2023",
    time: "04:50 PM",
    amount: -200000.0,
    status: "completed",
  },
];

// Profile Settings Sections
export const mockProfileSettings: SettingsSection[] = [
  {
    id: "account-settings",
    title: "Account Settings",
    items: [
      {
        id: "edit-details",
        icon: "person",
        title: "Edit Account Details",
        subtitle: "Update name, email, and phone",
        route: "/settings/edit-profile",
      },
      {
        id: "security",
        icon: "security",
        title: "Security Settings",
        subtitle: "Passwords and 2FA",
        route: "/settings/security",
      },
      {
        id: "notifications",
        icon: "notifications",
        title: "Notification Preferences",
        subtitle: "Email and push alerts",
        route: "/settings/notification-preferences",
      },
      {
        id: "theme",
        icon: "palette",
        title: "Theme Preference",
        subtitle: "Light, dark or system default",
        route: "/settings/theme-preference",
      },
    ],
  },
  {
    id: "more-options",
    title: "More Options",
    items: [
      {
        id: "support",
        icon: "help",
        title: "Support & FAQ",
        route: "/support",
      },
      {
        id: "guidelines",
        icon: "rule",
        title: "Cooperative Guidelines",
        subtitle: "Rules and regulations",
        route: "/settings/guidelines",
      },
      {
        id: "privacy",
        icon: "description",
        title: "Privacy Policy",
        route: "/privacy",
      },
      {
        id: "logout",
        icon: "logout",
        title: "Log Out",
        route: "/logout",
        destructive: true,
      },
      {
        id: "delete-account",
        icon: "delete-forever",
        title: "Delete Account",
        route: "/delete-account",
        destructive: true,
      },
    ],
  },
];

// Helper functions
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

export const getTransactionIcon = (type: TransactionType): string => {
  switch (type) {
    case "contribution":
      return "trending-up";
    case "interest":
      return "stars";
    case "loan_repayment":
      return "keyboard-double-arrow-right";
    case "fee":
      return "history-edu";
    case "withdrawal":
      return "payments";
    default:
      return "receipt";
  }
};

export const getTransactionIconColor = (type: TransactionType): string => {
  switch (type) {
    case "contribution":
    case "interest":
      return "#22c55e"; // emerald-500
    case "loan_repayment":
    case "fee":
    case "withdrawal":
      return "#0f172a"; // slate-900
    default:
      return "#475569"; // slate-600
  }
};

export const getTransactionBgColor = (type: TransactionType): string => {
  switch (type) {
    case "contribution":
    case "interest":
      return "#ecfdf5"; // emerald-50
    case "loan_repayment":
    case "fee":
      return "#eff6ff"; // blue-50
    case "withdrawal":
      return "#f1f5f9"; // slate-100
    default:
      return "#f1f5f9"; // slate-100
  }
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

export const getDefaultTitle = (type: string, date: string): string => {
  switch (type) {
    case "contribution":
      return "Monthly Contribution";
    case "interest":
      return "Interest Credited";
    case "loan_repayment":
      return "Loan Repayment";
    case "fee":
      return "Processing Fee";
    case "withdrawal":
      return "Withdrawal";
    default: {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  }
};

// ============================================
// LOAN DATA & CONFIGURATION
// ============================================

export type LoanPurpose =
  | "business"
  | "education"
  | "emergency"
  | "medical"
  | "home_improvement"
  | "vehicle"
  | "wedding"
  | "travel"
  | "debt_consolidation"
  | "agriculture";

export type LoanStatus = "on_track" | "pending" | "completed" | "overdue";

export interface Loan {
  id: string;
  purpose: LoanPurpose;
  title: string;
  loanId: string;
  totalAmount: number;
  remainingBalance: number;
  status: LoanStatus;
  progress: number;
  nextPayment: {
    date: string;
    amount: number;
    daysLeft: number;
  };
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  startDate: string;
}

export interface LoanPurposeConfig {
  id: LoanPurpose;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

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

// Mock Loans Data
export const mockLoans: Loan[] = [
  {
    id: "loan-001",
    purpose: "education",
    title: "Education Loan",
    loanId: "DOMI-88291",
    totalAmount: 1240000,
    remainingBalance: 812000,
    status: "on_track",
    progress: 65,
    nextPayment: {
      date: "Sep 15, 2024",
      amount: 34000,
      daysLeft: 12,
    },
    interestRate: 10.5,
    termMonths: 36,
    monthlyPayment: 34000,
    startDate: "Jan 15, 2023",
  },
  {
    id: "loan-002",
    purpose: "emergency",
    title: "Emergency Loan",
    loanId: "DOMI-44102",
    totalAmount: 180000,
    remainingBalance: 180000,
    status: "pending",
    progress: 0,
    nextPayment: {
      date: "Oct 01, 2024",
      amount: 15000,
      daysLeft: 28,
    },
    interestRate: 15,
    termMonths: 12,
    monthlyPayment: 15000,
    startDate: "Sep 01, 2024",
  },
  {
    id: "loan-003",
    purpose: "medical",
    title: "Medical Loan",
    loanId: "DOMI-77321",
    totalAmount: 850000,
    remainingBalance: 552500,
    status: "on_track",
    progress: 35,
    nextPayment: {
      date: "Sep 20, 2024",
      amount: 28333,
      daysLeft: 17,
    },
    interestRate: 8.5,
    termMonths: 30,
    monthlyPayment: 28333,
    startDate: "Mar 10, 2024",
  },
  {
    id: "loan-004",
    purpose: "business",
    title: "Business Expansion",
    loanId: "DOMI-99123",
    totalAmount: 2500000,
    remainingBalance: 1875000,
    status: "on_track",
    progress: 25,
    nextPayment: {
      date: "Sep 10, 2024",
      amount: 52083,
      daysLeft: 7,
    },
    interestRate: 12,
    termMonths: 48,
    monthlyPayment: 52083,
    startDate: "Jun 01, 2024",
  },
];

// Calculate total debt
export const getTotalDebt = (): number => {
  return mockLoans.reduce((sum, loan) => sum + loan.remainingBalance, 0);
};

// Get next payment across all loans
export const getNextPayment = () => {
  const activeLoans = mockLoans.filter((loan) => loan.status !== "completed");
  if (activeLoans.length === 0) return null;

  // Find loan with closest next payment
  const sorted = activeLoans.sort(
    (a, b) => a.nextPayment.daysLeft - b.nextPayment.daysLeft,
  );
  return sorted[0].nextPayment;
};

// Loan insights/tips
export const loanInsights = [
  "Paying just ₦5,000 extra per month on your loans can save you significant interest over time.",
  "Consider consolidating multiple loans to get a lower overall interest rate.",
  "Setting up automatic payments ensures you never miss a due date.",
  "Making bi-weekly payments instead of monthly can help you pay off loans faster.",
  "Review your loan terms regularly - refinancing might save you money.",
];

// ============================================
// FAQ DATA FOR SUPPORT SCREEN
// ============================================

export interface FAQ {
  id: string;
  icon: string;
  question: string;
  answer: string;
}

export const faqData: FAQ[] = [
  {
    id: "faq-001",
    icon: "card-membership",
    question: "Membership eligibility & benefits",
    answer:
      "DOMICOP membership is open to all residents. Benefits include access to low-interest loans, community savings programs, and exclusive financial literacy workshops.",
  },
  {
    id: "faq-002",
    icon: "payments",
    question: "How do I apply for a loan?",
    answer:
      "Navigate to the 'Loans' tab in the bottom bar, select 'New Application', and follow the prompts. You'll need to provide identity verification and income statements for processing.",
  },
  {
    id: "faq-003",
    icon: "schedule",
    question: "Payment methods and schedules",
    answer:
      "Payments are typically processed on the 1st and 15th of each month. We support bank transfers, mobile money, and direct debit from your DOMICOP wallet.",
  },
  {
    id: "faq-004",
    icon: "account-balance-wallet",
    question: "Loan repayment options",
    answer:
      "You can make partial or full repayments at any time without penalties. Early repayment discounts are available for qualifying members.",
  },
  {
    id: "faq-005",
    icon: "savings",
    question: "Savings contribution rules",
    answer:
      "Members are encouraged to contribute a minimum of ₦10,000 monthly. Higher contributions unlock better loan rates and increased borrowing limits.",
  },
  {
    id: "faq-006",
    icon: "security",
    question: "Account security best practices",
    answer:
      "Enable two-factor authentication, use strong passwords, and never share your login credentials. We also recommend reviewing your login history regularly.",
  },
  {
    id: "faq-007",
    icon: "edit-note",
    question: "How to update personal information",
    answer:
      "Go to Profile > Edit Account Details to update your name, email, phone number, and profile picture. Changes are reflected immediately.",
  },
];

// ============================================
// CONTRIBUTION & SAVINGS DATA
// ============================================

// Source of funds options for contributions
export const sourceOfFundsOptions = [
  { id: "payroll", label: "Payroll Deduction", icon: "work" },
  { id: "bank", label: "Bank Transfer", icon: "account-balance" },
  { id: "wallet", label: "Digital Wallet", icon: "wallet" },
  { id: "cash", label: "Cash Deposit", icon: "payments" },
];

// Contribution types
export const contributionTypes = [
  { id: "regular", label: "Regular Savings", icon: "savings" },
  { id: "emergency", label: "Emergency Fund", icon: "emergency" },
  { id: "target", label: "Target Savings", icon: "flag" },
];

// Minimum contribution amount (in Naira)
export const SHARES_FIXED = 4000;
export const SOCIAL_FIXED = 1000;
export const MAX_SAVINGS = 46000;
export const STANDARD_MAX = 51000;
export const MIN_CONTRIBUTION_AMOUNT = 6000;

// Administrative fee rate (0.5%)
export const ADMIN_FEE_RATE = 0.005;

// Calculate administrative fee
export const calculateContributionFee = (amount: number): number => {
  return Math.round(amount * ADMIN_FEE_RATE * 100) / 100;
};

// Calculate total amount to be credited (after fee)
export const calculateTotalCredited = (amount: number): number => {
  const fee = calculateContributionFee(amount);
  return amount - fee;
};

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

// Helper to generate transaction ID
export const generateTransactionId = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};
