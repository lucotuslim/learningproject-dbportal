import { GraphQLModule } from "../../core/module";

import { typeDefs } from "./schema";
import { resolvers } from "./resolver";
import { loaders } from "./dataloader";

export const HCMCoreModule: GraphQLModule = {
  typeDefs,
  resolvers,
  loaders,
};

export default HCMCoreModule;
