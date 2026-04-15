import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { storage } from "./storage";

let onAuthErrorCallback: (() => void) | null = null;

/** Registrado pelo AuthProvider para forçar logout em erro de autenticação */
export function setOnAuthError(cb: () => void) {
  onAuthErrorCallback = cb;
}

const httpLink = createHttpLink({
  uri: `${process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000"}/api/graphql`,
});

const authLink = setContext(async (_, { headers }) => {
  const token = await storage.getItem("auth_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(({ graphQLErrors }) => {
  if (!graphQLErrors) return;

  const isAuthError = graphQLErrors.some(
    (err) =>
      err.message.toLowerCase().includes("not authenticated") ||
      err.extensions?.code === "UNAUTHENTICATED",
  );

  if (isAuthError && onAuthErrorCallback) {
    onAuthErrorCallback();
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
