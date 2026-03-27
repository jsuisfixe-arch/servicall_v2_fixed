import type { customerInvoices } from "../../drizzle/schema";

export interface Subscription {
  id: string;
  status: string;
  plan: string;
  tenantId: number;
  callsIncluded?: number;
  agentSeats?: number;
  createdAt?: string;
  stripeCustomerId?: string;
  renewalDate?: string;
}

export type Invoice = typeof customerInvoices.$inferSelect;

export interface BillingStats {
  totalRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  averageInvoiceAmount: number;
}

export interface UsageStats {
  totalCalls: number;
  callsInPeriod: number;
  totalDuration: number;
  averageDuration: number;
  plan: string;
  callsIncluded: number;
  callsRemaining: number;
  usagePercentage: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  callsIncluded: number;
  agentSeats: number;
  features: string[];
}
