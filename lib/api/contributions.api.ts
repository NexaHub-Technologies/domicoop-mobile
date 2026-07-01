import { authedRequest } from "@/lib/http";
import {
  Contribution,
  GetContributionsParams,
  ContributionListResponse,
  StoreVerifiedContributionInput,
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

  storeVerifiedContribution: async (
    data: StoreVerifiedContributionInput,
  ): Promise<Contribution> => {
    const response = await authedRequest<ApiContribution>("/contributions", {
      method: "POST",
      body: data,
    });
    return transformContribution(response);
  },
};
