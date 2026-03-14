import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { baseTypeDefs } from "./baseSchema";
import { modules } from "../modules";

export const typeDefs = mergeTypeDefs([baseTypeDefs, ...modules.map((m) => m.typeDefs)]);

export const resolvers = mergeResolvers(modules.map((m) => m.resolvers));

export const loaders = modules.reduce<Record<string, unknown>>((acc, m) => {
  if (m.loaders) Object.assign(acc, m.loaders);
  return acc;
}, {});
