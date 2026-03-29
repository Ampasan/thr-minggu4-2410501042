import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

function clamp01(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export default function ProgressBar({
  value = 0,
  height = 10,
  radius = 999,
  duration = 420,
  showLabel = false,
  label,
  color,
  trackColor,
  style,
  labelStyle,
}) {
  const { colors } = useTheme();
  const ratio = useMemo(() => clamp01(value), [value]);

  const trackWidth = useSharedValue(0);
  const p = useSharedValue(ratio);

  useEffect(() => {
    p.value = withTiming(ratio, { duration });
  }, [duration, p, ratio]);

  const fillStyle = useAnimatedStyle(() => {
    return { width: trackWidth.value * p.value };
  });

  const pctText = `${Math.round(ratio * 100)}%`;
  const resolvedTrack = trackColor ?? "rgba(0,0,0,0.06)";
  const resolvedFill = color ?? colors.emerald;

  return (
    <View style={style}>
      {showLabel ? (
        <Text style={[styles.label, { color: colors.muted }, labelStyle]}>
          {label ?? pctText}
        </Text>
      ) : null}

      <View
        style={[
          styles.track,
          {
            height,
            borderRadius: radius,
            backgroundColor: resolvedTrack,
          },
        ]}
        onLayout={(e) => {
          trackWidth.value = e.nativeEvent.layout.width;
        }}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              height,
              borderRadius: radius,
              backgroundColor: resolvedFill,
            },
            fillStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "700",
  },
  track: {
    overflow: "hidden",
  },
  fill: {},
});
