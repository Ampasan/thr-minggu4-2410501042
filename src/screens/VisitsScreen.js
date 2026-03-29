import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useTheme } from "../context/ThemeContext";
import { useVisits } from "../hooks/useVisits";

import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Button from "../components/Button";
import Input from "../components/Input";
import ProgressBar from "../components/ProgressBar";

function VisitItem({ visit, onToggle, onDelete, colors }) {
  const sv = useSharedValue(visit.visited ? 1 : 0);

  const emerald = colors.emerald;
  const gold = colors.gold;
  const border = colors.border;

  useEffect(() => {
    sv.value = withTiming(visit.visited ? 1 : 0, { duration: 240 });
  }, [visit.visited, sv]);

  const badgeStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(
      sv.value,
      [0, 1],
      ["rgba(201,162,39,0.12)", "rgba(15,157,88,0.14)"],
    );
    const bd = interpolateColor(sv.value, [0, 1], [gold, emerald]);
    return {
      backgroundColor: bg,
      borderColor: bd,
    };
  }, [emerald, gold]);

  const dotStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(sv.value, [0, 1], [gold, emerald]);
    return {
      backgroundColor: bg,
      transform: [{ scale: 0.9 + 0.1 * sv.value }],
    };
  }, [emerald, gold]);

  const label = visit.visited ? "Sudah" : "Belum";

  return (
    <View
      style={[
        styles.itemCard,
        { borderColor: border, backgroundColor: colors.surface },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => onToggle(visit.id)}
        style={({ pressed }) => [
          styles.itemMain,
          {
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.995 : 1 }],
          },
        ]}
      >
        <View style={styles.itemTextWrap}>
          <Text
            style={[styles.itemName, { color: colors.text }]}
            numberOfLines={1}
          >
            {visit.name}
          </Text>
          <Text
            style={[styles.itemAddr, { color: colors.muted }]}
            numberOfLines={1}
          >
            {visit.address || "—"}
          </Text>
        </View>

        <Animated.View style={[styles.badge, badgeStyle]}>
          <Animated.View style={[styles.badgeDot, dotStyle]} />
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={() => onDelete(visit.id)}
        style={({ pressed }) => [
          styles.deleteBtn,
          {
            borderColor: border,
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

export default function VisitsScreen() {
  const { colors } = useTheme();
  const { visits, addVisit, toggleVisit, deleteVisit, progress } = useVisits();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const disabled = useMemo(() => name.trim().length === 0, [name]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Ionicons name="calendar-outline" size={22} color={colors.emerald} />
        <Text style={[styles.title, { color: colors.text }]}>
          Kunjungan Keluarga
        </Text>
      </View>

      <View
        style={[
          styles.progressCard,
          { borderColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        <View style={styles.progressRow}>
          <Text style={[styles.progressTitle, { color: colors.text }]}>
            Progress Kunjungan
          </Text>
          <Text style={[styles.progressPct, { color: colors.gold }]}>
            {Math.round(progress)}%
          </Text>
        </View>
        <ProgressBar
          value={Math.max(0, Math.min(100, progress)) / 100}
          style={{ marginTop: 10 }}
        />
        <Text style={[styles.progressHint, { color: colors.muted }]}>
          Niat baik, mempererat tali silaturahmi.
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { borderColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        <View style={styles.patternOverlay} pointerEvents="none" />

        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Tambah tujuan
        </Text>
        <View style={styles.form}>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Nama keluarga"
          />
          <Input
            value={address}
            onChangeText={setAddress}
            placeholder="Alamat"
          />

          <View style={styles.formRow}>
            <View
              style={[
                styles.countPill,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.countText, { color: colors.text }]}>
                Total: {visits.length}
              </Text>
            </View>

            <Button
              disabled={disabled}
              onPress={() => {
                addVisit({ name, address, visited: false });
                setName("");
                setAddress("");
              }}
              title=""
              left={<Ionicons name="add" size={18} color={colors.white} />}
              style={styles.iconBtn}
            />
          </View>
        </View>
      </View>

      <FlatList
        style={{ marginTop: 12 }}
        data={visits}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.empty, { color: colors.muted }]}>
              Belum ada tujuan kunjungan.
            </Text>
            <Text style={[styles.emptySub, { color: colors.muted }]}>
              Tambahkan nama & alamat, lalu toggle status “Sudah”.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 90 }}
        renderItem={({ item }) => (
          <VisitItem
            visit={item}
            onToggle={toggleVisit}
            onDelete={deleteVisit}
            colors={colors}
          />
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

  progressCard: {
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
  progressTrack: {
    marginTop: 12,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  progressFill: {
    height: 10,
    borderRadius: 999,
  },
  progressHint: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
  },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
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

  form: {
    marginTop: 12,
    gap: 10,
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    fontSize: 14,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtn: {
    width: 44,
    height: 44,
    paddingHorizontal: 0,
    borderRadius: 14,
  },
  countPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  countText: {
    fontSize: 14,
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
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  itemMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  itemTextWrap: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "800",
  },
  itemAddr: {
    marginTop: 4,
    fontSize: 13,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  badgeText: {
    fontWeight: "900",
    fontSize: 12,
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
