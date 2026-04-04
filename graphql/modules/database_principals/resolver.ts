export const resolvers = {
  Query: {
    databaseprincipal: async (_: unknown, { server, db }: { server: string; db: string }) => {
      try {
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            server,
            db,
            q: `
            select name, type_desc , default_schema_name, create_date, modify_date, sid from sys.database_principals
              `,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          // throw new Error(`DatabasePrincipalApi failed: ${res.statusText}`);
          throw new Error(
            data?.error
              ? `DatabasePrincipalApi failed: ${data.error} (${data.code})`
              : `DatabasePrincipalApi failed: ${res.status} ${res.statusText}`
          );
        }
        return await res.json();
      } catch (err) {
        console.error("DatabasePrincipalApi error:", err);
        throw err;
      }
    },

    databaseprincipalByName: async (
      _: unknown,
      { server, db, name }: { server: string; db: string; name: string }
    ) => {
      try {
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            server,
            db,
            q: `
            select name, type_desc , default_schema_name, create_date, modify_date, sid from sys.database_principals
            where name ='${name}'
              `,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          // throw new Error(`DatabasePrincipalApi failed: ${res.statusText}`);
          throw new Error(
            data?.error
              ? `DatabasePrincipalApi failed: ${data.error} (${data.code})`
              : `DatabasePrincipalApi failed: ${res.status} ${res.statusText}`
          );
        }
        return await res.json();
      } catch (err) {
        console.error("DatabasePrincipalApi error:", err);
        throw err;
      }
    },
    databaseprincipalByNameType: async (
      _: unknown,
      { server, db, name, type }: { server: string; db: string; name: string; type: string }
    ) => {
      try {
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            server,
            db,
            q: `
            select name, type_desc , default_schema_name, create_date, modify_date, sid from sys.database_principals
            where name ='${name}'
            and type_desc = '${type}'
              `,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          // throw new Error(`DatabasePrincipalApi failed: ${res.statusText}`);
          throw new Error(
            data?.error
              ? `DatabasePrincipalApi failed: ${data.error} (${data.code})`
              : `DatabasePrincipalApi failed: ${res.status} ${res.statusText}`
          );
        }
        return await res.json();
      } catch (err) {
        console.error("DatabasePrincipalApi error:", err);
        throw err;
      }
    },
  },
};
