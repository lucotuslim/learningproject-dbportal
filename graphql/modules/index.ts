import appConfigModule from "./appconfig/module";
import customersecuritygroupModule from "./customersecuritygroup/module";
import databaseprincipalsModule from "./database_principals/module";
import HCMCoreModule from "./hcmcore/module";
import serverprincipalsModule from "./server_principals/module";

export const modules = [
  appConfigModule,
  customersecuritygroupModule,
  databaseprincipalsModule,
  HCMCoreModule,
  serverprincipalsModule,
];
