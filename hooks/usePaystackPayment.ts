import { usePaystack } from 'react-native-paystack-webview';
import { members } from "@/lib/api/members.api";
import { session } from '@/lib/session';

export interface PaymentParams {
  amount: number;
  email?: string;
  reference?: string;
  metadata?: Record<string, any>;
  // Payment verification happens server-side (the API confirms the reference
  // with Paystack) — the client only learns that checkout completed.
  onSuccess?: (response: PaystackResponse) => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
}

export interface PaystackResponse {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string | undefined;
}

export const usePaystackPayment = () => {
  const { popup } = usePaystack();

  const generateReference = (type: 'contribution' | 'loan' = 'contribution') => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `DOMI-${type.toUpperCase()}-${timestamp}-${random}`;
  };

  const initiateContributionPayment = async (params: PaymentParams & { contributionId?: string }) => {
    let userProfile;
    try {
      userProfile = await members.getProfile();
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      params.onError?.(new Error('Failed to fetch user information'));
      return;
    }

    const reference = params.reference || generateReference('contribution');
    const storedEmail = await session.getEmail();
    const email = params.email || storedEmail || '';

    popup.checkout({
      email,
      amount: params.amount,
      reference,
      metadata: {
        ...params.metadata,
        member_id: userProfile.member_no,
        member_name: userProfile.full_name,
        contribution_id: params.contributionId,
        custom_fields: [
          {
            display_name: 'Member Name',
            variable_name: 'member_name',
            value: userProfile.full_name,
          },
          {
            display_name: 'Member ID',
            variable_name: 'member_id',
            value: userProfile.member_no || 'N/A',
          },
          {
            display_name: 'Transaction Type',
            variable_name: 'transaction_type',
            value: 'Savings Contribution',
          },
          ...(params.metadata?.custom_fields || []),
        ],
      },
      onSuccess: (response: any) => {
        params.onSuccess?.(response);
      },
      onCancel: () => {
        params.onCancel?.();
      },
      onError: (error) => {
        console.error('Payment Error:', error);
        params.onError?.(error);
      },
    });
  };

  const initiateLoanPayment = async (params: PaymentParams & { loanId?: string }) => {
    let userProfile;
    try {
      userProfile = await members.getProfile();
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      params.onError?.(new Error('Failed to fetch user information'));
      return;
    }

    const reference = params.reference || generateReference('loan');
    const storedEmail = await session.getEmail();
    const email = params.email || storedEmail || '';

    popup.checkout({
      email,
      amount: params.amount,
      reference,
      metadata: {
        ...params.metadata,
        member_id: userProfile.member_no,
        member_name: userProfile.full_name,
        loan_id: params.loanId,
        custom_fields: [
          {
            display_name: 'Member Name',
            variable_name: 'member_name',
            value: userProfile.full_name,
          },
          {
            display_name: 'Member ID',
            variable_name: 'member_id',
            value: userProfile.member_no || 'N/A',
          },
          {
            display_name: 'Transaction Type',
            variable_name: 'transaction_type',
            value: 'Loan Repayment',
          },
          {
            display_name: 'Loan ID',
            variable_name: 'loan_id',
            value: params.loanId || 'N/A',
          },
          ...(params.metadata?.custom_fields || []),
        ],
      },
      onSuccess: (response: any) => {
        params.onSuccess?.(response);
      },
      onCancel: () => {
        params.onCancel?.();
      },
      onError: (error) => {
        console.error('Payment Error:', error);
        params.onError?.(error);
      },
    });
  };

  return {
    initiateContributionPayment,
    initiateLoanPayment,
    generateReference,
  };
};

export default usePaystackPayment;
