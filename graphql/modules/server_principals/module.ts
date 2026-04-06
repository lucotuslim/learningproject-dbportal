import { GraphQLModule } from "../../core/module";

import { typeDefs } from "./schema";
import { resolvers } from "./resolver";
import { loaders } from "./dataloader";

export const serverprincipalsModule: GraphQLModule = {
  typeDefs,
  resolvers,
  loaders,
};

export default serverprincipalsModule;
