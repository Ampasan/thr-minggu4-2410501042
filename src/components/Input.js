import { useMemo } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "../context/ThemeContext";

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  secureTextEntry,
  multiline,
  numberOfLines,
  left,
  right,
  hint,
  error,
  disabled,
  containerStyle,
  inputStyle,
  labelStyle,
  onFocus,
  onBlur,
  ...rest
}) {
  const { colors } = useTheme();
  const isDisabled = Boolean(disabled);
  const hasError = typeof error === "string" && error.trim().length > 0;

  const focus = useSharedValue(0);

  const fieldStyle = useMemo(() => {
    return [
      styles.field,
      {
        backgroundColor: colors.surface,
        borderColor: hasError ? "#EF4444" : colors.border,
        opacity: isDisabled ? 0.75 : 1,
      },
    ];
  }, [colors.border, colors.surface, hasError, isDisabled]);

  const animatedFieldStyle = useAnimatedStyle(() => {
    const activeBorder = hasError ? "#EF4444" : colors.emerald;
    const inactiveBorder = hasError ? "#EF4444" : colors.border;
    const borderColor = interpolateColor(
      focus.value,
      [0, 1],
      [inactiveBorder, activeBorder],
    );

    return {
      borderColor,
      transform: [{ scale: 1 + 0.01 * focus.value }],
    };
  }, [colors.border, colors.emerald, hasError]);

  const textStyle = useMemo(() => {
    return [
      styles.input,
      {
        color: colors.text,
      },
      multiline ? styles.multiline : null,
      inputStyle,
    ];
  }, [colors.text, inputStyle, multiline]);

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={[styles.label, { color: colors.text }, labelStyle]}>
          {label}
        </Text>
      ) : null}

      <Animated.View style={[fieldStyle, animatedFieldStyle]}>
        {left ? <View style={styles.affix}>{left}</View> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          editable={!isDisabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={textStyle}
          onFocus={(e) => {
            focus.value = withTiming(1, { duration: 160 });
            onFocus?.(e);
          }}
          onBlur={(e) => {
            focus.value = withTiming(0, { duration: 180 });
            onBlur?.(e);
          }}
          {...rest}
        />
        {right ? <View style={styles.affix}>{right}</View> : null}
      </Animated.View>

      {hasError ? (
        <Text style={[styles.help, { color: "#EF4444" }]}>{error}</Text>
      ) : null}
      {!hasError && hint ? (
        <Text style={[styles.help, { color: colors.muted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
  },
  field: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
    fontWeight: "700",
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  affix: {
    alignItems: "center",
    justifyContent: "center",
  },
  help: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
});
