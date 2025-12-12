export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: Date;
  dueDate: Date;
  caseNumber: string;
  caseId: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  lineItems: InvoiceLineItem[];
  paymentDate?: Date;
  description?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface BillingSummary {
  totalEarnings: number;
  totalInvoiced: number;
  pendingPayments: number;
  paidThisMonth: number;
}
