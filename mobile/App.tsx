import "./global.css";
import { ApolloProvider } from "@apollo/client/react";
import { NavigationContainer, LinkingOptions } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { Text } from "react-native";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { GroupProvider, useGroup } from "./src/context/GroupContext";
import { apolloClient } from "./src/lib/apollo";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "./src/screens/ResetPasswordScreen";
import { CreatePeriodScreen } from "./src/screens/CreatePeriodScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { AddExpenseScreen } from "./src/screens/AddExpenseScreen";
import { EditExpenseScreen } from "./src/screens/EditExpenseScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { CategoriesScreen } from "./src/screens/CategoriesScreen";
import { OnboardingGroupScreen } from "./src/screens/OnboardingGroupScreen";
import { GroupsScreen } from "./src/screens/GroupsScreen";
import { usePeriod } from "./src/context/PeriodContext";
import { PeriodProvider } from "./src/context/PeriodContext";

enableScreens();

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type AppStackParamList = {
  Onboarding: undefined;
  CreatePeriod: undefined;
  MainTabs: undefined;
  Groups: undefined;
  AddExpense: undefined;
  EditExpense: {
    id: string;
    amount: string;
    date: string;
    note?: string;
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
  prefixes: ["planfin://"],
  config: {
    screens: {
      ResetPassword: "reset-password/:token",
    },
  },
};

function MainTabs() {
  return (
    <MainTab.Navigator screenOptions={{ headerShown: false }}>
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Hoje" , tabBarIcon: () => <Text>💰</Text> }}
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
  const { hasActivePeriod, isLoading } = usePeriod();

  if (isLoading) return null;

  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      {!hasActivePeriod ? (
        <AppStack.Screen name="CreatePeriod" component={CreatePeriodScreen} />
      ) : (
        <>
          <AppStack.Screen name="MainTabs" component={MainTabs} />
          <AppStack.Screen
            name="Groups"
            component={GroupsScreen}
            options={{ headerShown: true, title: "Grupos" }}
          />
          <AppStack.Screen
            name="AddExpense"
            component={AddExpenseScreen}
            options={{ presentation: "modal", headerShown: true, title: "Novo gasto" }}
          />
          <AppStack.Screen
            name="EditExpense"
            component={EditExpenseScreen}
            options={{ presentation: "modal", headerShown: true, title: "Editar gasto" }}
          />
        </>
      )}
    </AppStack.Navigator>
  );
}

function AuthenticatedNavigator() {
  const { activeGroup, isLoading } = useGroup();

  if (isLoading) return null;

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

  if (isLoading) return null;

  if (!token) {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
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
        <AuthProvider>
          <NavigationContainer linking={linking}>
            <Navigation />
          </NavigationContainer>
          <StatusBar style="auto" />
        </AuthProvider>
      </ApolloProvider>
    </SafeAreaProvider>
  );
}
