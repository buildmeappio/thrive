import { Invoice, BillingSummary } from "../types";

// Mock billing summary data
export const mockBillingSummary: BillingSummary = {
  totalEarnings: 0.0,
  totalInvoiced: 0.0,
  pendingPayments: 0.0,
  paidThisMonth: 0.0,
};

// Mock invoices data
export const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    date: new Date("2024-01-15"),
    dueDate: new Date("2024-02-15"),
    caseNumber: "TRV-2041",
    caseId: "case-1",
    amount: 2500.0,
    status: "paid",
    paymentDate: new Date("2024-01-20"),
    lineItems: [
      {
        description: "IME Examination Fee",
        quantity: 1,
        rate: 2000.0,
        amount: 2000.0,
      },
      {
        description: "Record Review Fee",
        quantity: 1,
        rate: 500.0,
        amount: 500.0,
      },
    ],
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    date: new Date("2024-01-20"),
    dueDate: new Date("2024-02-20"),
    caseNumber: "TRV-2037",
    caseId: "case-2",
    amount: 1800.0,
    status: "paid",
    paymentDate: new Date("2024-01-25"),
    lineItems: [
      {
        description: "IME Examination Fee",
        quantity: 1,
        rate: 1500.0,
        amount: 1500.0,
      },
      {
        description: "Record Review Fee",
        quantity: 1,
        rate: 300.0,
        amount: 300.0,
      },
    ],
  },
  {
    id: "3",
    invoiceNumber: "INV-2024-003",
    date: new Date("2024-02-01"),
    dueDate: new Date("2024-03-01"),
    caseNumber: "TRV-2045",
    caseId: "case-3",
    amount: 3200.0,
    status: "pending",
    lineItems: [
      {
        description: "IME Examination Fee",
        quantity: 1,
        rate: 2500.0,
        amount: 2500.0,
      },
      {
        description: "Record Review Fee",
        quantity: 1,
        rate: 500.0,
        amount: 500.0,
      },
      {
        description: "Additional Consultation",
        quantity: 2,
        rate: 100.0,
        amount: 200.0,
      },
    ],
  },
  {
    id: "4",
    invoiceNumber: "INV-2024-004",
    date: new Date("2024-02-10"),
    dueDate: new Date("2024-03-10"),
    caseNumber: "TRV-2048",
    caseId: "case-4",
    amount: 1500.0,
    status: "pending",
    lineItems: [
      {
        description: "IME Examination Fee",
        quantity: 1,
        rate: 1200.0,
        amount: 1200.0,
      },
      {
        description: "Record Review Fee",
        quantity: 1,
        rate: 300.0,
        amount: 300.0,
      },
    ],
  },
  {
    id: "5",
    invoiceNumber: "INV-2024-005",
    date: new Date("2024-01-05"),
    dueDate: new Date("2024-02-05"),
    caseNumber: "TRV-2020",
    caseId: "case-5",
    amount: 2750.0,
    status: "overdue",
    lineItems: [
      {
        description: "IME Examination Fee",
        quantity: 1,
        rate: 2200.0,
        amount: 2200.0,
      },
      {
        description: "Record Review Fee",
        quantity: 1,
        rate: 400.0,
        amount: 400.0,
      },
      {
        description: "Cancellation Fee",
        quantity: 1,
        rate: 150.0,
        amount: 150.0,
      },
    ],
  },
  {
    id: "6",
    invoiceNumber: "INV-2024-006",
    date: new Date("2024-02-15"),
    dueDate: new Date("2024-03-15"),
    caseNumber: "TRV-2050",
    caseId: "case-6",
    amount: 4200.0,
    status: "paid",
    paymentDate: new Date("2024-02-18"),
    lineItems: [
      {
        description: "IME Examination Fee",
        quantity: 1,
        rate: 3500.0,
        amount: 3500.0,
      },
      {
        description: "Record Review Fee",
        quantity: 1,
        rate: 500.0,
        amount: 500.0,
      },
      {
        description: "Extended Consultation",
        quantity: 1,
        rate: 200.0,
        amount: 200.0,
      },
    ],
  },
  {
    id: "7",
    invoiceNumber: "INV-2024-007",
    date: new Date("2024-02-20"),
    dueDate: new Date("2024-03-20"),
    caseNumber: "TRV-2052",
    caseId: "case-7",
    amount: 1950.0,
    status: "pending",
    lineItems: [
      {
        description: "IME Examination Fee",
        quantity: 1,
        rate: 1600.0,
        amount: 1600.0,
      },
      {
        description: "Record Review Fee",
        quantity: 1,
        rate: 350.0,
        amount: 350.0,
      },
    ],
  },
];
