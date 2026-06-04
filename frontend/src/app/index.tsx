import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { useBillStore } from "../store/useBillStore";
import { useAuthStore } from "../store/useAuthStore";
import type { Bill, Category } from "../types";
import CategorySection from "../components/CategorySection";
import AgentInsightBanner from "../components/AgentInsightBanner";

const CATEGORIES: Category[] = ["home", "personal", "subscriptions"];

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { bills, insights, loading, fetchBills, fetchInsights, dismissInsight } =
    useBillStore();

  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchBills();
        fetchInsights();
      }
    }, [user, fetchBills, fetchInsights])
  );

  const billsByCategory = useMemo(() => {
    const grouped: Record<Category, Bill[]> = {
      home: [],
      personal: [],
      subscriptions: [],
    };
    for (const bill of bills) {
      if (bill.category in grouped) {
        grouped[bill.category].push(bill);
      }
    }
    return grouped;
  }, [bills]);

  const totalMonthly = useMemo(
    () => bills.reduce((sum, b) => sum + b.amount, 0),
    [bills]
  );

  if (!user) return <Redirect href="/login" />;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              fetchBills();
              fetchInsights();
            }}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.appName}>ChillBill</Text>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>{user.email}</Text>
        </View>

        {/* Total Monthly */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Monthly Burden</Text>
          <Text style={styles.totalAmount}>${totalMonthly.toFixed(2)}</Text>
        </View>

        {/* Agent Insights */}
        {insights.map((insight) => (
          <AgentInsightBanner
            key={insight.id}
            insight={insight}
            onDismiss={dismissInsight}
          />
        ))}

        {/* Loading */}
        {loading && bills.length === 0 && (
          <ActivityIndicator size="large" style={{ marginVertical: 40 }} />
        )}

        {/* Category Sections */}
        {CATEGORIES.map((cat) => (
          <CategorySection
            key={cat}
            category={cat}
            bills={billsByCategory[cat]}
          />
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add-bill")}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scroll: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  appName: { fontSize: 28, fontWeight: "800", color: "#111827" },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  logoutBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  logoutText: { color: "#DC2626", fontSize: 14, fontWeight: "600" },
  totalCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  totalLabel: { fontSize: 14, color: "#9CA3AF" },
  totalAmount: { fontSize: 36, fontWeight: "800", color: "#FFFFFF", marginTop: 4 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { fontSize: 28, color: "#FFFFFF", fontWeight: "300", marginTop: -2 },
});
