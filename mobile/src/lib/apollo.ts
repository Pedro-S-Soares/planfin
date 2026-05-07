import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { storage } from "./storage";
import { logger } from "./logger";

let onAuthErrorCallback: (() => void) | null = null;

/** Registrado pelo AuthProvider para forçar logout em erro de autenticação */
export function setOnAuthError(cb: () => void) {
  onAuthErrorCallback = cb;
}

const TIMEOUT_MS = 30_000;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(id));
}

const httpLink = createHttpLink({
  uri: `${process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000"}/api/graphql`,
  fetch: fetchWithTimeout,
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

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (networkError) {
    logger.error("Apollo:NetworkError", operation.operationName, networkError.message);
  }

  if (graphQLErrors) {
    graphQLErrors.forEach((err) => {
      const isAuth =
        err.message.toLowerCase().includes("not authenticated") ||
        err.extensions?.code === "UNAUTHENTICATED";

      if (isAuth) {
        onAuthErrorCallback?.();
      } else {
        logger.error("Apollo:GraphQLError", operation.operationName, {
          message: err.message,
          extensions: err.extensions,
        });
      }
    });
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
