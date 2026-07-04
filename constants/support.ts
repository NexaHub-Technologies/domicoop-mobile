// Support screen static content (extracted from the retired data/mockData.ts).

export interface FAQ {
  id: string;
  icon: string;
  question: string;
  answer: string;
}

export const faqData: FAQ[] = [
  {
    id: "faq-001",
    icon: "card-membership",
    question: "Membership eligibility & benefits",
    answer:
      "DOMICOOP membership is open to all residents. Benefits include access to low-interest loans, community savings programs, and exclusive financial literacy workshops.",
  },
  {
    id: "faq-002",
    icon: "payments",
    question: "How do I apply for a loan?",
    answer:
      "Navigate to the 'Loans' tab in the bottom bar, select 'New Application', and follow the prompts. You'll need to provide identity verification and income statements for processing.",
  },
  {
    id: "faq-003",
    icon: "schedule",
    question: "Payment methods and schedules",
    answer:
      "Payments are typically processed on the 1st and 15th of each month. We support bank transfers, mobile money, and direct debit from your DOMICOOP wallet.",
  },
  {
    id: "faq-004",
    icon: "account-balance-wallet",
    question: "Loan repayment options",
    answer:
      "You can make partial or full repayments at any time without penalties. Early repayment discounts are available for qualifying members.",
  },
  {
    id: "faq-005",
    icon: "savings",
    question: "Savings contribution rules",
    answer:
      "Members are encouraged to contribute a minimum of ₦10,000 monthly. Higher contributions unlock better loan rates and increased borrowing limits.",
  },
  {
    id: "faq-006",
    icon: "security",
    question: "Account security best practices",
    answer:
      "Enable two-factor authentication, use strong passwords, and never share your login credentials. We also recommend reviewing your login history regularly.",
  },
  {
    id: "faq-007",
    icon: "edit-note",
    question: "How to update personal information",
    answer:
      "Go to Profile > Edit Account Details to update your name, email, phone number, and profile picture. Changes are reflected immediately.",
  },
];
