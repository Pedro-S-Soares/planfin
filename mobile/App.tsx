import { ApolloProvider } from "@apollo/client/react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { apolloClient } from "./src/lib/apollo";
import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { HomeScreen } from "./src/screens/HomeScreen";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type AppStackParamList = {
  Home: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function Navigation() {
  const { token, isLoading } = useAuth();

  if (isLoading) return null;

  if (!token) {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
        <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </AuthStack.Navigator>
    );
  }

  return (
    <AppStack.Navigator>
      <AppStack.Screen name="Home" component={HomeScreen} />
    </AppStack.Navigator>
  );
}

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
        <StatusBar style="auto" />
      </AuthProvider>
    </ApolloProvider>
  );
}
