import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { loadFilesSync } from "@graphql-tools/load-files";
import path from "path";
import { baseTypeDefs } from "./baseSchema";

const modules = loadFilesSync(path.join(process.cwd(), "src/graphql/modules/**/*.ts"), {
  ignoreIndex: true,
});

export const typeDefs = mergeTypeDefs([baseTypeDefs, ...modules.map((m) => m.typeDefs)]);

export const resolvers = mergeResolvers(modules.map((m) => m.resolvers));
