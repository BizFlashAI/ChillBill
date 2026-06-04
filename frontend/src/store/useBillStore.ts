import { create } from "zustand";
import type { AgentInsight, Bill, BillCreate } from "../types";
import { agentApi, billsApi, insightsApi } from "../services/api";

interface BillStore {
  bills: Bill[];
  insights: AgentInsight[];
  loading: boolean;
  error: string | null;

  fetchBills: () => Promise<void>;
  addBill: (bill: BillCreate) => Promise<void>;
  updateBill: (id: string, bill: Partial<BillCreate>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  fetchInsights: () => Promise<void>;
  dismissInsight: (id: string) => Promise<void>;
  runAgent: (billId: string) => Promise<void>;
  agentRunning: string | null;
}

export const useBillStore = create<BillStore>((set, get) => ({
  bills: [],
  insights: [],
  loading: false,
  error: null,
  agentRunning: null,

  fetchBills: async () => {
    set({ loading: true, error: null });
    try {
      const bills = await billsApi.getAll();
      set({ bills, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to fetch bills",
        loading: false,
      });
    }
  },

  addBill: async (bill: BillCreate) => {
    set({ loading: true, error: null });
    try {
      const newBill = await billsApi.create(bill);
      set({ bills: [...get().bills, newBill], loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to add bill",
        loading: false,
      });
    }
  },

  updateBill: async (id: string, bill: Partial<BillCreate>) => {
    set({ loading: true, error: null });
    try {
      const updated = await billsApi.update(id, bill);
      set({
        bills: get().bills.map((b) => (b.id === id ? updated : b)),
        loading: false,
      });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to update bill",
        loading: false,
      });
    }
  },

  deleteBill: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await billsApi.delete(id);
      set({
        bills: get().bills.filter((b) => b.id !== id),
        loading: false,
      });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Failed to delete bill",
        loading: false,
      });
    }
  },

  fetchInsights: async () => {
    try {
      const insights = await insightsApi.getActive();
      set({ insights });
    } catch {
      // Silently fail — insights are supplementary
    }
  },

  dismissInsight: async (id: string) => {
    try {
      await insightsApi.updateStatus(id, "dismissed");
      set({ insights: get().insights.filter((i) => i.id !== id) });
    } catch {
      // Silently fail
    }
  },

  runAgent: async (billId: string) => {
    set({ agentRunning: billId });
    try {
      await agentApi.runForBill(billId);
      // Wait briefly for background task to complete, then refresh insights
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const insights = await insightsApi.getActive();
      set({ insights, agentRunning: null });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Agent run failed",
        agentRunning: null,
      });
    }
  },
}));
