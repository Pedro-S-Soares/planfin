import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
// @ts-ignore - apollo v4 types
import * as SecureStore from "expo-secure-store";

const httpLink = createHttpLink({
  uri: `${process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000"}/api/graphql`,
});

const authLink = setContext(async (_, { headers }) => {
  const token = await SecureStore.getItemAsync("auth_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
