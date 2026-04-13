import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { storage } from "./storage";

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

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
