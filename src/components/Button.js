import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getButtonTokens({ colors, variant, tone }) {
  const v = variant ?? "solid";
  const t = tone ?? "primary";

  const primary = colors.emerald;
  const accent = colors.gold;
  const danger = "#DC2626";

  const solidBg = t === "accent" ? accent : t === "danger" ? danger : primary;
  const solidText = colors.white;

  const outlineBorder =
    t === "accent" ? accent : t === "danger" ? danger : primary;
  const outlineText = outlineBorder;

  if (v === "outline") {
    return {
      bg: "transparent",
      border: outlineBorder,
      text: outlineText,
    };
  }

  if (v === "ghost") {
    return {
      bg: "transparent",
      border: "transparent",
      text: outlineText,
    };
  }

  return { bg: solidBg, border: solidBg, text: solidText };
}

function getSizeTokens(size) {
  switch (size) {
    case "sm":
      return { height: 40, px: 12, radius: 12, fontSize: 14, iconGap: 8 };
    case "lg":
      return { height: 52, px: 16, radius: 16, fontSize: 16, iconGap: 10 };
    default:
      return { height: 46, px: 14, radius: 14, fontSize: 15, iconGap: 10 };
  }
}

export default function Button({
  title,
  children,
  onPress,
  disabled,
  loading,
  variant = "solid",
  tone = "primary",
  size = "md",
  left,
  right,
  style,
  textStyle,
  hitSlop = 8,
  accessibilityLabel,
}) {
  const { colors } = useTheme();

  const sizeTk = useMemo(() => getSizeTokens(size), [size]);
  const tokens = useMemo(
    () => getButtonTokens({ colors, variant, tone }),
    [colors, tone, variant],
  );
  const isDisabled = Boolean(disabled || loading);
  const labelText = title ?? children;
  const hasLabel =
    (typeof labelText === "string" && labelText.trim().length > 0) ||
    (typeof labelText === "number" && Number.isFinite(labelText));
  const showLabel = hasLabel || Boolean(loading);

  const scale = useSharedValue(1);
  const pressOpacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: pressOpacity.value,
    };
  });

  const baseBtnStyle = useMemo(() => {
    return [
      styles.btn,
      {
        height: sizeTk.height,
        paddingHorizontal: sizeTk.px,
        borderRadius: sizeTk.radius,
        backgroundColor: isDisabled ? colors.border : tokens.bg,
        borderColor: isDisabled ? colors.border : tokens.border,
      },
      variant === "ghost" ? styles.ghost : null,
      style,
    ];
  }, [
    colors.border,
    isDisabled,
    sizeTk.height,
    sizeTk.px,
    sizeTk.radius,
    style,
    tokens.bg,
    tokens.border,
    variant,
  ]);

  const labelStyle = useMemo(() => {
    return [
      styles.label,
      {
        color: isDisabled ? colors.muted : tokens.text,
        fontSize: sizeTk.fontSize,
      },
      textStyle,
    ];
  }, [colors.muted, isDisabled, sizeTk.fontSize, textStyle, tokens.text]);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? (typeof title === "string" ? title : undefined)
      }
      hitSlop={hitSlop}
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 18, stiffness: 260 });
        pressOpacity.value = withTiming(0.92, { duration: 90 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 260 });
        pressOpacity.value = withTiming(1, { duration: 140 });
      }}
      style={[baseBtnStyle, animatedStyle]}
    >
      <View style={[styles.row, { gap: showLabel ? sizeTk.iconGap : 0 }]}>
        {left ? <View style={styles.iconSlot}>{left}</View> : null}
        {showLabel ? (
          <Text numberOfLines={1} style={labelStyle}>
            {labelText}
            {loading ? "…" : ""}
          </Text>
        ) : null}
        {right ? <View style={styles.iconSlot}>{right}</View> : null}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ghost: {
    borderWidth: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontWeight: "800",
  },
  iconSlot: {
    alignItems: "center",
    justifyContent: "center",
  },
});
