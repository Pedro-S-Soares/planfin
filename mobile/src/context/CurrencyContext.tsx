import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { storage } from "../lib/storage";

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
    // Through `storage`: expo-secure-store has no web implementation (it threw
    // "ExpoSecureStore.getValueWithKeyAsync is not a function" on every web load).
    storage
      .getItem(STORE_KEY)
      .then((stored) => {
        const match = CURRENCIES.find((c) => c.code === stored);
        if (match) setCode(match.code);
      })
      .catch((error: unknown) => console.error("Failed to read the saved currency", error));
  }, []);

  const setCurrencyCode = useCallback((next: CurrencyCode) => {
    setCode(next);
    storage
      .setItem(STORE_KEY, next)
      .catch((error: unknown) => console.error("Failed to save the currency", error));
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
