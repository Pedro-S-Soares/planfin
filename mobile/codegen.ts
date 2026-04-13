import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: process.env.EXPO_PUBLIC_API_URL
    ? `${process.env.EXPO_PUBLIC_API_URL}/api/graphql`
    : "http://localhost:4000/api/graphql",
  documents: ["src/graphql/**/*.graphql"],
  generates: {
    "src/graphql/__generated__/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
    "src/graphql/__generated__/hooks.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
      },
    },
  },
};

export default config;
