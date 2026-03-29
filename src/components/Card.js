import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function Card({
  children,
  style,
  contentStyle,
  onPress,
  disabled,
  padding = 16,
  radius = 18,
  border = true,
  shadow = true,
  pressable = Boolean(onPress),
  hitSlop = 8,
  accessibilityLabel,
}) {
  const { colors } = useTheme();
  const isDisabled = Boolean(disabled);

  const scale = useSharedValue(1);
  const pressOpacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: pressOpacity.value,
    };
  });

  const baseStyle = useMemo(() => {
    return [
      styles.base,
      border ? { borderWidth: 1, borderColor: colors.border } : null,
      shadow ? styles.shadow : null,
      {
        borderRadius: radius,
        backgroundColor: colors.surface,
        overflow: "hidden",
      },
      style,
    ];
  }, [border, colors.border, colors.surface, radius, shadow, style]);

  const innerStyle = useMemo(() => {
    return [
      {
        padding,
      },
      contentStyle,
    ];
  }, [contentStyle, padding]);

  if (!pressable) {
    return (
      <View style={baseStyle}>
        <View style={innerStyle}>{children}</View>
      </View>
    );
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={isDisabled}
      hitSlop={hitSlop}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.99, { damping: 18, stiffness: 240 });
        pressOpacity.value = withTiming(0.94, { duration: 90 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 240 });
        pressOpacity.value = withTiming(1, { duration: 140 });
      }}
      style={[baseStyle, animatedStyle]}
    >
      <View style={innerStyle}>{children}</View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {},
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
});
