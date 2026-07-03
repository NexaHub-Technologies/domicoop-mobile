// Transaction display config (extracted from the retired data/mockData.ts).

export type TransactionType =
  | "contribution"
  | "interest"
  | "loan_repayment"
  | "fee"
  | "withdrawal";
export type TransactionCategory = "savings" | "loan";
export type TransactionStatus = "completed" | "pending" | "automated";

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  title: string;
  date: string;
  time: string;
  amount: number;
  status: TransactionStatus;
  loanId?: string;
}

export const getTransactionIcon = (type: TransactionType): string => {
  switch (type) {
    case "contribution":
      return "trending-up";
    case "interest":
      return "stars";
    case "loan_repayment":
      return "keyboard-double-arrow-right";
    case "fee":
      return "history-edu";
    case "withdrawal":
      return "payments";
    default:
      return "receipt";
  }
};


export const getDefaultTitle = (type: string, date: string): string => {
  switch (type) {
    case "contribution":
      return "Monthly Contribution";
    case "interest":
      return "Interest Credited";
    case "loan_repayment":
      return "Loan Repayment";
    case "fee":
      return "Processing Fee";
    case "withdrawal":
      return "Withdrawal";
    default: {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  }
};

