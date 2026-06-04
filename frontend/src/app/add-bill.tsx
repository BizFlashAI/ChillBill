import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useBillStore } from "../store/useBillStore";
import type { BillCreate, Category, Frequency } from "../types";
import { CATEGORY_CONFIG, FREQUENCY_OPTIONS } from "../utils/constants";

const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: "home", label: "Home", emoji: "🏠" },
  { key: "personal", label: "Personal", emoji: "💰" },
  { key: "subscriptions", label: "Subs", emoji: "📺" },
];

export default function AddBillScreen() {
  const router = useRouter();
  const { addBill } = useBillStore();

  const [category, setCategory] = useState<Category>("home");
  const [billType, setBillType] = useState("");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");
  const [billingDate, setBillingDate] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!billType.trim() || !provider.trim() || !amount.trim() || !billingDate.trim()) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }

    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(billingDate.trim())) {
      Alert.alert("Invalid Date", "Please enter date as YYYY-MM-DD.");
      return;
    }

    setSubmitting(true);
    try {
      const bill: BillCreate = {
        category,
        bill_type: billType.trim(),
        provider: provider.trim(),
        amount: parsedAmount,
        billing_date: billingDate.trim(),
        frequency,
      };
      await addBill(bill);
      router.back();
    } catch {
      Alert.alert("Error", "Failed to add bill. Is the server running?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Add a Bill</Text>

        {/* Category Picker */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.chip,
                category === cat.key && {
                  backgroundColor: CATEGORY_CONFIG[cat.key].color,
                },
              ]}
              onPress={() => setCategory(cat.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  category === cat.key && { color: "#FFFFFF" },
                ]}
              >
                {cat.emoji} {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Provider */}
        <Text style={styles.label}>Provider</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Comcast, Netflix"
          value={provider}
          onChangeText={setProvider}
          placeholderTextColor="#9CA3AF"
        />

        {/* Bill Type */}
        <Text style={styles.label}>Bill Type</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. internet, streaming"
          value={billType}
          onChangeText={setBillType}
          placeholderTextColor="#9CA3AF"
        />

        {/* Amount */}
        <Text style={styles.label}>Amount ($)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholderTextColor="#9CA3AF"
        />

        {/* Billing Date */}
        <Text style={styles.label}>Billing Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={billingDate}
          onChangeText={setBillingDate}
          placeholderTextColor="#9CA3AF"
        />

        {/* Frequency */}
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.chipRow}>
          {FREQUENCY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.chip,
                frequency === opt.value && { backgroundColor: "#111827" },
              ]}
              onPress={() => setFrequency(opt.value as Frequency)}
            >
              <Text
                style={[
                  styles.chipText,
                  frequency === opt.value && { color: "#FFFFFF" },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <Text style={styles.submitText}>
            {submitting ? "Adding..." : "Add Bill"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scroll: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: "800", color: "#111827", marginBottom: 24 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  chipText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  submitBtn: {
    backgroundColor: "#7C3AED",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
  },
  submitText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
});
