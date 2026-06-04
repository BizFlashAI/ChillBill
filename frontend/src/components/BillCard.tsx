import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Bill } from "../types";

interface BillCardProps {
  bill: Bill;
  onPress?: (bill: Bill) => void;
}

function getDaysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getBadgeStyle(daysUntil: number) {
  if (daysUntil < 0) return { bg: "#FEE2E2", text: "#DC2626", label: "Overdue" };
  if (daysUntil <= 3) return { bg: "#FEF3C7", text: "#D97706", label: `${daysUntil}d` };
  if (daysUntil <= 7) return { bg: "#DBEAFE", text: "#2563EB", label: `${daysUntil}d` };
  return { bg: "#D1FAE5", text: "#059669", label: `${daysUntil}d` };
}

export default function BillCard({ bill, onPress }: BillCardProps) {
  const daysUntil = getDaysUntil(bill.billing_date);
  const badge = getBadgeStyle(daysUntil);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(bill)}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Text style={styles.provider}>{bill.provider}</Text>
        <Text style={styles.billType}>{bill.bill_type}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>${bill.amount.toFixed(2)}</Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  left: { flex: 1 },
  provider: { fontSize: 16, fontWeight: "600", color: "#111827" },
  billType: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  right: { alignItems: "flex-end" },
  amount: { fontSize: 18, fontWeight: "700", color: "#111827" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
});
