import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { storage } from "../lib/storage";
import { apolloClient, setOnAuthError } from "../lib/apollo";

type User = {
  id: string;
  email: string;
  name?: string | null;
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      storage.getItem("auth_token"),
      storage.getItem("auth_user"),
    ]).then(([storedToken, storedUser]) => {
      if (storedToken) setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // ignore malformed user data
        }
      }
      setIsLoading(false);
    });
  }, []);

  const signIn = useCallback(async (newToken: string, newUser: User) => {
    await Promise.all([
      storage.setItem("auth_token", newToken),
      storage.setItem("auth_user", JSON.stringify(newUser)),
    ]);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const updateUser = useCallback(async (patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...patch };
      storage.setItem("auth_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const signOut = useCallback(async () => {
    await Promise.all([
      storage.deleteItem("auth_token"),
      storage.deleteItem("auth_user"),
    ]);
    setToken(null);
    setUser(null);
    await apolloClient.clearStore();
  }, []);

  useEffect(() => {
    setOnAuthError(() => signOut());
  }, [signOut]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
