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

// Wire shape of GET /loans/me — amounts are in naira (same convention as
// contributions/dashboard; kobo exists only at the Paystack boundary).
// Field naming follows the dashboard's active_loan shape.
export interface ApiLoan {
  id: string;
  purpose?: string;
  title?: string;
  loan_no?: string;
  amount: number;
  balance: number;
  status?: string;
  interest_rate?: number;
  term_months?: number;
  monthly_payment?: number;
  next_payment_date?: string | null;
  next_payment_amount?: number;
  created_at?: string;
}

export interface ApiLoansResponse {
  loans?: ApiLoan[];
}

const VALID_PURPOSES: LoanPurpose[] = [
  "business",
  "education",
  "emergency",
  "medical",
  "home_improvement",
  "vehicle",
  "wedding",
  "travel",
];

function mapLoanStatus(status: string | undefined, balance: number): LoanStatus {
  switch (status) {
    case "on_track":
    case "active":
    case "approved":
      return "on_track";
    case "completed":
    case "paid":
    case "closed":
      return "completed";
    case "overdue":
    case "defaulted":
      return "overdue";
    case "pending":
      return "pending";
    default:
      return balance <= 0 ? "completed" : "on_track";
  }
}

function formatDisplayDate(iso: string | undefined | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntil(iso: string | undefined | null): number {
  if (!iso) return 0;
  const due = new Date(iso).getTime();
  if (isNaN(due)) return 0;
  return Math.max(0, Math.ceil((due - Date.now()) / (24 * 60 * 60 * 1000)));
}

function titleForPurpose(purpose: LoanPurpose): string {
  const label = purpose.replace(/_/g, " ");
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} Loan`;
}

export function transformLoan(api: ApiLoan): Loan {
  const purpose = VALID_PURPOSES.includes(api.purpose as LoanPurpose)
    ? (api.purpose as LoanPurpose)
    : "business";
  const totalAmount = api.amount || 0;
  const remainingBalance = api.balance ?? totalAmount;
  const progress =
    totalAmount > 0
      ? Math.min(100, Math.max(0, Math.round(((totalAmount - remainingBalance) / totalAmount) * 100)))
      : 0;

  return {
    id: api.id,
    purpose,
    title: api.title || titleForPurpose(purpose),
    loanId: api.loan_no || api.id,
    totalAmount,
    remainingBalance,
    status: mapLoanStatus(api.status, remainingBalance),
    progress,
    nextPayment: {
      date: formatDisplayDate(api.next_payment_date),
      amount: api.next_payment_amount || 0,
      daysLeft: daysUntil(api.next_payment_date),
    },
    interestRate: api.interest_rate || 0,
    termMonths: api.term_months || 0,
    monthlyPayment: api.monthly_payment || 0,
    startDate: formatDisplayDate(api.created_at),
  };
}

export function transformLoansResponse(raw: ApiLoansResponse | ApiLoan[]): Loan[] {
  const loans = Array.isArray(raw) ? raw : raw.loans || [];
  return loans.map(transformLoan);
}
