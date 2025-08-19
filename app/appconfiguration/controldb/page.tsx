"use client"
import React from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { IapiControlDbUrl, IapiControlDbUrlWithSqlServer} from "@/interfaces/controldb";
import { ApiRequest } from "@/lib/utils";
import { ISqlServerInstance } from "@/interfaces/generic";

const apiControlDbUrl: IapiControlDbUrl[] = process.env.NEXT_PUBLIC_CONTROLSERVERAPI
  ? process.env.NEXT_PUBLIC_CONTROLSERVERAPI.split(',').map(url => ({ Controldburl: url }))
  : [];

export default function ApiDiv() {
  const [data, setData] = React.useState<IapiControlDbUrlWithSqlServer[]>([]);

React.useEffect(() => {
  const fetchData = async () => {
    const results = await Promise.all(
      apiControlDbUrl.map(async (url) => {
        try {
          const result = await ApiRequest<ISqlServerInstance>(url.Controldburl);
          return result.items.map((item: ISqlServerInstance) => ({
            ...item,
            message: result.message || "",
            error: result.error || false,
            Controldburl: url.Controldburl,
          }));
        } catch (err) {
          console.error(`Error fetching from ${url.Controldburl}:`, err);
          return [{
            message: err instanceof Error ? err.message : "Unknown error",
            error: true,
            Controldburl: url.Controldburl,
          }];
        }
      })
    );
    // Flatten results
    const controldbs = results.flat();
    console.log("Fetched data:", controldbs);
    setData(controldbs);
  };
  fetchData();
}, [apiControlDbUrl]);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}



