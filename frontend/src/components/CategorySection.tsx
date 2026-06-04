import { StyleSheet, Text, View } from "react-native";
import type { Bill, Category } from "../types";
import { CATEGORY_CONFIG } from "../utils/constants";
import BillCard from "./BillCard";

interface CategorySectionProps {
  category: Category;
  bills: Bill[];
  onBillPress?: (bill: Bill) => void;
}

export default function CategorySection({
  category,
  bills,
  onBillPress,
}: CategorySectionProps) {
  const config = CATEGORY_CONFIG[category];
  const total = bills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <View style={[styles.container, { borderLeftColor: config.color }]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{config.emoji}</Text>
        <Text style={[styles.title, { color: config.color }]}>
          {config.label}
        </Text>
        <Text style={styles.total}>${total.toFixed(2)}/mo</Text>
      </View>
      {bills.length === 0 ? (
        <Text style={styles.empty}>No bills yet</Text>
      ) : (
        bills.map((bill) => (
          <BillCard key={bill.id} bill={bill} onPress={onBillPress} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  emoji: { fontSize: 20, marginRight: 8 },
  title: { fontSize: 16, fontWeight: "700", flex: 1 },
  total: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  empty: { fontSize: 14, color: "#9CA3AF", textAlign: "center", paddingVertical: 12 },
});
