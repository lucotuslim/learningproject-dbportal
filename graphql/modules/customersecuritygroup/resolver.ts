// import { GraphQLResolveInfo } from "graphql";
// import graphqlFields from "graphql-fields";

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
  },
};
