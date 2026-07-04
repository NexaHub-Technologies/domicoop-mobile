// Loan category, per the /loans API contract (drives icon/colour in the UI).
export type LoanType =
  | "emergency"
  | "personal"
  | "housing"
  | "education"
  | "business";

// Server statuses collapse to these display buckets.
export type LoanStatus =
  | "on_track"
  | "pending"
  | "completed"
  | "overdue"
  | "rejected";

export interface Loan {
  id: string;
  type: LoanType;
  /** Free-text description the member entered when applying. */
  purpose: string;
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

export interface LoanTypeConfig {
  id: LoanType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

// Wire shape of the /loans endpoints (see LOANS_API_CONTRACT.md). Amounts are
// in naira. GET /loans/me returns a bare array; POST /loans/apply and
// GET /loans/:id return a single object.
export interface ApiLoan {
  id: string;
  member_id?: string;
  amount_requested: number;
  amount_approved?: number | null;
  balance?: number | null;
  monthly_repayment?: number | null;
  interest_rate?: number | null;
  tenure_months?: number | null;
  purpose: string;
  type: LoanType;
  status?: string;
  due_date?: string | null;
  disbursed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiLoansResponse {
  loans?: ApiLoan[];
}

const VALID_TYPES: LoanType[] = [
  "emergency",
  "personal",
  "housing",
  "education",
  "business",
];

const TYPE_LABELS: Record<LoanType, string> = {
  emergency: "Emergency",
  personal: "Personal",
  housing: "Housing",
  education: "Education",
  business: "Business",
};

// Contract statuses: pending → under_review → approved → disbursed → repaying
// → closed, plus rejected.
function mapLoanStatus(status: string | undefined, balance: number): LoanStatus {
  switch (status) {
    case "approved":
    case "disbursed":
    case "repaying":
      return "on_track";
    case "closed":
      return "completed";
    case "rejected":
      return "rejected";
    case "pending":
    case "under_review":
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

export function transformLoan(api: ApiLoan): Loan {
  const type = VALID_TYPES.includes(api.type) ? api.type : "personal";
  const totalAmount = api.amount_approved ?? api.amount_requested ?? 0;
  const remainingBalance = api.balance ?? totalAmount;
  const progress =
    totalAmount > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(((totalAmount - remainingBalance) / totalAmount) * 100),
          ),
        )
      : 0;

  return {
    id: api.id,
    type,
    purpose: api.purpose || "",
    title: `${TYPE_LABELS[type]} Loan`,
    loanId: api.id.slice(0, 8).toUpperCase(),
    totalAmount,
    remainingBalance,
    status: mapLoanStatus(api.status, remainingBalance),
    progress,
    nextPayment: {
      date: formatDisplayDate(api.due_date),
      amount: api.monthly_repayment || 0,
      daysLeft: daysUntil(api.due_date),
    },
    interestRate: api.interest_rate || 0,
    termMonths: api.tenure_months || 0,
    monthlyPayment: api.monthly_repayment || 0,
    startDate: formatDisplayDate(api.created_at),
  };
}

export function transformLoansResponse(raw: ApiLoansResponse | ApiLoan[]): Loan[] {
  const loans = Array.isArray(raw) ? raw : raw.loans || [];
  return loans.map(transformLoan);
}
