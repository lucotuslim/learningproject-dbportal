import { DocumentNode } from "graphql";
import { IResolvers } from "@graphql-tools/utils";

export interface GraphQLModule {
  typeDefs: string | DocumentNode;
  resolvers: IResolvers;
  loaders?: Record<string, unknown>;
}
