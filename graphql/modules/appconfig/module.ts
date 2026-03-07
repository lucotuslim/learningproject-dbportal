import { GraphQLModule } from "../../core/module";
import { typeDefs } from "./schema";
import { resolvers } from "./resolver";
import { loaders } from "./dataloader";

export const appConfigModule: GraphQLModule = {
  typeDefs,
  resolvers,
  loaders,
};
