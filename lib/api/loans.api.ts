import { authedRequest } from "@/lib/http";
import type { Loan, LoanType } from "@/lib/types/loans";
import {
  ApiLoan,
  ApiLoansResponse,
  transformLoan,
  transformLoansResponse,
} from "@/lib/types/loans";

// Request body for POST /loans/apply (see LOANS_API_CONTRACT.md §3).
// Amount and tenure are naira / months; interest is derived server-side and
// must not be sent. `purpose` is free text (≥ 10 chars); `type` is the loan
// category enum.
export interface LoanApplicationPayload {
  amount: number;
  purpose: string;
  type: LoanType;
  tenure_months: number;
}

// Success body of POST /loans/:id/repayment (see LOANS_API_CONTRACT.md §5).
// Failures (non-2xx) surface as ApiError with `{ success: false, reason }` or
// `{ error }` in the body.
interface RepaymentResponse {
  success?: boolean;
  already_processed?: boolean;
  loan_id?: string;
  amount_paid?: number;
  remaining_balance?: number;
  // Loan status after the repayment ("repaying" | "closed").
  status?: string;
}

export const loansApi = {
  getMyLoans: async (): Promise<Loan[]> => {
    const response = await authedRequest<ApiLoansResponse | ApiLoan[]>("/loans/me");
    return transformLoansResponse(response);
  },

  /**
   * Submit a loan application. The server records the request as pending and
   * returns the created loan; the client shows a confirmation and refreshes
   * the loans list. Interest/terms may be re-derived server-side.
   */
  apply: async (payload: LoanApplicationPayload): Promise<Loan | null> => {
    const response = await authedRequest<{ loan?: ApiLoan } | ApiLoan>("/loans/apply", {
      method: "POST",
      body: payload,
    });
    const apiLoan =
      response && "loan" in response ? response.loan : (response as ApiLoan);
    return apiLoan && apiLoan.id ? transformLoan(apiLoan) : null;
  },

  /**
   * Server-side repayment verification: the API confirms the reference with
   * Paystack and applies the repayment to the loan. The client never sends
   * amounts — the server derives them from the verified transaction.
   */
  verifyRepayment: async (
    loanId: string,
    reference: string,
  ): Promise<{ verified: boolean; chargeStatus?: string }> => {
    const response = await authedRequest<RepaymentResponse>(
      `/loans/${loanId}/repayment`,
      { method: "POST", body: { reference } },
    );
    return {
      verified: response.success === true || !!response.already_processed,
      chargeStatus: response.status,
    };
  },
};

export default loansApi;
