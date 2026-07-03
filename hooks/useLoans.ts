import { loansApi } from "@/lib/api/loans.api";
import type { Loan } from "@/lib/types/loans";
import { usePersistedQuery } from "./usePersistedQuery";

const CACHE_KEY = "cached_loans_response";

export function useLoans() {
  const query = usePersistedQuery<Loan[]>({
    queryKey: ["loans"],
    cacheKey: CACHE_KEY,
    queryFn: () => loansApi.getMyLoans(),
  });

  const loans = query.data ?? [];

  const totalDebt = loans.reduce((sum, loan) => sum + loan.remainingBalance, 0);

  const nextPayment = loans
    .filter((loan) => loan.status !== "completed" && loan.nextPayment.date)
    .map((loan) => loan.nextPayment)
    .sort((a, b) => a.daysLeft - b.daysLeft)[0] ?? null;

  return {
    loans,
    totalDebt,
    nextPayment,
    isLoading: query.isLoading,
    isRefreshing: query.isRefreshing,
    error: query.error,
    isOffline: query.isOffline,
    refresh: query.refresh,
  };
}
