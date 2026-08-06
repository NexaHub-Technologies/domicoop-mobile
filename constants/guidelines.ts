export interface Guideline {
  id: number;
  text: string;
}

export const GUIDELINES: Guideline[] = [
  {
    id: 1,
    text: "Registration fee is ₦20,000, compulsory for new intake (non-refundable).",
  },
  {
    id: 2,
    text: "No payment through USSD/POS.",
  },
  {
    id: 3,
    text: "No third-party payment (another person's account).",
  },
  {
    id: 4,
    text: "Your payment should carry the name you used in your registration.",
  },
  {
    id: 5,
    text: "Compulsory payment of ₦1,000 together with your subscription (₦1,000 for socials/end-of-year souvenir).",
  },
  {
    id: 6,
    text: "We have a cooperative wrapper with a cost of ₦6,000, which will be paid together with the registration fee.",
  },
  {
    id: 7,
    text: "The least payment is ₦5,000.",
  },
  {
    id: 8,
    text: "Any payment above ₦50,000 will be posted to your deposit column.",
  },
  {
    id: 9,
    text: "No random payment like ₦12,000, ₦18,000, ₦22,000.",
  },
  {
    id: 10,
    text: "If you want to exit the cooperative, you must give 6 months' notice with a written letter.",
  },
  {
    id: 11,
    text: "If you want to increase your contribution, you should write to the cooperative informing them of your increase through the chairperson.",
  },
  {
    id: 12,
    text: "As a new member, if you fail to pay your dues for at least 3 months, you are automatically on your way to withdrawal at the end of the year.",
  },
  {
    id: 13,
    text: "Consistent payment for 6 months qualifies you for a loan of 3 times what you have, at an interest rate of 10%, repayable within one year.",
  },
  {
    id: 14,
    text: "Once you are on loan and repaying as agreed, you are entitled to sign for one person as a guarantor.",
  },
  {
    id: 15,
    text: "If you are not intending to collect a loan, you can sign for two persons.",
  },
  {
    id: 16,
    text: "If you guarantee someone and the person defaults, your money will be held until that person pays.",
  },
  {
    id: 17,
    text: "If you guarantee someone and the person is not repaying as agreed, at the end of the year your dividend will be placed on hold, and by the end of the first quarter of the following year the cooperative will draw from your assets. (Know who you are signing for very well.)",
  },
  {
    id: 18,
    text: "Guarantee only someone you are sure of.",
  },
  {
    id: 19,
    text: "Your guarantor must be in the cooperative.",
  },
  {
    id: 20,
    text: "To resolve issues with your account caused by wrong payment (POS or third-party account), you will pay a fee of ₦5,000.",
  },
  {
    id: 21,
    text: "There is a late payment fee of ₦500.",
  },
  {
    id: 22,
    text: "For any issues relating to loans, cloth, purchasing of items, etc., go to the office.",
  },
  {
    id: 23,
    text: "After filling your form, submit it back to the office.",
  },
  {
    id: 24,
    text: "At the end of the year, your dividend for the year will be paid.",
  },
  {
    id: 25,
    text: "Meetings are held three times in a year (that's every four months).",
  },
  {
    id: 26,
    text: "The WhatsApp group is for cooperative matters only. Anything unrelated to cooperative matters may result in removal from the group.",
  },
  {
    id: 27,
    text: "If you fail to pay your foodstuff balance by the 4th month, the money will be deducted from your share capital.",
  },
  {
    id: 28,
    text: "Your share capital will determine your foodstuff buying.",
  },
  {
    id: 29,
    text: "From 2027, the reloan interest increases to 15%.",
  },
  {
    id: 30,
    text: "From 2027, a ₦2,000 fee is attached to late payment of subscription.",
  },
  {
    id: 31,
    text: "The maximum loan given to members is ₦10 million, even if you qualify for more.",
  },
  {
    id: 32,
    text: "If you are collecting from your savings, you can withdraw 70% with one month's notice.",
  },
  {
    id: 33,
    text: "If you are collecting from your deposit, you must write to the cooperative with one month's notice.",
  },
  {
    id: 34,
    text: "From 2027, the loan form cost ₦2,000.",
  },
  {
    id: 35,
    text: "If you do not subscribe for 3 months, your money will be returned to you after the office charge of 5% on your total assets at the end of the year. The 5% office charge applies to any member withdrawing either self withdrawal or by the cooperative.",
  },
];

// Curated subset shown on the condensed, every-login acknowledgment gate:
// registration fee, exit notice, loan/interest terms, guarantor default
// consequences, and the late-payment fee — the rules members most need a
// standing reminder of. The full list remains one tap away.
const GUIDELINE_HIGHLIGHT_IDS = [1, 10, 13, 16, 21];

export const GUIDELINE_HIGHLIGHTS: Guideline[] = GUIDELINES.filter((guideline) =>
  GUIDELINE_HIGHLIGHT_IDS.includes(guideline.id),
);
