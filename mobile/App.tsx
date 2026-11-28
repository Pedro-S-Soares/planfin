import "./global.css";
import { ApolloProvider } from "@apollo/client/react";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { Platform, StyleSheet, View } from "react-native";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { GroupProvider, useGroup } from "./src/context/GroupContext";
import { CurrencyProvider } from "./src/context/CurrencyContext";
import { LoadingScreen } from "./src/components/ui/LoadingScreen";
import { ErrorScreen } from "./src/components/ui/ErrorScreen";
import { ToastHost } from "./src/components/ui/ToastHost";
import { UpdateBanner } from "./src/components/ui/UpdateBanner";
import { apolloClient } from "./src/lib/apollo";
import { LoginScreen } from "./src/screens/LoginScreen";
import { InviteRegisterScreen } from "./src/screens/InviteRegisterScreen";
import { AdminInvitesScreen } from "./src/screens/AdminInvitesScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "./src/screens/ResetPasswordScreen";
import { CreatePeriodScreen } from "./src/screens/CreatePeriodScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
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
import { BillsScreen } from "./src/modules/finance/BillsScreen";
import { BillFormScreen } from "./src/modules/finance/BillFormScreen";
import { PayBillScreen } from "./src/modules/finance/PayBillScreen";
import { SkipBillScreen } from "./src/modules/finance/SkipBillScreen";
import { SalarySettingsScreen } from "./src/modules/finance/SalarySettingsScreen";
import { MonthPlanScreen } from "./src/modules/finance/MonthPlanScreen";
import type { AccountKind } from "./src/modules/finance/format";
import type { CategoryFilter } from "./src/modules/history/category-filter";
import { font, palette, useThemeFonts } from "./src/theme";
import { Icon, type IconName } from "./src/components/ui/Icon";
import { SHEET_ROUTE_OPTIONS, sheetScreen } from "./src/components/ui/SheetScreen";
import { AddTabButton } from "./src/modules/history/components/AddTabButton";
import { useQuickEntry } from "./src/modules/history/use-quick-entry";

enableScreens();

export type AuthStackParamList = {
  Login: undefined;
  InviteRegister: { token: string };
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type { EntryFormParams } from "./src/modules/history/entry-types";

export type AppStackParamList = {
  Onboarding: undefined;
  CreatePeriod: undefined;
  MainTabs: undefined;
  Groups: undefined;
  Profile: undefined;
  AdminInvites: undefined;
  EditPeriod: undefined;
  Periods: undefined;
  AccountForm: { accountId?: string; kind?: AccountKind };
  AccountDetail: { accountId: string };
  AdjustBalance: { accountId: string; balance: string };
  CardDetail: { cardId: string };
  Invoice: { cardId: string; month: string };
  PayInvoice: { cardId: string; month: string; remaining: string };
  Bills: { month?: string } | undefined;
  BillForm: { billId?: string; direction?: "expense" | "income"; once?: boolean; month?: string; dueDay?: number };
  PayBill: {
    billId: string;
    month: string;
    amount: string;
    name: string;
    isCard: boolean;
    isIncome?: boolean;
    /** A planned one-off without a day: registering it is the real purchase. */
    isPlanned?: boolean;
    /** Card of the bill, to name its invoice by the due month. */
    cardId?: string;
  };
  SkipBill: { billId: string; month: string; name: string; isCard: boolean };
  SalarySettings: undefined;
  MonthPlan: undefined;
  Transfer: {
    fromAccountId?: string;
    toAccountId?: string;
    amount?: string;
    kind?: "card_payment" | "allowance" | "reserve" | "other";
    note?: string;
  };
  CategoryDetail: { categoryId: string; range: RangeKey };
  Categories: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  /** `category`: open filtered by it (from a category of the Painel). */
  History: { category?: CategoryFilter } | undefined;
  Add: undefined;
  Accounts: undefined;
  Dashboard: undefined;
};

/** Stack header in the theme: white bar, title in Manrope, back arrow in accent, a rule below. */
const HEADER_OPTIONS = {
  headerShown: true,
  headerStyle: { backgroundColor: palette.sheet },
  headerTintColor: palette.accent,
  headerTitleStyle: { ...font("bold"), fontSize: 18, color: palette.ink },
  headerShadowVisible: false,
};

function modalOptions(title: string) {
  return { ...HEADER_OPTIONS, presentation: "modal" as const, title };
}

/** Create/edit routes open as the bottom sheet over the screen they came from. */
const AccountFormSheet = sheetScreen(AccountFormScreen, "Conta");
const AdjustBalanceSheet = sheetScreen(AdjustBalanceScreen, "Ajustar saldo");
const PayInvoiceSheet = sheetScreen(PayInvoiceScreen, "Pagar fatura");
const TransferSheet = sheetScreen(TransferScreen, "Transferir");
const BillFormSheet = sheetScreen(BillFormScreen, "Item planejado");
const PayBillSheet = sheetScreen(PayBillScreen, "Registrar pagamento");
const SkipBillSheet = sheetScreen(SkipBillScreen, "Pular despesa fixa");
const EditPeriodSheet = sheetScreen(EditPeriodScreen, "Editar período");
const CreatePeriodSheet = sheetScreen(CreatePeriodScreen, "Novo planejamento");

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

/** Outline icon at rest, filled when the tab is the current one. */
function tabIcon(outline: IconName, filled: IconName) {
  return function TabIcon({ focused, color }: { focused: boolean; color: string }) {
    return <Icon name={focused ? filled : outline} size={24} color={color} />;
  };
}

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
  const quickEntry = useQuickEntry();

  return (
    <>
    <MainTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.sheet,
          borderTopColor: palette.rule,
          borderTopWidth: 1,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
          height: tabBarHeight,
        },
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.muted,
        tabBarLabelStyle: {
          ...font("semibold"),
          fontSize: 12,
        },
      }}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Hoje", tabBarIcon: tabIcon("home-variant-outline", "home-variant") }}
      />
      <MainTab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: "Histórico", tabBarIcon: tabIcon("format-list-bulleted", "format-list-bulleted") }}
      />
      <MainTab.Screen
        name="Add"
        component={EmptyTab}
        options={{
          tabBarLabel: "Lançar",
          tabBarAccessibilityLabel: "Lançar gasto ou receita",
          tabBarButton: () => <AddTabButton onPress={quickEntry.open} />,
        }}
        listeners={{ tabPress: (event) => event.preventDefault() }}
      />
      <MainTab.Screen
        name="Accounts"
        component={AccountsScreen}
        options={{ tabBarLabel: "Contas", tabBarIcon: tabIcon("wallet-outline", "wallet") }}
      />
      <MainTab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: "Painel", tabBarIcon: tabIcon("chart-box-outline", "chart-box") }}
      />
    </MainTab.Navigator>
    {quickEntry.sheetElement}
    </>
  );
}

/** The [+] tab never shows a screen: its button opens the entry sheet instead. */
function EmptyTab() {
  return null;
}

function AppNavigator() {
  const { hasActivePeriod, isLoading, error, refetch } = usePeriod();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen onRetry={refetch} />;

  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      {!hasActivePeriod ? (
        <>
          <AppStack.Screen name="CreatePeriod" component={CreatePeriodScreen} />
          <AppStack.Screen name="MonthPlan" component={MonthPlanScreen} options={pushOptions("Planejamento")} />
          <AppStack.Screen name="SalarySettings" component={SalarySettingsScreen} options={pushOptions("Salário e ciclo")} />
        </>
      ) : (
        <>
          <AppStack.Screen name="MainTabs" component={MainTabs} />
          <AppStack.Screen
            name="Profile"
            component={ProfileScreen}
            options={pushOptions("Perfil")}
          />
          <AppStack.Screen
            name="AdminInvites"
            component={AdminInvitesScreen}
            options={pushOptions("Convites")}
          />
          <AppStack.Screen
            name="Groups"
            component={GroupsScreen}
            options={pushOptions("Grupos")}
          />
          <AppStack.Screen
            name="EditPeriod"
            component={EditPeriodSheet}
            options={SHEET_ROUTE_OPTIONS}
          />
          <AppStack.Screen
            name="CategoryDetail"
            component={CategoryDetailScreen}
            options={{ headerShown: false }}
          />
          <AppStack.Screen
            name="Periods"
            component={PeriodsScreen}
            options={pushOptions("Planejamentos")}
          />
          <AppStack.Screen
            name="CreatePeriod"
            component={CreatePeriodSheet}
            options={SHEET_ROUTE_OPTIONS}
          />
          <AppStack.Screen name="Categories" component={CategoriesScreen} options={pushOptions("Categorias")} />
          <AppStack.Screen name="AccountForm" component={AccountFormSheet} options={SHEET_ROUTE_OPTIONS} />
          <AppStack.Screen name="AccountDetail" component={AccountDetailScreen} options={pushOptions("Conta")} />
          <AppStack.Screen name="AdjustBalance" component={AdjustBalanceSheet} options={SHEET_ROUTE_OPTIONS} />
          <AppStack.Screen name="CardDetail" component={CardDetailScreen} options={pushOptions("Cartão")} />
          <AppStack.Screen name="Invoice" component={InvoiceScreen} options={pushOptions("Fatura")} />
          <AppStack.Screen name="PayInvoice" component={PayInvoiceSheet} options={SHEET_ROUTE_OPTIONS} />
          <AppStack.Screen name="Transfer" component={TransferSheet} options={SHEET_ROUTE_OPTIONS} />
          <AppStack.Screen name="Bills" component={BillsScreen} options={pushOptions("Fixas, avulsas e entradas")} />
          <AppStack.Screen name="BillForm" component={BillFormSheet} options={SHEET_ROUTE_OPTIONS} />
          <AppStack.Screen name="PayBill" component={PayBillSheet} options={SHEET_ROUTE_OPTIONS} />
          <AppStack.Screen name="SkipBill" component={SkipBillSheet} options={SHEET_ROUTE_OPTIONS} />
          <AppStack.Screen name="SalarySettings" component={SalarySettingsScreen} options={pushOptions("Salário e ciclo")} />
          <AppStack.Screen name="MonthPlan" component={MonthPlanScreen} options={pushOptions("Planejamento")} />
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

// On a wide screen (desktop browser) the app keeps a phone-like column, centered,
// instead of stretching lists to the full window.
const frameStyles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.rule },
  frame: { flex: 1, width: "100%", maxWidth: 560, alignSelf: "center", backgroundColor: palette.paper, overflow: "hidden" },
});

export default function App() {
  // Native waits for Manrope (a missing font family errors there); the web draws with the
  // system font until the Google Fonts stylesheet arrives.
  const isFontReady = useThemeFonts();
  if (!isFontReady) return null;

  return (
    <SafeAreaProvider>
      <ApolloProvider client={apolloClient}>
        <CurrencyProvider>
          <AuthProvider>
            <View style={frameStyles.page}>
              <View style={frameStyles.frame}>
                <NavigationContainer linking={linking}>
                  <Navigation />
                </NavigationContainer>
                <ToastHost />
                <UpdateBanner />
              </View>
            </View>
            <StatusBar style="auto" />
          </AuthProvider>
        </CurrencyProvider>
      </ApolloProvider>
    </SafeAreaProvider>
  );
}
