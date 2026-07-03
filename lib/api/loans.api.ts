import { authedRequest } from "@/lib/http";
import type { Loan } from "@/lib/types/loans";
import {
  ApiLoan,
  ApiLoansResponse,
  transformLoansResponse,
} from "@/lib/types/loans";

// Envelope returned by POST /loans/:id/repayment (mirrors /contributions/verify).
interface RepaymentResponse {
  verified?: boolean;
  // Paystack charge status when not yet settled — safe to retry.
  status?: string;
  already_processed?: boolean;
}

export const loansApi = {
  getMyLoans: async (): Promise<Loan[]> => {
    const response = await authedRequest<ApiLoansResponse | ApiLoan[]>("/loans/me");
    return transformLoansResponse(response);
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
      verified: response.verified !== false || !!response.already_processed,
      chargeStatus: response.status,
    };
  },
};

export default loansApi;
