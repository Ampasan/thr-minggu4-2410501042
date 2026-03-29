import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../context/ThemeContext';
import { usePackingList } from '../hooks/usePackingList';
import Button from '../components/Button';
import Input from '../components/Input';
import ProgressBar from '../components/ProgressBar';

function AnimatedCheckbox({ checked, onPress, colors }) {
  const progress = useSharedValue(checked ? 1 : 0);
  const emerald = colors.emerald;
  const border = colors.border;

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 220 });
  }, [checked, progress]);

  const boxStyle = useAnimatedStyle(() => {
    const bg = interpolateColor(progress.value, [0, 1], ['rgba(0,0,0,0)', emerald]);
    const borderColor = interpolateColor(progress.value, [0, 1], [border, emerald]);
    return {
      backgroundColor: bg,
      borderColor,
      transform: [{ scale: 1 + 0.08 * progress.value }],
    };
  }, [emerald, border]);

  const checkStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{ scale: 0.7 + 0.3 * progress.value }],
    };
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
    >
      <Animated.View style={[styles.checkboxBox, boxStyle]}>
        <Animated.View style={[styles.checkboxCheck, checkStyle]}>
          <Ionicons name="checkmark" size={16} color={colors.white} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

function PackingItem({ item, onToggle, onDelete, colors }) {
  const rowBg = colors.surface;

  return (
    <View
      style={[
        styles.itemCard,
        {
          backgroundColor: rowBg,
          borderColor: colors.border,
        },
      ]}
    >
      <AnimatedCheckbox checked={item.checked} onPress={() => onToggle(item.id)} colors={colors} />

      <View style={styles.itemTextWrap}>
        <Text
          numberOfLines={1}
          style={[
            styles.itemText,
            {
              color: colors.text,
              textDecorationLine: item.checked ? 'line-through' : 'none',
              opacity: item.checked ? 0.7 : 1,
            },
          ]}
        >
          {item.name}
        </Text>
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

export default function PackingScreen() {
  const { colors } = useTheme();
  const { items, addItem, toggleItem, deleteItem, progressPercentage } = usePackingList();

  const [text, setText] = useState('');

  const checkedCount = useMemo(() => items.filter((it) => it.checked).length, [items]);
  const totalCount = items.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bag-outline" size={22} color={colors.emerald} />
          <Text style={[styles.title, { color: colors.text }]}>Packing Checklist</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {checkedCount}/{totalCount}
          </Text>
        </View>
      </View>

      <View style={[styles.progressCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={styles.progressRow}>
          <Text style={[styles.progressTitle, { color: colors.text }]}>Progress</Text>
          <Text style={[styles.progressPct, { color: colors.gold }]}>{Math.round(progressPercentage)}%</Text>
        </View>
        <ProgressBar value={Math.max(0, Math.min(100, progressPercentage)) / 100} style={{ marginTop: 10 }} />
        <Text style={[styles.progressHint, { color: colors.muted }]}>
          Centang item untuk memastikan semuanya siap.
        </Text>
      </View>

      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={styles.patternOverlay} pointerEvents="none" />

        <Text style={[styles.cardTitle, { color: colors.text }]}>Tambah barang</Text>

        <View style={styles.inputRow}>
          <Input
            value={text}
            onChangeText={setText}
            placeholder="Contoh: Baju"
            containerStyle={{ flex: 1 }}
          />

          <Button
            disabled={text.trim().length === 0}
            onPress={() => {
              addItem(text);
              setText('');
            }}
            title=""
            left={<Ionicons name="add" size={18} color={colors.white} />}
            style={styles.iconBtn}
          />
        </View>
      </View>

      <FlatList
        style={{ marginTop: 12 }}
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 90 }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.empty, { color: colors.muted }]}>Belum ada checklist.</Text>
            <Text style={[styles.emptySub, { color: colors.muted }]}>
              Tambahkan item, lalu centang untuk mengisi progress.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <PackingItem item={item} onToggle={toggleItem} onDelete={deleteItem} colors={colors} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontWeight: '800',
  },
  progressCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressPct: {
    fontSize: 14,
    fontWeight: '900',
  },
  progressHint: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  progressTrack: {
    marginTop: 12,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 10,
    borderRadius: 999,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  patternOverlay: {
    position: 'absolute',
    inset: -20,
    backgroundColor: 'rgba(201,162,39,0.06)',
    transform: [{ rotate: '15deg' }],
  },
  inputRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    paddingHorizontal: 0,
    borderRadius: 14,
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  empty: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptySub: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  checkboxBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCheck: {
    position: 'absolute',
  },
  itemTextWrap: {
    flex: 1,
  },
  itemText: {
    fontSize: 15,
    fontWeight: '650',
  },
  deleteBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
