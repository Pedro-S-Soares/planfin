import { useCallback, useState, type Dispatch, type SetStateAction } from "react";

// Lives as long as the app is open: a reload (or a new session) starts from the defaults.
const store = new Map<string, unknown>();

/**
 * useState that survives leaving the screen, only for this session: the last filters of
 * a screen come back when it is opened again. `key` names the screen (and its subject,
 * e.g. the card of an invoice).
 */
export function useSessionState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => (store.has(key) ? (store.get(key) as T) : initial));

  const set = useCallback<Dispatch<SetStateAction<T>>>(
    (next) => {
      setValue((current) => {
        const resolved = typeof next === "function" ? (next as (prev: T) => T)(current) : next;
        store.set(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, set];
}
