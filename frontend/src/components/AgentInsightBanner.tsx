import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { AgentInsight } from "../types";

interface AgentInsightBannerProps {
  insight: AgentInsight;
  onDismiss?: (id: string) => void;
  onPress?: (insight: AgentInsight) => void;
}

export default function AgentInsightBanner({
  insight,
  onDismiss,
  onPress,
}: AgentInsightBannerProps) {
  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={() => onPress?.(insight)}
      activeOpacity={0.85}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>🤖</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Save ${insight.potential_savings.toFixed(2)}/yr
          </Text>
          <Text style={styles.detail} numberOfLines={2}>
            {insight.finding_details}
          </Text>
        </View>
      </View>
      {onDismiss && (
        <TouchableOpacity
          style={styles.dismiss}
          onPress={() => onDismiss(insight.id)}
        >
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#7C3AED",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: { flexDirection: "row", alignItems: "center", flex: 1 },
  icon: { fontSize: 28, marginRight: 12 },
  textContainer: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  detail: { fontSize: 13, color: "#E9D5FF", marginTop: 4 },
  dismiss: { padding: 4, marginLeft: 8 },
  dismissText: { color: "#E9D5FF", fontSize: 16, fontWeight: "600" },
});
