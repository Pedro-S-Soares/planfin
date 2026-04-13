import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { storage } from "../lib/storage";
import { apolloClient } from "../lib/apollo";

type User = {
  id: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore token from storage on app start
    storage.getItem("auth_token").then((storedToken) => {
      if (storedToken) {
        setToken(storedToken);
        // User will be fetched by screens that need it via `me` query
      }
      setIsLoading(false);
    });
  }, []);

  const signIn = useCallback(async (newToken: string, newUser: User) => {
    await storage.setItem("auth_token", newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const signOut = useCallback(async () => {
    await storage.deleteItem("auth_token");
    setToken(null);
    setUser(null);
    await apolloClient.clearStore();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
