export type Category = "home" | "personal" | "subscriptions";

export type Frequency = "once" | "weekly" | "monthly" | "yearly";

export type InsightStatus = "active" | "applied" | "dismissed";

export interface Bill {
  id: string;
  category: Category;
  bill_type: string;
  provider: string;
  amount: number;
  billing_date: string;
  frequency: Frequency;
  is_agent_allowed: boolean;
  created_at: string;
}

export interface BillCreate {
  category: Category;
  bill_type: string;
  provider: string;
  amount: number;
  billing_date: string;
  frequency: Frequency;
  is_agent_allowed?: boolean;
}

export interface Reminder {
  id: string;
  bill_id: string;
  days_before: number;
  is_sent: boolean;
  last_triggered: string | null;
}

export interface AgentInsight {
  id: string;
  bill_id: string;
  potential_savings: number;
  finding_details: string;
  action_script: string | null;
  status: InsightStatus;
}
