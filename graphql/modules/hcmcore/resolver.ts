export const resolvers = {
  Query: {
    CoreHCMDatabaseInventory: async (
      _: unknown,
      { db, Environment }: { db: string; Environment: string }
    ) => {
      const sql = `
        select CorePreProd.ClientID,
   Env.[Namespace] as [Namespace],
    Env.ConstringDatabaseName as ConstringDatabaseName,
    Env.ConstringServerName as ConstringServerName,
    CorePreProd.Environment as HCMCoreEnvironment
  from [DFCoreHCMManagement].[dbo].[CoreHCMDatabaseInventory${Environment}] CorePreProd
  inner join ServerInventory..[Vw_MonolithConnectionStrings_${Environment}_Env] Env
  on CorePreProd.ClientId = Env.ClientID and
  CorePreProd.Namespace = Env.Namespace
  Where
   status ='Active'
   and CorePreProd.Environment = '${Environment}'
        `;

      const result = await fetch(`${process.env.APPDAPIROOT}/api/dbaserver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db: db,
          q: sql,
        }),

        // -- AND Namespace = '${Namespace}
      }).then((res) => res.json());
      return result;
    },

    CoreHCMDatabaseInventoryByClientIdArray: async (
      _: unknown,
      {
        db,
        ClientIds,
        Environment,
        ClientEnvironment,
      }: { db: string; ClientIds: number[]; Environment: string; ClientEnvironment: string }
    ) => {
      const clientidtext = ClientIds.join(",");
      let sql;
      console.log(`Dbenvironment is ${Environment} ClientEnv is ${ClientEnvironment}`);
      if (ClientEnvironment === "StaConTra") {
        sql = `
   select CorePreProd.ClientID,
   ConstringDatabaseName as Namespace,
    PreprodEnv.Environment,
    PreprodEnv.ConstringDatabaseName as ConstringDatabaseName,
    PreprodEnv.ConstringServerName as ConstringServerName,
    NULL as ISBI,
      NULL as ConnectionType,
        NULL as IsDecomm
  from [DFCoreHCMManagement].[dbo].[CoreHCMDatabaseInventoryPreProd] CorePreProd
  inner join ServerInventory..[Vw_MonolithConnectionStrings_Preprod_Env] PreprodEnv
  on CorePreProd.ClientId = PreprodEnv.ClientID and
  CorePreProd.Namespace = PreprodEnv.Namespace
  Where  CorePreProd.ClientID  in (${clientidtext})
  and status ='Active' and Environment in ('Train','Config','Stage') 
          `;
      } else {
        sql = `
        select CorePreProd.ClientID,
   Env.[Namespace] as [Namespace],
    Env.ConstringDatabaseName as ConstringDatabaseName,
    Env.ConstringServerName as ConstringServerName,
    CorePreProd.Environment as HCMCoreEnvironment
  from [DFCoreHCMManagement].[dbo].[CoreHCMDatabaseInventory${Environment}] CorePreProd
  inner join ServerInventory..[Vw_MonolithConnectionStrings_${Environment}_Env] Env
  on CorePreProd.ClientId = Env.ClientID and
  CorePreProd.Namespace = Env.Namespace
  Where  CorePreProd.ClientID  in (${clientidtext}) and
   status ='Active'
   and CorePreProd.Environment = '${Environment}'
        `;
      }

      const result = await fetch(`${process.env.APPDAPIROOT}/api/dbaserver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db: db,
          q: sql,
        }),

        // -- AND Namespace = '${Namespace}
      }).then((res) => res.json());
      return result;
    },
  },
};
