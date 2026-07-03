export interface DashboardMember {
  full_name: string;
  member_no: string | null;
  status: "pending" | "active" | "suspended";
  avatar_url: string;
}

export interface DashboardSummary {
  member: DashboardMember;
  total_savings: number;
  paid_this_month: boolean;
  current_month: string;
  active_loan: {
    id: string;
    amount: number;
    balance: number;
    status: string;
    next_payment_date: string;
    next_payment_amount: number;
  } | null;
  recent_transactions: Array<{
    id: string;
    type: string;
    category: "savings" | "loan";
    title?: string;
    amount: number;
    date: string;
    status: string;
  }>;
  announcements: Array<{
    id: string;
    title: string;
    body: string;
    created_at: string;
  }>;
}

// Wire shape of GET /dashboard/summary — amounts are in naira (the API stores
// naira; kobo exists only at the Paystack boundary).
export interface ApiDashboardSummary {
  member: DashboardMember;
  total_savings?: number;
  paid_this_month: boolean;
  current_month: string;
  active_loan: {
    id: string;
    amount: number;
    balance: number;
    status: string;
    next_payment_date: string;
    next_payment_amount: number;
  } | null;
  recent_transactions?: Array<{
    id: string;
    type: string;
    category: "savings" | "loan";
    title?: string;
    amount: number;
    date: string;
    status: string;
  }>;
  announcements?: Array<{
    id: string;
    title: string;
    body: string;
    created_at: string;
  }>;
}

export function transformDashboardSummary(raw: ApiDashboardSummary): DashboardSummary {
  return {
    member: raw.member,
    total_savings: raw.total_savings || 0,
    paid_this_month: raw.paid_this_month,
    current_month: raw.current_month,
    active_loan: raw.active_loan,
    recent_transactions: raw.recent_transactions || [],
    announcements: raw.announcements || [],
  };
}
