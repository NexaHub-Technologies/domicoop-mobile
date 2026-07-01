import { authedRequest } from "../http";
import {
  transformDashboardSummary,
  ApiDashboardSummary,
  DashboardSummary,
} from "../types/dashboard";

export const dashboard = {
  getSummary: async (): Promise<DashboardSummary> => {
    const raw = await authedRequest<ApiDashboardSummary>("/dashboard/summary", {
      method: "GET",
    });
    return transformDashboardSummary(raw);
  },
};

export default dashboard;
