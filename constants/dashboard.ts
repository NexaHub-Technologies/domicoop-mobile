// Dashboard quick actions (extracted from the retired data/mockData.ts).

export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  route: string;
}


export const quickActions: QuickAction[] = [
  {
    id: "add contribution",
    icon: "add-circle",
    label: "Deposit",
    route: "/transactions/add-contribution",
  },
  {
    id: "apply",
    icon: "request-quote",
    label: "Apply",
    route: "/transactions/apply-for-loan",
  },
];

