import { useMemo } from "react";
import {
  Animated as RNAnimated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";

import { usePackingContext } from "../context/PackingContext";
import { useVisitsContext } from "../context/VisitsContext";
import { useBudgetContext } from "../context/BudgetContext";

import ProgressBar from "../components/ProgressBar";

function formatIDR(n) {
  const v = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return `Rp ${v.toLocaleString("id-ID")}`;
}

export default function DashboardScreen() {
  const { colors, palette, mode, toggleTheme, transition } = useTheme();
  const { items: packingItems, progressRatio: packingRatio } =
    usePackingContext();
  const {
    visits,
    progressRatio: visitsRatio,
    progressPercentage: visitsPctFromCtx,
  } = useVisitsContext();
  const { totalBudget, remainingBudget, usageRatio, totalSpent } =
    useBudgetContext();

  const packingPct = useMemo(
    () => Math.round((packingRatio || 0) * 100),
    [packingRatio],
  );
  const visitsPct = useMemo(() => {
    if (typeof visitsPctFromCtx === "number") return visitsPctFromCtx;
    return Math.round((visitsRatio || 0) * 100);
  }, [visitsPctFromCtx, visitsRatio]);

  const bgOpacityLight = useMemo(() => {
    return transition.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  }, [transition]);

  const bgOpacityDark = transition;

  const heroUri = useMemo(() => {
    return "https://res.cloudinary.com/drrmbeiyk/image/upload/v1774535574/bannerbaraya_npn2h0.webp";
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <RNAnimated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: palette.light.cream, opacity: bgOpacityLight },
        ]}
      />
      <RNAnimated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: palette.dark.darkBackground,
            opacity: bgOpacityDark,
          },
        ]}
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>Baraya</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Persiapan Mudik Berkah Hari Raya
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={toggleTheme}
            style={({ pressed }) => [
              styles.toggleBtn,
              {
                backgroundColor: mode === "dark" ? colors.emerald : colors.gold,
                borderColor: colors.border,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            <Ionicons
              name={mode === "dark" ? "sunny-outline" : "moon-outline"}
              size={18}
              color={colors.white}
            />
          </Pressable>
        </View>

        <View style={[styles.hero, { borderColor: colors.border }]}>
          <Image
            source={{ uri: heroUri }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroOrnament} pointerEvents="none" />
          <View style={styles.heroContent}>
            <Text style={[styles.heroTitle, { color: colors.white }]}>
              Bismillah
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.white }]}>
              Rencanakan perjalanan, jaga silaturahmi, dan catat anggaran dengan
              rapi.
            </Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View
            style={[
              styles.featureCard,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.iconPill,
                  { backgroundColor: "rgba(15,157,88,0.12)" },
                ]}
              >
                <Ionicons name="bag-outline" size={18} color={colors.emerald} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Packing
              </Text>
              <Text style={[styles.cardKpi, { color: colors.gold }]}>
                {packingPct}%
              </Text>
            </View>
            <Text style={[styles.cardSub, { color: colors.muted }]}>
              {packingItems.length} item • ceklist selesai
            </Text>
            <ProgressBar
              value={packingRatio || 0}
              style={styles.progressWrap}
            />
          </View>

          <View
            style={[
              styles.featureCard,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.iconPill,
                  { backgroundColor: "rgba(201,162,39,0.12)" },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colors.gold}
                />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Kunjungan
              </Text>
              <Text style={[styles.cardKpi, { color: colors.gold }]}>
                {visitsPct}%
              </Text>
            </View>
            <Text style={[styles.cardSub, { color: colors.muted }]}>
              {visits.length} tujuan • sudah dikunjungi
            </Text>
            <ProgressBar value={visitsRatio || 0} style={styles.progressWrap} />
          </View>

          <View
            style={[
              styles.featureCard,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.cardTop}>
              <View
                style={[
                  styles.iconPill,
                  { backgroundColor: "rgba(201,162,39,0.12)" },
                ]}
              >
                <Ionicons name="wallet-outline" size={18} color={colors.gold} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Anggaran
              </Text>
              <Text style={[styles.cardKpi, { color: colors.gold }]}>
                {Math.round((usageRatio || 0) * 100)}%
              </Text>
            </View>
            <View style={styles.budgetRow}>
              <View style={styles.budgetCol}>
                <Text style={[styles.budgetLabel, { color: colors.muted }]}>
                  Total
                </Text>
                <Text style={[styles.budgetValue, { color: colors.text }]}>
                  {formatIDR(totalBudget)}
                </Text>
              </View>
              <View style={styles.budgetCol}>
                <Text style={[styles.budgetLabel, { color: colors.muted }]}>
                  Sisa
                </Text>
                <Text style={[styles.budgetValue, { color: colors.emerald }]}>
                  {formatIDR(remainingBudget)}
                </Text>
              </View>
            </View>
            <Text style={[styles.cardSub, { color: colors.muted }]}>
              Terpakai: {formatIDR(totalSpent)}
            </Text>
            <ProgressBar value={usageRatio || 0} style={styles.progressWrap} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  toggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  hero: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden",
    height: 140,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  heroImage: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: undefined,
    height: undefined,
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  heroOrnament: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(201,162,39,0.08)",
    transform: [{ rotate: "12deg" }, { scale: 1.2 }],
    opacity: 0.6,
  },
  heroContent: {
    flex: 1,
    padding: 16,
    justifyContent: "flex-end",
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    opacity: 0.95,
  },

  grid: {
    marginTop: 12,
    gap: 12,
    paddingBottom: 16,
  },
  featureCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    overflow: "hidden",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconPill: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
  },
  cardKpi: {
    fontSize: 14,
    fontWeight: "900",
  },
  cardSub: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: "600",
  },

  progressWrap: {
    marginTop: 12,
  },

  budgetRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  budgetCol: {
    flex: 1,
  },
  budgetLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  budgetValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "900",
  },
});
