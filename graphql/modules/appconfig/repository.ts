export const repository = {
  async getConfig(server: string, db: string, config: string) {
    const res = await fetch(`${process.env.APPDAPIROOT}/api/clientdb`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        server,
        db,
        q: `
        SELECT
          ConfigId,
          ConfigSection,
          ConfigJson,
          CreatedAt,
          UpdatedAt
        FROM dbo.AppConfig
        WHERE ConfigSection='${config}'
        `,
      }),
    });

    return res.json();
  },
};
