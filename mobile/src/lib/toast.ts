/**
 * Global toast channel. Anything (components, Apollo links) can call
 * `toast.success` / `toast.error`; the `ToastHost` mounted at the app root
 * renders them.
 */
export type ToastKind = "success" | "error";

export type ToastMessage = {
  id: number;
  kind: ToastKind;
  text: string;
};

type Listener = (message: ToastMessage) => void;

const listeners = new Set<Listener>();
let nextId = 1;

function emit(kind: ToastKind, text: string) {
  const message = { id: nextId++, kind, text };
  listeners.forEach((listener) => listener(message));
}

export const toast = {
  success: (text: string) => emit("success", text),
  error: (text: string) => emit("error", text),
};

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
