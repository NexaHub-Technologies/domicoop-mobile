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

// Wire shape of GET /dashboard/summary — amounts are in kobo.
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
    total_savings: Math.round((raw.total_savings || 0) / 100),
    paid_this_month: raw.paid_this_month,
    current_month: raw.current_month,
    active_loan: raw.active_loan ? {
      id: raw.active_loan.id,
      amount: Math.round(raw.active_loan.amount / 100),
      balance: Math.round(raw.active_loan.balance / 100),
      status: raw.active_loan.status,
      next_payment_date: raw.active_loan.next_payment_date,
      next_payment_amount: Math.round(raw.active_loan.next_payment_amount / 100),
    } : null,
    recent_transactions: (raw.recent_transactions || []).map((t) => ({
      ...t,
      amount: Math.round(t.amount / 100),
    })),
    announcements: raw.announcements || [],
  };
}
