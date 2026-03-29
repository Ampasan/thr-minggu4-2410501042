import "react-native-gesture-handler";

import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";

import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { PackingProvider } from "./src/context/PackingContext";
import { VisitsProvider } from "./src/context/VisitsContext";
import { BudgetProvider } from "./src/context/BudgetContext";

enableScreens();

function AppContent() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="dark" />
      <AppNavigator />
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PackingProvider>
          <VisitsProvider>
            <BudgetProvider>
              <ThemeProvider>
                <AppContent />
              </ThemeProvider>
            </BudgetProvider>
          </VisitsProvider>
        </PackingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
