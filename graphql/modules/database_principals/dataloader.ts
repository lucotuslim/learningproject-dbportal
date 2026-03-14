import DataLoader from "dataloader";

export const loaders = {
  configLoader: new DataLoader(async (keys: readonly string[]) => {
    // batch DB query
    return keys.map((key) => ({ key }));
  }),
};
