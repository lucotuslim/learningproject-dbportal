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
          const errBody = await res.json().catch(() => null);
          throw new Error(
            errBody?.error
              ? `DatabasePrincipalApi failed: ${errBody.error}`
              : `DatabasePrincipalApi failed with status ${res.status}`
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
          throw new Error(`DatabasePrincipalApi failed: ${res.statusText}`);
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
          throw new Error(`DatabasePrincipalApi failed: ${res.statusText}`);
        }
        return await res.json();
      } catch (err) {
        console.error("DatabasePrincipalApi error:", err);
        throw err;
      }
    },
  },
};
