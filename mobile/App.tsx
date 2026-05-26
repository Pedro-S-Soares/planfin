import "./global.css";
import { ApolloProvider } from "@apollo/client/react";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { Text } from "react-native";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { GroupProvider, useGroup } from "./src/context/GroupContext";
import { CurrencyProvider } from "./src/context/CurrencyContext";
import { LoadingScreen } from "./src/components/ui/LoadingScreen";
import { ErrorScreen } from "./src/components/ui/ErrorScreen";
import { apolloClient } from "./src/lib/apollo";
import { LoginScreen } from "./src/screens/LoginScreen";
import { InviteRegisterScreen } from "./src/screens/InviteRegisterScreen";
import { AdminInvitesScreen } from "./src/screens/AdminInvitesScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "./src/screens/ResetPasswordScreen";
import { CreatePeriodScreen } from "./src/screens/CreatePeriodScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { AddExpenseScreen } from "./src/screens/AddExpenseScreen";
import { EditExpenseScreen } from "./src/screens/EditExpenseScreen";
import { AddIncomeScreen } from "./src/screens/AddIncomeScreen";
import { EditIncomeScreen } from "./src/screens/EditIncomeScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { CategoriesScreen } from "./src/screens/CategoriesScreen";
import { OnboardingGroupScreen } from "./src/screens/OnboardingGroupScreen";
import { GroupsScreen } from "./src/screens/GroupsScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { EditPeriodScreen } from "./src/screens/EditPeriodScreen";
import { PeriodsScreen } from "./src/screens/PeriodsScreen";
import { usePeriod } from "./src/context/PeriodContext";
import { PeriodProvider } from "./src/context/PeriodContext";

enableScreens();

export type AuthStackParamList = {
  Login: undefined;
  InviteRegister: { token: string };
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type AppStackParamList = {
  Onboarding: undefined;
  CreatePeriod: undefined;
  MainTabs: undefined;
  Groups: undefined;
  Profile: undefined;
  AdminInvites: undefined;
  EditPeriod: undefined;
  Periods: undefined;
  AddExpense: undefined;
  EditExpense: {
    id: string;
    amount: string;
    date: string;
    note?: string;
    isExtra?: boolean;
    subcategoryId?: string;
    categoryId?: string;
  };
  AddIncome: undefined;
  EditIncome: {
    id: string;
    amount: string;
    date: string;
    note?: string;
    isExtra?: boolean;
    subcategoryId?: string;
    categoryId?: string;
  };
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Categories: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const linking: LinkingOptions<AuthStackParamList> = {
  prefixes: [
    "planfin://",
    "https://planfin.app.br",
    "https://mobile-steel-nine.vercel.app",
    "https://mobile-pedro-s-soares-projects.vercel.app",
  ],
  config: {
    screens: {
      ResetPassword: "reset-password/:token",
      InviteRegister: "invite/:token",
    },
  },
};

function MainTabs() {
  const insets = useSafeAreaInsets();
  const tabBarPaddingBottom = Math.max(insets.bottom, 8);
  const tabBarHeight = 52 + tabBarPaddingBottom;

  return (
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E4E2F0",
          borderTopWidth: 1,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
          height: tabBarHeight,
        },
        tabBarActiveTintColor: "#6255EA",
        tabBarInactiveTintColor: "#ADABCA",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.1,
        },
      }}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Hoje", tabBarIcon: () => <Text>🏠</Text> }}
      />
      <MainTab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: "Histórico", tabBarIcon: () => <Text>📋</Text> }}
      />
      <MainTab.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{ tabBarLabel: "Categorias", tabBarIcon: () => <Text>🏷️</Text> }}
      />
    </MainTab.Navigator>
  );
}

function AppNavigator() {
  const { hasActivePeriod, isLoading, error, refetch } = usePeriod();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={refetch} />;

  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      {!hasActivePeriod ? (
        <AppStack.Screen name="CreatePeriod" component={CreatePeriodScreen} />
      ) : (
        <>
          <AppStack.Screen name="MainTabs" component={MainTabs} />
          <AppStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <AppStack.Screen
            name="AdminInvites"
            component={AdminInvitesScreen}
            options={{ headerShown: false }}
          />
          <AppStack.Screen
            name="Groups"
            component={GroupsScreen}
            options={{
              headerShown: true,
              title: "Grupos",
              headerStyle: { backgroundColor: "#FFFFFF" },
              headerTintColor: "#6255EA",
              headerTitleStyle: { color: "#17162B", fontWeight: "800" },
              headerShadowVisible: false,
            }}
          />
          <AppStack.Screen
            name="EditPeriod"
            component={EditPeriodScreen}
            options={{
              presentation: "modal",
              headerShown: true,
              title: "Editar período",
              headerStyle: { backgroundColor: "#FFFFFF" },
              headerTintColor: "#6255EA",
              headerTitleStyle: { color: "#17162B", fontWeight: "700" },
              headerShadowVisible: false,
            }}
          />
          <AppStack.Screen
            name="Periods"
            component={PeriodsScreen}
            options={{ headerShown: false }}
          />
          <AppStack.Screen
            name="CreatePeriod"
            component={CreatePeriodScreen}
            options={{
              presentation: "modal",
              headerShown: true,
              title: "Novo planejamento",
              headerStyle: { backgroundColor: "#FFFFFF" },
              headerTintColor: "#6255EA",
              headerTitleStyle: { color: "#17162B", fontWeight: "700" },
              headerShadowVisible: false,
            }}
          />
          <AppStack.Screen
            name="AddExpense"
            component={AddExpenseScreen}
            options={{
              presentation: "modal",
              headerShown: true,
              title: "Novo gasto",
              headerStyle: { backgroundColor: "#FFFFFF" },
              headerTintColor: "#6255EA",
              headerTitleStyle: { color: "#17162B", fontWeight: "700" },
              headerShadowVisible: false,
            }}
          />
          <AppStack.Screen
            name="EditExpense"
            component={EditExpenseScreen}
            options={{
              presentation: "modal",
              headerShown: true,
              title: "Editar gasto",
              headerStyle: { backgroundColor: "#FFFFFF" },
              headerTintColor: "#6255EA",
              headerTitleStyle: { color: "#17162B", fontWeight: "700" },
              headerShadowVisible: false,
            }}
          />
          <AppStack.Screen
            name="AddIncome"
            component={AddIncomeScreen}
            options={{
              presentation: "modal",
              headerShown: true,
              title: "Nova receita",
              headerStyle: { backgroundColor: "#FFFFFF" },
              headerTintColor: "#6255EA",
              headerTitleStyle: { color: "#17162B", fontWeight: "700" },
              headerShadowVisible: false,
            }}
          />
          <AppStack.Screen
            name="EditIncome"
            component={EditIncomeScreen}
            options={{
              presentation: "modal",
              headerShown: true,
              title: "Editar receita",
              headerStyle: { backgroundColor: "#FFFFFF" },
              headerTintColor: "#6255EA",
              headerTitleStyle: { color: "#17162B", fontWeight: "700" },
              headerShadowVisible: false,
            }}
          />
        </>
      )}
    </AppStack.Navigator>
  );
}

function AuthenticatedNavigator() {
  const { activeGroup, isLoading, error, refetch } = useGroup();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={refetch} />;

  if (!activeGroup) {
    return (
      <AppStack.Navigator screenOptions={{ headerShown: false }}>
        <AppStack.Screen name="Onboarding" component={OnboardingGroupScreen} />
      </AppStack.Navigator>
    );
  }

  return (
    <PeriodProvider>
      <AppNavigator />
    </PeriodProvider>
  );
}

function Navigation() {
  const { token, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;

  if (!token) {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="InviteRegister" component={InviteRegisterScreen} />
        <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      </AuthStack.Navigator>
    );
  }

  return (
    <GroupProvider>
      <AuthenticatedNavigator />
    </GroupProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ApolloProvider client={apolloClient}>
        <CurrencyProvider>
          <AuthProvider>
            <NavigationContainer linking={linking}>
              <Navigation />
            </NavigationContainer>
            <StatusBar style="auto" />
          </AuthProvider>
        </CurrencyProvider>
      </ApolloProvider>
    </SafeAreaProvider>
  );
}
