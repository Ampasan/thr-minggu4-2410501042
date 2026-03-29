import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import DashboardScreen from "../screens/DashboardScreen";
import PackingScreen from "../screens/PackingScreen";
import VisitsScreen from "../screens/VisitsScreen";
import BudgetScreen from "../screens/BudgetScreen";
import { useTheme } from "../context/ThemeContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabsNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const iconByRoute = {
    Dashboard: "home-outline",
    Packing: "bag-outline",
    Visit: "calendar-outline",
    Budget: "wallet-outline",
  };

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 40 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 10),
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.emerald,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontWeight: "700",
          fontSize: 12,
          marginTop: 2,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconName = iconByRoute[route.name] ?? "ellipse-outline";
          const iconSize = focused ? 30 : Math.max(size ?? 24, 28);
          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <Tab.Screen
        name="Packing"
        component={PackingScreen}
        options={{ title: "Packing" }}
      />
      <Tab.Screen
        name="Visit"
        component={VisitsScreen}
        options={{ title: "Kunjungan" }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ title: "Anggaran" }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors } = useTheme();

  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      primary: colors.emerald,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabsNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
