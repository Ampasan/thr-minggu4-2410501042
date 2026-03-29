import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { Animated, Easing } from "react-native";
import { getData, saveData } from "../utils/storage";

const STORAGE_KEY = "@baraya/theme-mode";

const palette = {
  light: {
    emerald: "#0F9D58",
    gold: "#C9A227",
    white: "#FFFFFF",
    cream: "#F6F0E6",
  },
  dark: {
    darkEmerald: "#22C55E",
    mutedGold: "#EAB308",
    darkBackground: "#1E293B",
  },
};

function getColors(mode) {
  if (mode === "dark") {
    return {
      emerald: palette.dark.darkEmerald,
      gold: palette.dark.mutedGold,
      white: "#F8FAFC",
      cream: "#F6F0E6",
      background: palette.dark.darkBackground,
      surface: "#424f63",
      text: "#F8FAFC",
      muted: "#d9e1ec",
      border: "#475569",
    };
  }

  return {
    emerald: palette.light.emerald,
    gold: palette.light.gold,
    white: palette.light.white,
    cream: palette.light.cream,
    background: palette.light.cream,
    surface: palette.light.white,
    text: "#1F2937",
    muted: "#6B7280",
    border: "#E5E7EB",
  };
}

const ThemeContext = createContext(null);

function themeReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_THEME": {
      const nextMode = action.payload;
      if (nextMode === "light" || nextMode === "dark") {
        return { ...state, mode: nextMode };
      }
      return { ...state, mode: state.mode === "light" ? "dark" : "light" };
    }
    default:
      return state;
  }
}

export function ThemeProvider({ children }) {
  const [state, dispatch] = useReducer(themeReducer, { mode: "light" });

  const transition = useMemo(
    () => new Animated.Value(state.mode === "dark" ? 1 : 0),
    [],
  );

  useEffect(() => {
    Animated.timing(transition, {
      toValue: state.mode === "dark" ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [state.mode, transition]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const storedMode = await getData(STORAGE_KEY);
        if (!mounted) return;
        if (storedMode === "dark" || storedMode === "light") {
          dispatch({ type: "TOGGLE_THEME", payload: storedMode });
        }
      } catch (e) {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const colors = useMemo(() => getColors(state.mode), [state.mode]);

  const toggleTheme = useCallback(async () => {
    const nextMode = state.mode === "light" ? "dark" : "light";
    dispatch({ type: "TOGGLE_THEME", payload: nextMode });
    try {
      await saveData(STORAGE_KEY, nextMode);
    } catch (e) {}
  }, [state.mode]);

  const value = useMemo(() => {
    return {
      mode: state.mode,
      colors,
      palette,
      toggleTheme,
      transition,
      isDark: state.mode === "dark",
    };
  }, [colors, state.mode, toggleTheme, transition]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme harus digunakan di dalam ThemeProvider");
  return ctx;
}

export default ThemeContext;
