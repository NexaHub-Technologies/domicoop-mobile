import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Paths, File, Directory } from "expo-file-system";
import { formatCurrencyNoSign } from "@/lib/utils/format";
import type { Transaction } from "@/constants/transactions";
import { getAllocationSummary } from "@/lib/utils/contributionAllocation";

export const generateReceiptHTML = (transaction: Transaction): string => {
  const amount = formatCurrencyNoSign(Math.abs(transaction.amount));
  const isContribution = transaction.amount > 0;
  const allocationSummary = isContribution
    ? getAllocationSummary(Math.abs(transaction.amount))
    : null;

  return /* html */ `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'Inter', sans-serif;
            background: #ffffff;
            padding: 40px;
            color: #0f172a;
          }

          .receipt {
            max-width: 600px;
            margin: 0 auto;
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            overflow: hidden;
          }

          .header {
            background: linear-gradient(135deg, #0b50da 0%, #003cad 100%);
            padding: 30px;
            text-align: center;
            color: white;
          }

          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 16px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: bold;
            color: #0b50da;
          }

          .company-name {
            font-size: 28px;
            font-weight: 800;
            margin-bottom: 4px;
          }

          .receipt-title {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 500;
          }

          .amount-section {
            background: #f8fafc;
            padding: 40px 30px;
            text-align: center;
            border-bottom: 2px dashed #e2e8f0;
          }

          .amount-label {
            font-size: 14px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
            font-weight: 600;
          }

          .amount-value {
            font-size: 48px;
            font-weight: 800;
            color: ${isContribution ? "#0b50da" : "#ef4444"};
            margin-bottom: 16px;
          }

          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 9999px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
          }

          .status-success {
            background: #dcfce7;
            color: #166534;
          }

          .status-pending {
            background: #fef3c7;
            color: #92400e;
          }

          .status-failed {
            background: #fee2e2;
            color: #991b1b;
          }

          .details-section {
            padding: 30px;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
          }

          .detail-row:last-child {
            border-bottom: none;
          }

          .detail-label {
            color: #64748b;
            font-size: 14px;
          }

          .detail-value {
            color: #0f172a;
            font-size: 14px;
            font-weight: 600;
          }

          .footer {
            background: #f8fafc;
            padding: 20px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }

          .footer-text {
            color: #94a3b8;
            font-size: 12px;
          }

          .allocation-section {
            padding: 30px;
            border-top: 2px dashed #e2e8f0;
          }

          .allocation-title {
            font-size: 14px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 16px;
            font-weight: 600;
          }

          .allocation-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
          }

          .allocation-row:last-child {
            border-bottom: none;
          }

          .allocation-label {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .allocation-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
          }

          .allocation-name {
            color: #0f172a;
            font-size: 14px;
            font-weight: 500;
          }

          .allocation-value {
            text-align: right;
          }

          .allocation-amount {
            color: #0f172a;
            font-size: 14px;
            font-weight: 600;
          }

          .allocation-percent {
            color: #64748b;
            font-size: 12px;
          }

          .allocation-total {
            display: flex;
            justify-content: space-between;
            padding-top: 12px;
            margin-top: 4px;
            border-top: 2px solid #e2e8f0;
          }

          .allocation-total-label {
            color: #0f172a;
            font-size: 14px;
            font-weight: 700;
          }

          .allocation-total-value {
            color: #0b50da;
            font-size: 18px;
            font-weight: 800;
          }

          .footer-note {
            color: #64748b;
            font-size: 11px;
            margin-top: 8px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo">D</div>
            <div class="company-name">DOMICOOP</div>
            <div class="receipt-title">Official Receipt</div>
          </div>

          <div class="amount-section">
            <div class="amount-label">Amount</div>
            <div class="amount-value">₦${amount}</div>
            <span class="status-badge status-${transaction.status}">${transaction.status}</span>
          </div>

          <div class="details-section">
            <div class="detail-row">
              <span class="detail-label">Transaction ID</span>
              <span class="detail-value">${transaction.id}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date</span>
              <span class="detail-value">${transaction.date || "N/A"}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type</span>
              <span class="detail-value">${transaction.type || "Contribution"}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Category</span>
              <span class="detail-value">${transaction.category || "Savings"}</span>
            </div>
          </div>

          ${
            allocationSummary
              ? `
          <div class="allocation-section">
            <div class="allocation-title">Allocation Breakdown</div>

            <div class="allocation-row">
              <div class="allocation-label">
                <span class="allocation-dot" style="background: #0b50da;"></span>
                <span class="allocation-name">Shares</span>
              </div>
              <div class="allocation-value">
                <div class="allocation-amount">₦${formatCurrencyNoSign(allocationSummary.allocation.shares)}</div>
                <div class="allocation-percent">${allocationSummary.percentages.shares.toFixed(1)}%</div>
              </div>
            </div>

            <div class="allocation-row">
              <div class="allocation-label">
                <span class="allocation-dot" style="background: #ea580c;"></span>
                <span class="allocation-name">Social</span>
              </div>
              <div class="allocation-value">
                <div class="allocation-amount">₦${formatCurrencyNoSign(allocationSummary.allocation.social)}</div>
                <div class="allocation-percent">${allocationSummary.percentages.social.toFixed(1)}%</div>
              </div>
            </div>

            <div class="allocation-row">
              <div class="allocation-label">
                <span class="allocation-dot" style="background: #22c55e;"></span>
                <span class="allocation-name">Savings</span>
              </div>
              <div class="allocation-value">
                <div class="allocation-amount">₦${formatCurrencyNoSign(allocationSummary.allocation.savings)}</div>
                <div class="allocation-percent">${allocationSummary.percentages.savings.toFixed(1)}%</div>
              </div>
            </div>

            <div class="allocation-row">
              <div class="allocation-label">
                <span class="allocation-dot" style="background: #f59e0b;"></span>
                <span class="allocation-name">Deposit</span>
              </div>
              <div class="allocation-value">
                <div class="allocation-amount">₦${formatCurrencyNoSign(allocationSummary.allocation.deposit)}</div>
                <div class="allocation-percent">${allocationSummary.percentages.deposit.toFixed(1)}%</div>
              </div>
            </div>

            <div class="allocation-total">
              <span class="allocation-total-label">Total Credited</span>
              <span class="allocation-total-value">₦${formatCurrencyNoSign(
                allocationSummary.allocation.shares +
                  allocationSummary.allocation.social +
                  allocationSummary.allocation.savings +
                  allocationSummary.allocation.deposit,
              )}</span>
            </div>
          </div>
          `
              : ""
          }

          <div class="footer">
            <div class="footer-text">Thank you for your patronage!</div>
            <div class="footer-note">This is an electronically generated receipt</div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const generateReceipt = async (transaction: Transaction): Promise<string> => {
  try {
    const html = generateReceiptHTML(transaction);

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (!uri) {
      throw new Error("Failed to generate PDF - no URI returned");
    }

    if (!Paths.document) {
      return uri;
    }

    const receiptName = `DOMICOOP-Receipt-${transaction.id}.pdf`;
    const sourceFile = new File(uri);

    if (!sourceFile.exists) {
      return uri;
    }

    const destinationFile = new File(Paths.document, receiptName);

    try {
      if (destinationFile.exists) {
        destinationFile.delete();
      }
      await sourceFile.copy(destinationFile);
      return destinationFile.uri;
    } catch (copyError) {
      return uri;
    }
  } catch (error) {
    console.error("Error generating receipt:", error);
    throw new Error("Failed to generate receipt: " + (error as Error).message);
  }
};

export const shareReceipt = async (receiptUri: string) => {
  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(receiptUri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Receipt",
        UTI: "com.adobe.pdf",
      });
    } else {
      throw new Error("Sharing is not available on this device");
    }
  } catch (error) {
    console.error("Error sharing receipt:", error);
    throw error;
  }
};

export const downloadReceipt = async (transaction: Transaction): Promise<string> => {
  const generatedUri = await generateReceipt(transaction);

  try {
    const savedDir = await Directory.pickDirectoryAsync();

    if (!savedDir) {
      return generatedUri;
    }

    const receiptName = `DOMICOOP-Receipt-${transaction.id}.pdf`;

    const destinationFile = savedDir.createFile(receiptName, "application/pdf");

    const sourceFile = new File(generatedUri);

    if (!sourceFile.exists) {
      throw new Error("Generated file does not exist");
    }

    const sourceContent = await sourceFile.bytes();
    destinationFile.write(sourceContent);

    return destinationFile.uri;
  } catch (error) {
    console.error("Error saving to external directory:", error);
    return generatedUri;
  }
};
