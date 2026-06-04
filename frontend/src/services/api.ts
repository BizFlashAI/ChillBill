import axios from "axios";
import type { AgentInsight, Bill, BillCreate, Category } from "../types";
import { API_BASE_URL } from "../utils/constants";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const billsApi = {
  getAll: async (category?: Category): Promise<Bill[]> => {
    const params = category ? { category } : {};
    const { data } = await client.get<Bill[]>("/api/v1/bills", { params });
    return data;
  },

  getById: async (id: string): Promise<Bill> => {
    const { data } = await client.get<Bill>(`/api/v1/bills/${id}`);
    return data;
  },

  create: async (bill: BillCreate): Promise<Bill> => {
    const { data } = await client.post<Bill>("/api/v1/bills", bill);
    return data;
  },

  update: async (id: string, bill: Partial<BillCreate>): Promise<Bill> => {
    const { data } = await client.put<Bill>(`/api/v1/bills/${id}`, bill);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/api/v1/bills/${id}`);
  },
};

export const insightsApi = {
  getActive: async (): Promise<AgentInsight[]> => {
    const { data } = await client.get<AgentInsight[]>("/api/v1/insights", {
      params: { status: "active" },
    });
    return data;
  },

  updateStatus: async (
    id: string,
    status: "applied" | "dismissed"
  ): Promise<AgentInsight> => {
    const { data } = await client.patch<AgentInsight>(
      `/api/v1/insights/${id}`,
      { status }
    );
    return data;
  },
};
