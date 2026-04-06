export const resolvers = {
  Query: {
    serverprincipal: async (_: unknown, { server, db }: { server: string; db: string }) => {
      try {
        const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            server,
            db,
            q: `
                     select name , create_date, default_database_name  from sys.server_principals  
              `,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          // throw new Error(`ServerPrincipalApi failed: ${res.statusText}`);
          throw new Error(
            data?.error
              ? `ServerPrincipalApi failed: ${data.error} (${data.code})`
              : `ServerPrincipalApi failed: ${res.status} ${res.statusText}`
          );
        }
        return await res.json();
      } catch (err) {
        console.error("ServerPrincipalApi error:", err);
        throw err;
      }
    },

    serverprincipalByName: async (
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
                    select name , create_date, default_database_name  from sys.server_principals where name = '${name}'
              `,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          // throw new Error(`ServerPrincipalApi failed: ${res.statusText}`);
          throw new Error(
            data?.error
              ? `ServerPrincipalApi failed: ${data.error} (${data.code})`
              : `ServerPrincipalApi failed: ${res.status} ${res.statusText}`
          );
        }
        return await res.json();
      } catch (err) {
        console.error("ServerPrincipalApi error:", err);
        throw err;
      }
    },
  },
};
