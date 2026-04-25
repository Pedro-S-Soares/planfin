import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

const STORE_KEY = "pf_currency";

export type CurrencyCode = "BRL" | "USD" | "EUR" | "JPY";

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  label: string;
  flag: string;
};

export const CURRENCIES: Currency[] = [
  { code: "BRL", symbol: "R$", label: "Real",  flag: "🇧🇷" },
  { code: "USD", symbol: "$",  label: "Dólar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€",  label: "Euro",  flag: "🇪🇺" },
  { code: "JPY", symbol: "¥",  label: "Iene",  flag: "🇯🇵" },
];

type CurrencyContextValue = {
  currency: Currency;
  setCurrencyCode: (code: CurrencyCode) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [code, setCode] = useState<CurrencyCode>("BRL");

  useEffect(() => {
    SecureStore.getItemAsync(STORE_KEY).then((stored) => {
      if (stored && CURRENCIES.find((c) => c.code === stored)) {
        setCode(stored as CurrencyCode);
      }
    });
  }, []);

  const setCurrencyCode = useCallback((next: CurrencyCode) => {
    setCode(next);
    SecureStore.setItemAsync(STORE_KEY, next);
  }, []);

  const currency = CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyCode }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
