import { appConfigService } from "./service";

export interface GetAppConfigArgs {
  server: string;
  db: string;
  config: string;
}

export const resolvers = {
  Query: {
    GetAppConfig: (_: unknown, args: GetAppConfigArgs) => appConfigService.getConfig(args),
  },
};
