import "./global.css";
import { ApolloProvider } from "@apollo/client/react";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { Text, Platform } from "react-native";

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
import { DashboardScreen } from "./src/modules/dashboard/DashboardScreen";
import { CategoryDetailScreen } from "./src/modules/dashboard/CategoryDetailScreen";
import type { RangeKey } from "./src/modules/dashboard/types";
import { AccountsScreen } from "./src/modules/finance/AccountsScreen";
import { AccountFormScreen } from "./src/modules/finance/AccountFormScreen";
import { AccountDetailScreen } from "./src/modules/finance/AccountDetailScreen";
import { AdjustBalanceScreen } from "./src/modules/finance/AdjustBalanceScreen";
import { CardDetailScreen } from "./src/modules/finance/CardDetailScreen";
import { InvoiceScreen } from "./src/modules/finance/InvoiceScreen";
import { PayInvoiceScreen } from "./src/modules/finance/PayInvoiceScreen";
import { TransferScreen } from "./src/modules/finance/TransferScreen";
import type { AccountKind } from "./src/modules/finance/format";

enableScreens();

export type AuthStackParamList = {
  Login: undefined;
  InviteRegister: { token: string };
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

/** Optional presets when opening the new expense/income form. */
export type EntryFormParams =
  | {
      accountId?: string;
      /** Start with "counts in budget" off (old purchases, salary, bills). */
      outsideBudget?: boolean;
      date?: string;
    }
  | undefined;

export type AppStackParamList = {
  Onboarding: undefined;
  CreatePeriod: undefined;
  MainTabs: undefined;
  Groups: undefined;
  Profile: undefined;
  AdminInvites: undefined;
  EditPeriod: undefined;
  Periods: undefined;
  AddExpense: EntryFormParams;
  EditExpense: {
    id: string;
    amount: string;
    date: string;
    note?: string;
    isExtra?: boolean;
    subcategoryId?: string;
    categoryId?: string;
    accountId?: string;
    countsInBudget?: boolean;
  };
  AddIncome: EntryFormParams;
  AccountForm: { accountId?: string; kind?: AccountKind };
  AccountDetail: { accountId: string };
  AdjustBalance: { accountId: string; balance: string };
  CardDetail: { cardId: string };
  Invoice: { cardId: string; month: string };
  PayInvoice: { cardId: string; month: string; remaining: string };
  Transfer: {
    fromAccountId?: string;
    toAccountId?: string;
    amount?: string;
    kind?: "card_payment" | "allowance" | "reserve" | "other";
    note?: string;
  };
  CategoryDetail: { categoryId: string; range: RangeKey };
  EditIncome: {
    id: string;
    amount: string;
    date: string;
    note?: string;
    isExtra?: boolean;
    subcategoryId?: string;
    categoryId?: string;
    accountId?: string;
    countsInBudget?: boolean;
  };
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Accounts: undefined;
  Dashboard: undefined;
  Categories: undefined;
};

function modalOptions(title: string) {
  return {
    presentation: "modal" as const,
    headerShown: true,
    title,
    headerStyle: { backgroundColor: "#FFFFFF" },
    headerTintColor: "#6255EA",
    headerTitleStyle: { color: "#17162B", fontWeight: "700" as const },
    headerShadowVisible: false,
  };
}

function pushOptions(title: string) {
  return { ...modalOptions(title), presentation: "card" as const };
}

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
  // On web: env(safe-area-inset-bottom) may return 0 in some Android browsers even with
  // viewport-fit=cover. Use 24px minimum so labels always clear the gesture navigation bar.
  // On native: 8px minimum is enough since insets.bottom is reliably detected.
  const minBottomPad = Platform.OS === "web" ? 24 : 8;
  const tabBarPaddingBottom = Math.max(insets.bottom, minBottomPad);
  // Base height of 64 ensures buttons have 41px of usable space for icon+label
  // after accounting for both the outer tabBarStyle padding (8+paddingBottom)
  // and the BottomTabBar internal button padding (7.5+7.5).
  const tabBarHeight = 64 + tabBarPaddingBottom;

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
        name="Accounts"
        component={AccountsScreen}
        options={{ tabBarLabel: "Contas", tabBarIcon: () => <Text>💳</Text> }}
      />
      <MainTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: "Dashboard", tabBarIcon: () => <Text>📊</Text> }}
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
            name="CategoryDetail"
            component={CategoryDetailScreen}
            options={{ headerShown: false }}
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
          <AppStack.Screen name="AccountForm" component={AccountFormScreen} options={modalOptions("Conta")} />
          <AppStack.Screen name="AccountDetail" component={AccountDetailScreen} options={pushOptions("Conta")} />
          <AppStack.Screen name="AdjustBalance" component={AdjustBalanceScreen} options={modalOptions("Ajustar saldo")} />
          <AppStack.Screen name="CardDetail" component={CardDetailScreen} options={pushOptions("Cartão")} />
          <AppStack.Screen name="Invoice" component={InvoiceScreen} options={pushOptions("Fatura")} />
          <AppStack.Screen name="PayInvoice" component={PayInvoiceScreen} options={modalOptions("Pagar fatura")} />
          <AppStack.Screen name="Transfer" component={TransferScreen} options={modalOptions("Transferir")} />
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
