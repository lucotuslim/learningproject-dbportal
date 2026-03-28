import { GraphQLResolveInfo } from "graphql";
import graphqlFields from "graphql-fields";

export const resolvers = {
  Query: {
    customerSecurityGroups: async (
      _: unknown,
      {
        server,
        db,
        environment,
        domainprefix,
      }: { server: string; db: string; environment: string; domainprefix: string }
    ) => {
      try {
        let sql = "";

        if (environment === "preprod") {
          sql = `
                SELECT  [CustomerSecurityGroupsId]
      ,[GroupSID]
      ,[Environment]
      ,[Namespace]
      ,[ClientId]
      , '${domainprefix}' + [GroupName] as GroupName
      ,[MetaData]
      ,[CollectedTimestamp]
      ,[Permission]
      ,[IsDeleted]
  FROM [dbo].[CustomerSecurityGroups]
  where Environment  in ('Config','PreProd','StaConTra','Stage','Train') 
  and IsDeleted = 0
  and Namespace <> 'NULL'
  --and Namespace ='comptiainc' `;
        } else {
          sql = `
                SELECT  [CustomerSecurityGroupsId]
      ,[GroupSID]
      ,[Environment]
      ,[Namespace]
      ,[ClientId]
      , '${domainprefix}' + [GroupName] as GroupName
      ,[MetaData]
      ,[CollectedTimestamp]
      ,[Permission]
      ,[IsDeleted]
  FROM [dbo].[CustomerSecurityGroups]
  where Environment = '${environment}'
  and IsDeleted = 0
  and Namespace <> 'NULL'
  --and Namespace ='comptiainc'
              `;
        }
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            server,
            db,
            q: sql,
          }),
        });

        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          throw new Error(
            errBody?.error
              ? `GetAppConfig failed: ${errBody.error}`
              : `GetAppConfig failed with status ${res.status}`
          );
        }

        return await res.json();
      } catch (err) {
        console.error("GetAppConfig error:", err);
        throw err;
      }
    },

    customerSecurityGroupByClientIdName: async (
      _: unknown,
      {
        server,
        db,
        environment,
        ClientId,
        Namespace,
        domainprefix,
      }: {
        server: string;
        db: string;
        environment: string;
        ClientId: number;
        Namespace: string;
        domainprefix: string;
      }
    ) => {
      try {
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            server,
            db,
            q: `
                SELECT [CustomerSecurityGroupsId]
      ,[GroupSID]
      ,[Environment]
      ,[Namespace]
      ,[ClientId]
      , '${domainprefix}' + [GroupName] as GroupName
      ,[MetaData]
      ,[CollectedTimestamp]
      ,[Permission]
      ,[IsDeleted]
  FROM [dbo].[CustomerSecurityGroups]
  where Environment = '${environment}'
  and ClientId = ${ClientId}
  and Namespace = '${Namespace}'
              `,
          }),
        });
        if (!res.ok) {
          throw new Error(`GetAppConfig failed: ${res.statusText}`);
        }
        return await res.json();
      } catch (err) {
        console.error("GetAppConfig error:", err);
        throw err;
      }
    },

    CoreHCMDatabaseInventoryByClientIdArray: async (
      _: unknown,
      {
        db,
        ClientIds,
        Environment,
        ClientEnvironment,
      }: { db: string; ClientIds: number[]; Environment: string; ClientEnvironment: string },
      __: unknown,
      info: GraphQLResolveInfo
    ) => {
      const fields = Object.keys(graphqlFields(info));
      const sqlColumns = fields.map((f) => `[${f}]`).join(", ");
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
        SELECT 
             ${sqlColumns}
           FROM MonolithConnectionStrings_${Environment}
            WHERE ClientID  in (${clientidtext})
            and IsDecomm = 0 
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
