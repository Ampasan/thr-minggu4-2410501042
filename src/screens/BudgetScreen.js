import { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BarChart } from "react-native-chart-kit";

import { useTheme } from "../context/ThemeContext";
import { useBudgetContext } from "../context/BudgetContext";

import Button from "../components/Button";
import Input from "../components/Input";
import ProgressBar from "../components/ProgressBar";

function formatIDR(n) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return `Rp ${v.toLocaleString("id-ID")}`;
}

function CategoryChips({ categories, selected, onSelect, colors }) {
  return (
    <View style={styles.chipsWrap}>
      {categories.map((c) => {
        const active = c === selected;
        return (
          <Pressable
            key={c}
            onPress={() => onSelect(c)}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: active
                  ? "rgba(15,157,88,0.12)"
                  : colors.surface,
                borderColor: active ? colors.emerald : colors.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: active ? colors.emerald : colors.text },
              ]}
            >
              {c}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ExpenseItem({ item, onDelete, colors }) {
  return (
    <View
      style={[
        styles.itemCard,
        { borderColor: colors.border, backgroundColor: colors.surface },
      ]}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.itemDot, { backgroundColor: colors.gold }]} />
        <View>
          <Text style={[styles.itemCategory, { color: colors.text }]}>
            {item.category}
          </Text>
          <Text style={[styles.itemAmount, { color: colors.muted }]}>
            {formatIDR(item.amount)}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => onDelete(item.id)}
        style={({ pressed }) => [
          styles.deleteBtn,
          {
            borderColor: colors.border,
            backgroundColor: colors.surface,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Ionicons name="trash-outline" size={18} color={colors.gold} />
      </Pressable>
    </View>
  );
}

export default function BudgetScreen() {
  const { colors } = useTheme();
  const {
    items,
    categories,
    chart,
    byCategory,
    totalBudget,
    totalSpent,
    remainingBudget,
    usageRatio,
    addExpense,
    deleteExpense,
    setBudgetLimit,
  } = useBudgetContext();

  const [category, setCategory] = useState(categories?.[0] ?? "BBM");
  const [amount, setAmount] = useState("");
  const [budgetLimitText, setBudgetLimitText] = useState(
    totalBudget ? String(totalBudget) : "",
  );

  useEffect(() => {
    setBudgetLimitText(totalBudget ? String(totalBudget) : "");
  }, [totalBudget]);

  const canAdd = useMemo(() => amount.trim().length > 0, [amount]);

  const chartWidth = Dimensions.get("window").width - 32;
  const chartData = useMemo(() => {
    const hasAny = byCategory?.some((x) => (x.amount || 0) > 0);
    if (hasAny) return chart;
    return {
      labels: categories,
      datasets: [{ data: categories.map(() => 0) }],
    };
  }, [byCategory, categories, chart]);

  const chartInnerWidth = useMemo(() => {
    const labelCount = chartData?.labels?.length ?? 0;
    const minWidth = chartWidth;
    const dynamicWidth = Math.max(minWidth, labelCount * 60);
    return dynamicWidth;
  }, [chartData, chartWidth]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        style={{ flex: 1, marginTop: 12 }}
        data={items}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ paddingBottom: 90 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Ionicons name="wallet-outline" size={22} color={colors.gold} />
              <Text style={[styles.title, { color: colors.text }]}>
                Pengeluaran Mudik
              </Text>
            </View>

            <View
              style={[
                styles.summaryCard,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
            >
              <View style={styles.patternOverlay} pointerEvents="none" />

              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Ringkasan
              </Text>
              <View style={styles.summaryRow}>
                <View style={styles.summaryCol}>
                  <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                    Anggaran
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {formatIDR(totalBudget)}
                  </Text>
                </View>
                <View style={styles.summaryCol}>
                  <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                    Terpakai
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.text }]}>
                    {formatIDR(totalSpent)}
                  </Text>
                </View>
                <View style={styles.summaryCol}>
                  <Text style={[styles.summaryLabel, { color: colors.muted }]}>
                    Sisa
                  </Text>
                  <Text
                    style={[styles.summaryValue, { color: colors.emerald }]}
                  >
                    {formatIDR(remainingBudget)}
                  </Text>
                </View>
              </View>

              <View style={styles.budgetLimitRow}>
                <Input
                  value={budgetLimitText}
                  onChangeText={setBudgetLimitText}
                  placeholder="Set Anggaran (contoh: 3000000)"
                  keyboardType="numeric"
                  containerStyle={{ flex: 1 }}
                />
                <Button
                  disabled={budgetLimitText.trim().length === 0}
                  onPress={() => setBudgetLimit(budgetLimitText)}
                  title=""
                  left={
                    <Ionicons
                      name="save-outline"
                      size={18}
                      color={colors.white}
                    />
                  }
                  style={styles.iconBtn}
                />
              </View>
            </View>

            <View
              style={[
                styles.progressCard,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
            >
              <View style={styles.progressRow}>
                <Text style={[styles.progressTitle, { color: colors.text }]}>
                  Pemakaian Anggaran
                </Text>
                <Text style={[styles.progressPct, { color: colors.gold }]}>
                  {Math.round((usageRatio || 0) * 100)}%
                </Text>
              </View>
              <ProgressBar value={usageRatio || 0} style={{ marginTop: 10 }} />
              <Text style={[styles.progressHint, { color: colors.muted }]}>
                Catat rapi, mudik lebih tenang.
              </Text>
            </View>

            <View
              style={[
                styles.card,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Tambah pengeluaran
              </Text>
              <CategoryChips
                categories={categories}
                selected={category}
                onSelect={setCategory}
                colors={colors}
              />

              <View style={styles.addRow}>
                <Input
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Nominal (contoh: 50000)"
                  keyboardType="numeric"
                  containerStyle={{ flex: 1 }}
                />
                <Button
                  disabled={!canAdd}
                  onPress={() => {
                    addExpense(category, amount);
                    setAmount("");
                  }}
                  title=""
                  left={<Ionicons name="add" size={18} color={colors.white} />}
                  style={styles.iconBtn}
                />
              </View>
            </View>

            <View
              style={[
                styles.chartCard,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Chart Pengeluaran
              </Text>
              <Text style={[styles.chartHint, { color: colors.muted }]}>
                Geser kiri/kanan untuk lihat semua kategori.
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                contentContainerStyle={{ paddingRight: 6 }}
              >
                <BarChart
                  data={chartData}
                  width={chartInnerWidth}
                  height={220}
                  fromZero
                  yAxisLabel="Rp "
                  chartConfig={{
                    backgroundGradientFrom: colors.surface,
                    backgroundGradientTo: colors.surface,
                    decimalPlaces: 0,
                    color: () => colors.emerald,
                    labelColor: () => colors.muted,
                    propsForBackgroundLines: { stroke: colors.border },
                  }}
                  style={styles.chart}
                />
              </ScrollView>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.empty, { color: colors.muted }]}>
              Belum ada pengeluaran.
            </Text>
            <Text style={[styles.emptySub, { color: colors.muted }]}>
              Pilih kategori, masukkan nominal, lalu tekan tambah.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ExpenseItem item={item} onDelete={deleteExpense} colors={colors} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginLeft: 10,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  patternOverlay: {
    position: "absolute",
    inset: -20,
    backgroundColor: "rgba(201,162,39,0.06)",
    transform: [{ rotate: "15deg" }],
  },
  summaryRow: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "space-between",
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  summaryValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "900",
  },
  budgetLimitRow: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  progressCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  progressPct: {
    fontSize: 14,
    fontWeight: "900",
  },
  progressHint: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
  },

  card: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontWeight: "800",
    fontSize: 12,
  },
  addRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  iconBtn: {
    width: 44,
    height: 44,
    paddingHorizontal: 0,
    borderRadius: 14,
    marginLeft: 6,
  },

  chartCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  chart: {
    marginTop: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  chartHint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
  },

  emptyWrap: {
    paddingVertical: 24,
    alignItems: "center",
  },
  empty: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptySub: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },

  itemCard: {
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  itemDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  itemCategory: {
    fontSize: 14,
    fontWeight: "900",
  },
  itemAmount: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
