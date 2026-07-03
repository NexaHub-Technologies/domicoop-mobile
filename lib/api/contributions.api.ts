import { authedRequest } from "@/lib/http";
import {
  Contribution,
  GetContributionsParams,
  ContributionListResponse,
  VerifyContributionInput,
  VerifyContributionResponse,
  ApiContributionsResponse,
  ApiContribution,
  transformContributionsResponse,
  transformContribution,
} from "@/lib/types/contributions";

export const contributionsApi = {
  getMyContributions: async (
    params?: GetContributionsParams,
  ): Promise<ContributionListResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.year) queryParams.append("year", params.year.toString());
    if (params?.month) queryParams.append("month", params.month);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";

    const rawResponse = await authedRequest<ApiContributionsResponse>(
      `/contributions/me${query}`,
    );

    return transformContributionsResponse(rawResponse);
  },

  getContribution: async (id: string): Promise<Contribution> => {
    const response = await authedRequest<ApiContribution>(`/contributions/${id}`);
    return transformContribution(response);
  },

  /**
   * Server-side payment verification: the API confirms the reference with
   * Paystack and creates the contribution from the verified transaction.
   * `verified: false` means the charge hasn't settled yet — safe to retry.
   */
  verifyContribution: async (
    data: VerifyContributionInput,
  ): Promise<{
    verified: boolean;
    chargeStatus?: string;
    contribution: Contribution | null;
  }> => {
    const response = await authedRequest<VerifyContributionResponse>(
      "/contributions/verify",
      { method: "POST", body: data },
    );
    return {
      verified: response.verified || !!response.already_processed,
      chargeStatus: response.status,
      contribution: response.contribution
        ? transformContribution(response.contribution)
        : null,
    };
  },
};
